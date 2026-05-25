import * as vscode from "vscode";
import { randomBytes } from "crypto";

const INSTALL_ID_KEY = "modelbound.installId";

function getInstallId(ctx: vscode.ExtensionContext): string {
  let id = ctx.globalState.get<string>(INSTALL_ID_KEY);
  if (!id) {
    id = randomBytes(16).toString("hex");
    void ctx.globalState.update(INSTALL_ID_KEY, id);
  }
  return id;
}

function detectEditor(): "vscode" | "cursor" | "windsurf" | "other" {
  const name = (vscode.env.appName || "").toLowerCase();
  if (name.includes("cursor")) return "cursor";
  if (name.includes("windsurf")) return "windsurf";
  if (name.includes("visual studio code") || name.includes("vscodium")) return "vscode";
  return "other";
}

export class Telemetry {
  private readonly installId: string;
  private readonly extensionVersion: string;
  private readonly editor: ReturnType<typeof detectEditor>;
  private readonly os: string;

  constructor(
    private readonly ctx: vscode.ExtensionContext,
    private readonly apiBaseUrl: string,
    private readonly getApiKey: () => Promise<string | undefined>,
  ) {
    this.installId = getInstallId(ctx);
    this.extensionVersion = ctx.extension.packageJSON.version || "0.0.0";
    this.editor = detectEditor();
    this.os = process.platform;
  }

  private enabled(): boolean {
    const setting = vscode.workspace.getConfiguration("modelbound").get<boolean>("telemetry", true);
    return setting && vscode.env.isTelemetryEnabled;
  }

  /** Fire-and-forget; never throws. */
  async track(event: string, props: Record<string, unknown> = {}): Promise<void> {
    if (!this.enabled()) return;
    const key = await this.getApiKey();
    try {
      await fetch(`${this.apiBaseUrl}/extension-telemetry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(key ? { Authorization: `Bearer ${key}` } : {}),
        },
        body: JSON.stringify({
          install_id: this.installId,
          event,
          props,
          version: this.extensionVersion,
          os: this.os,
          editor: this.editor,
        }),
      });
    } catch {
      // intentionally swallowed — telemetry must never break the editor
    }
  }
}
