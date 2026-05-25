import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";
import matter from "gray-matter";
import { scoreSkillTrust, trustTier } from "@modelbound/skill-trust";
import { estimateTokens, bucketForSkill } from "@modelbound/token-budgets";
import { AuthService } from "./auth/deviceFlow";
import { Telemetry } from "./telemetry";

const SKILL_GLOB = "**/SKILL.md";

let diagnostics: vscode.DiagnosticCollection;
let statusItem: vscode.StatusBarItem;

interface SkillScan {
  uri: vscode.Uri;
  name: string;
  description: string;
  total: number;
  tier: "green" | "amber" | "red";
  tokens: number;
  bucket: "green" | "amber" | "red";
}

export async function activate(ctx: vscode.ExtensionContext) {
  const cfg = vscode.workspace.getConfiguration("modelbound");
  const apiBaseUrl = cfg.get<string>("apiBaseUrl")!;
  const webBaseUrl = cfg.get<string>("webBaseUrl")!;

  const auth = new AuthService(ctx, apiBaseUrl, webBaseUrl);
  const telemetry = new Telemetry(ctx, apiBaseUrl, () => auth.getApiKey());

  diagnostics = vscode.languages.createDiagnosticCollection("modelbound");
  ctx.subscriptions.push(diagnostics);

  statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusItem.command = "modelbound.scanWorkspace";
  statusItem.text = "$(shield) ModelBound";
  statusItem.show();
  ctx.subscriptions.push(statusItem);

  // Commands
  ctx.subscriptions.push(
    vscode.commands.registerCommand("modelbound.connect", async () => {
      await telemetry.track("command_invoked", { command: "connect" });
      const key = await auth.connect();
      if (key) await telemetry.track("connected");
    }),
    vscode.commands.registerCommand("modelbound.signOut", async () => {
      await telemetry.track("sign_out");
      await auth.signOut();
    }),
    vscode.commands.registerCommand("modelbound.scanWorkspace", async () => {
      await telemetry.track("command_invoked", { command: "scan" });
      await scanWorkspace(telemetry);
    }),
    vscode.commands.registerCommand("modelbound.openInWeb", async (skill?: SkillScan) => {
      await telemetry.track("deep_link_opened");
      const target = skill ?? (await pickSkill());
      if (!target) return;
      const url = `${webBaseUrl}/skills?name=${encodeURIComponent(target.name)}`;
      await vscode.env.openExternal(vscode.Uri.parse(url));
    }),
  );

  // Rescan on save
  ctx.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (doc) => {
      if (doc.fileName.endsWith("SKILL.md")) {
        await scanFile(doc.uri, telemetry);
      }
    }),
  );

  // Initial activation events
  void telemetry.track("activated");
  if (!(await auth.getApiKey())) {
    void telemetry.track("installed"); // best-effort first-run ping
    const choice = await vscode.window.showInformationMessage(
      "ModelBound: local Skill checks are active. Connect to unlock AI Review and Marketplace.",
      "Connect",
      "Later",
    );
    if (choice === "Connect") void vscode.commands.executeCommand("modelbound.connect");
  }

  void scanWorkspace(telemetry);
}

async function scanWorkspace(telemetry: Telemetry): Promise<void> {
  const files = await vscode.workspace.findFiles(SKILL_GLOB, "**/node_modules/**", 500);
  const results: SkillScan[] = [];
  for (const uri of files) {
    const r = await scanFile(uri, telemetry);
    if (r) results.push(r);
  }
  detectDuplicates(results);
  updateStatus(results);
}

async function scanFile(uri: vscode.Uri, telemetry: Telemetry): Promise<SkillScan | null> {
  let raw: string;
  try {
    raw = await fs.readFile(uri.fsPath, "utf8");
  } catch {
    return null;
  }
  const parsed = matter(raw);
  const fm = (parsed.data || {}) as Record<string, any>;
  const name = String(fm.name || path.basename(path.dirname(uri.fsPath)));
  const description = String(fm.description || "");
  const allowed_tools: string[] = Array.isArray(fm.allowed_tools) ? fm.allowed_tools : [];

  const trust = scoreSkillTrust({ name, description, body_md: parsed.content, allowed_tools });
  const tokens = estimateTokens(parsed.content);
  const bucket = bucketForSkill("system-prompts", tokens);

  // Surface findings as diagnostics
  const diags: vscode.Diagnostic[] = trust.findings.map((f) => {
    const sev =
      f.severity === "critical"
        ? vscode.DiagnosticSeverity.Error
        : f.severity === "warn"
          ? vscode.DiagnosticSeverity.Warning
          : vscode.DiagnosticSeverity.Information;
    const d = new vscode.Diagnostic(new vscode.Range(0, 0, 0, 1), `[${f.class}] ${f.message}`, sev);
    d.source = "ModelBound";
    return d;
  });
  diagnostics.set(uri, diags);

  if (trust.findings.length > 0) {
    void telemetry.track("finding_shown", { count: trust.findings.length, tier: trustTier(trust.total) });
  }
  if (allowed_tools.length > 0) {
    void telemetry.track("tool_audit_warning", { tools: allowed_tools.length });
  }
  void telemetry.track("skill_scanned", { tokens, bucket, total: trust.total });

  return {
    uri,
    name,
    description,
    total: trust.total,
    tier: trustTier(trust.total),
    tokens,
    bucket,
  };
}

function detectDuplicates(results: SkillScan[]) {
  // Very lightweight: flag exact name collisions across the workspace.
  const byName = new Map<string, SkillScan[]>();
  for (const r of results) {
    const arr = byName.get(r.name) ?? [];
    arr.push(r);
    byName.set(r.name, arr);
  }
  for (const [, arr] of byName) {
    if (arr.length < 2) continue;
    for (const r of arr) {
      const existing = diagnostics.get(r.uri) ?? [];
      const d = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 1),
        `[duplicate] Another skill named "${r.name}" exists in this workspace (${arr.length} total).`,
        vscode.DiagnosticSeverity.Warning,
      );
      d.source = "ModelBound";
      diagnostics.set(r.uri, [...existing, d]);
    }
  }
}

function updateStatus(results: SkillScan[]) {
  if (results.length === 0) {
    statusItem.text = "$(shield) ModelBound: no skills";
    return;
  }
  const red = results.filter((r) => r.tier === "red" || r.bucket === "red").length;
  const amber = results.filter((r) => r.tier === "amber" || r.bucket === "amber").length;
  if (red > 0) statusItem.text = `$(error) ModelBound: ${red} red, ${amber} amber`;
  else if (amber > 0) statusItem.text = `$(warning) ModelBound: ${amber} amber`;
  else statusItem.text = `$(check) ModelBound: ${results.length} skills healthy`;
}

async function pickSkill(): Promise<SkillScan | undefined> {
  const files = await vscode.workspace.findFiles(SKILL_GLOB, "**/node_modules/**", 100);
  const pick = await vscode.window.showQuickPick(
    files.map((f) => ({ label: vscode.workspace.asRelativePath(f), uri: f })),
    { placeHolder: "Pick a SKILL.md to open in ModelBound" },
  );
  if (!pick) return undefined;
  return { uri: pick.uri, name: path.basename(path.dirname(pick.uri.fsPath)) } as SkillScan;
}

export function deactivate() {}
