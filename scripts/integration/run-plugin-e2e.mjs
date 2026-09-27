#!/usr/bin/env node
/**
 * modelbound-cursor-plugin E2E (no Cursor install required).
 *
 * Usage:
 *   npm run test:e2e
 *   npm run test:e2e:full
 *   MODELBOUND_API_KEY=... npm run test:e2e:full
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CURSOR_CMD = path.join(ROOT, ".cursor", "commands");
const MB = path.join(ROOT, "scripts", "mb.mjs");
const CLI_PIN = process.env.PLUGIN_E2E_CLI_VERSION || "0.3.6";
const skipValidate = process.argv.includes("--skip-validate");

function loadApiKey() {
  const fromEnv = process.env.MODELBOUND_API_KEY?.trim();
  if (fromEnv?.startsWith("mb_live_")) return fromEnv;
  for (const envPath of [
    path.join(ROOT, ".env"),
    path.join(ROOT, "../modelbound-cli/.env"),
    path.join(ROOT, "../modelbound-cursor-extension/.env"),
    path.join(ROOT, "../.env"),
  ]) {
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^(?:MODELBOUND_API_KEY|MB_TOKEN)=(.+)$/);
      if (m?.[1]?.trim().startsWith("mb_live_")) return m[1].trim();
    }
  }
  try {
    const cfg = JSON.parse(
      fs.readFileSync(path.join(os.homedir(), ".modelbound", "config.json"), "utf8"),
    );
    const t = cfg.apiKey ?? cfg.token;
    if (t?.startsWith("mb_live_")) return t;
  } catch {
    /* noop */
  }
  return fromEnv || "";
}

const API_KEY = loadApiKey();

let passed = 0;
let failed = 0;
let skipped = 0;

function ok(label) {
  passed++;
  console.log(`  ✓ ${label}`);
}
function fail(label, detail) {
  failed++;
  console.log(`  ✗ ${label}`);
  if (detail) console.log(`    ${String(detail).trim().slice(0, 600)}`);
}
function skip(label, reason) {
  skipped++;
  console.log(`  ○ ${label} (${reason})`);
}

function runNode(script, args = [], opts = {}) {
  return spawnSync(process.execPath, [script, ...args], {
    encoding: "utf8",
    cwd: opts.cwd ?? ROOT,
    env: opts.env ?? process.env,
  });
}

function runMb(args, cwd = ROOT, env = process.env) {
  return runNode(MB, args, { cwd, env: { ...env, MODELBOUND_API_KEY: API_KEY || env.MODELBOUND_API_KEY } });
}

function runNpxModelbound(args, env = process.env) {
  return spawnSync("npx", ["-y", `modelbound@${CLI_PIN}`, ...args], {
    encoding: "utf8",
    cwd: ROOT,
    env,
    shell: process.platform === "win32",
  });
}

function expectExit(label, r, code, checkOut) {
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`;
  if (r.status !== code) {
    fail(label, `expected exit ${code}, got ${r.status}\n${out}`);
    return false;
  }
  if (checkOut && !checkOut(out, r)) {
    fail(label, "output check failed");
    return false;
  }
  ok(label);
  return true;
}

function phaseValidate() {
  console.log("\nPhase 1 · validate-plugin.mjs\n");
  const r = runNode(path.join(ROOT, "scripts/validate-plugin.mjs"), ["--smoke"]);
  if (r.status !== 0) fail("validate-plugin.mjs", r.stderr || r.stdout);
  else ok("validate-plugin.mjs");
}

function phaseSlashCommands() {
  console.log("\nPhase 2 · .cursor/commands\n");
  const files = fs.readdirSync(CURSOR_CMD).filter((f) => f.startsWith("mb-") && f.endsWith(".md"));
  if (files.length < 20) fail("mb-* count", `found ${files.length}`);
  else ok(`${files.length} mb-* command files`);

  const must = [
    "mb-report.md",
    "mb-reliability.md",
    "mb-harness.md",
    "mb-trace.md",
    "mb-health.md",
    "mb-init.md",
    "mb-new.md",
    "mb-trust.md",
    "mb-lint.md",
    "mb-validate.md",
  ];
  for (const name of must) {
    if (!files.includes(name)) fail(`missing ${name}`, "");
    else ok(name);
  }

  const mbRe = /\b(mb|mb\.mjs|modelbound)\b/i;
  const mcpRe = /report_run|MCP/i;
  for (const file of files.sort()) {
    const text = fs.readFileSync(path.join(CURSOR_CMD, file), "utf8");
    if (!mbRe.test(text) && !mcpRe.test(text)) {
      fail(`${file} references mb or MCP`, "");
      continue;
    }
    ok(`${file} documents invocation`);
  }
}

function phaseHooks() {
  console.log("\nPhase 3 · hooks + backup script\n");
  const hooksPath = path.join(ROOT, "hooks/hooks.json");
  const hooks = JSON.parse(fs.readFileSync(hooksPath, "utf8"));
  if (!hooks.hooks?.beforeFileEdit?.length) fail("beforeFileEdit hooks", "");
  else ok("beforeFileEdit hooks configured");

  for (const rel of ["scripts/backup-skill.sh", "scripts/touch-skill.sh", "scripts/pre-skill-write.mjs", "scripts/mb.mjs"]) {
    if (!fs.existsSync(path.join(ROOT, rel))) fail(`missing ${rel}`, "");
    else ok(rel);
  }

  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "mb-cursor-plugin-e2e-"));
  const skillPath = path.join(fixture, ".cursor", "skills", "e2e", "SKILL.md");
  fs.mkdirSync(path.dirname(skillPath), { recursive: true });
  fs.writeFileSync(skillPath, "---\nname: e2e\ndescription: fixture\n---\n\n# E2E\n");

  const backupSh = path.join(ROOT, "scripts/backup-skill.sh");
  const br = spawnSync(backupSh, [], {
    cwd: fixture,
    env: { ...process.env, CURSOR_HOOK_FILE_PATH: skillPath },
    encoding: "utf8",
  });
  if (br.status !== 0) fail("backup-skill.sh", br.stderr || br.stdout);
  else {
    const backups = path.join(fixture, ".mb-backup");
    if (!fs.existsSync(backups) || fs.readdirSync(backups).length === 0) {
      fail("backup-skill.sh wrote .mb-backup/", "");
    } else {
      ok("backup-skill.sh creates .mb-backup/");
    }
  }
}

function phaseOfflineMb() {
  console.log("\nPhase 4 · offline mb.mjs (local CLI)\n");
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "mb-cursor-e2e-offline-"));
  fs.mkdirSync(path.join(fixture, ".cursor", "skills"), { recursive: true });

  expectExit("mb.mjs init", runMb(["init"], fixture), 0);
  if (fs.existsSync(path.join(fixture, ".modelbound", "task-budgets.json"))) {
    ok("init created task-budgets.json");
  } else {
    fail("init created task-budgets.json", "");
  }

  expectExit(
    "mb.mjs new e2e-skill",
    runMb(["new", "e2e-skill", "-d", "E2E test skill"], fixture),
    0,
  );
  const skill = path.join(fixture, "skills/e2e-skill/SKILL.md");
  if (fs.existsSync(skill)) ok("new created SKILL.md");
  else fail("new created SKILL.md", "");

  if (fs.existsSync(skill)) {
    expectExit("mb.mjs lint", runMb(["lint", skill], fixture), 0);
    expectExit("mb.mjs validate", runMb(["validate", skill], fixture), 0);
    expectExit("mb.mjs trust", runMb(["trust", skill], fixture), 0, (o) => /trust|h5/i.test(o));
  }

  expectExit(
    `npx modelbound@${CLI_PIN} harness --help`,
    runNpxModelbound(["harness", "--help"], process.env),
    0,
    (o) => /unattended|--skill/i.test(o),
  );
  expectExit(
    `npx modelbound@${CLI_PIN} trace --help`,
    runNpxModelbound(["trace", "--help"], process.env),
    0,
    (o) => /--skill/.test(o),
  );
}

function phaseCloud() {
  console.log("\nPhase 5 · cloud (optional)\n");
  if (!API_KEY) {
    skip("mb.mjs health", "no MODELBOUND_API_KEY");
    skip("mb.mjs auth status", "no MODELBOUND_API_KEY");
    skip("mb.mjs reliability", "no MODELBOUND_API_KEY");
    return;
  }
  const env = { ...process.env, MODELBOUND_API_KEY: API_KEY };
  expectExit("mb.mjs health", runMb(["health"], ROOT, env), 0);
  expectExit("mb.mjs auth status", runMb(["auth", "status"], ROOT, env), 0);
  expectExit("mb.mjs reliability --json", runMb(["reliability", "--days", "7"], ROOT, env), 0);
}

function main() {
  console.log("ModelBound Cursor plugin E2E");
  console.log(`Root: ${ROOT}`);
  console.log(`CLI pin: modelbound@${CLI_PIN}`);

  if (skipValidate) {
    skip("validate-plugin.mjs", "--skip-validate");
  } else {
    phaseValidate();
  }
  phaseSlashCommands();
  phaseHooks();
  phaseOfflineMb();
  phaseCloud();

  console.log(`\nDone: ${passed} passed, ${failed} failed, ${skipped} skipped\n`);
  if (failed) process.exit(1);
}

main();
