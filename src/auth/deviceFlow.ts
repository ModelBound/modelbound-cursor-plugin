import * as vscode from "vscode";

interface StartResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  interval: number;
  expires_in: number;
}

interface PollSuccess {
  api_key: string;
  team_id?: string;
  user_email?: string;
}

const SECRET_KEY = "modelbound.apiKey";

export class AuthService {
  constructor(
    private readonly ctx: vscode.ExtensionContext,
    private readonly apiBaseUrl: string,
    private readonly webBaseUrl: string,
  ) {}

  async getApiKey(): Promise<string | undefined> {
    return this.ctx.secrets.get(SECRET_KEY);
  }

  async signOut(): Promise<void> {
    await this.ctx.secrets.delete(SECRET_KEY);
    vscode.window.showInformationMessage("ModelBound: signed out on this device.");
  }

  /** OAuth 2.0 Device Authorization Grant (RFC 8628). */
  async connect(): Promise<string | undefined> {
    let start: StartResponse;
    try {
      const r = await fetch(`${this.apiBaseUrl}/extension-device-auth/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device_label: `${vscode.env.appName} on ${process.platform}` }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      start = (await r.json()) as StartResponse;
    } catch (e) {
      vscode.window.showErrorMessage(`ModelBound: failed to start device flow (${(e as Error).message}).`);
      return undefined;
    }

    const url = `${this.webBaseUrl}/extension/connect?code=${encodeURIComponent(start.user_code)}`;
    await vscode.env.openExternal(vscode.Uri.parse(url));

    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `ModelBound: waiting for approval (code ${start.user_code})…`,
        cancellable: true,
      },
      async (_progress, token) => {
        const start_at = Date.now();
        const interval = Math.max(2, start.interval) * 1000;
        while (Date.now() - start_at < start.expires_in * 1000) {
          if (token.isCancellationRequested) return undefined;
          await new Promise((r) => setTimeout(r, interval));
          try {
            const r = await fetch(`${this.apiBaseUrl}/extension-device-auth/poll`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ device_code: start.device_code }),
            });
            if (r.status === 200) {
              const data = (await r.json()) as PollSuccess;
              if (data?.api_key) {
                await this.ctx.secrets.store(SECRET_KEY, data.api_key);
                vscode.window.showInformationMessage(
                  `ModelBound: connected${data.user_email ? ` as ${data.user_email}` : ""}.`,
                );
                return data.api_key;
              }
            }
            // 202 / 4xx: keep polling unless explicitly denied/expired
            if (r.status === 410 || r.status === 403) {
              vscode.window.showWarningMessage("ModelBound: device code denied or expired.");
              return undefined;
            }
          } catch {
            // network blip — keep polling
          }
        }
        vscode.window.showWarningMessage("ModelBound: device code expired.");
        return undefined;
      },
    );
  }
}
