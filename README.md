# ModelBound for Cursor & VS Code

The fastest way to ship safe, well-scoped, well-sized **Agent Skills** — right inside your editor.

ModelBound runs **local checks** on every `SKILL.md` in your workspace and shows you:

- **Trust score (0–100)** — clarity, safety, fit. Powered by the same scanner that runs on modelbound.co.
- **Token budget per skill** — green / amber / red against published per-category budgets.
- **Sync status** — if your repo is connected to ModelBound, see at a glance whether your local edits are in sync with the cloud.
- **Duplicate detection** — flags skills with high name/description overlap so they don't collide at runtime.
- **Tool surface audit** — warns on dangerous `allowed_tools` combinations (Bash + Network, Write to sensitive paths).

**Free forever** for local checks. Sign in to unlock AI Review, the Skill Marketplace and team rule libraries.

## Install

- **VS Code Marketplace** — *coming soon*
- **Open VSX (Cursor / Windsurf / VSCodium)** — *coming soon*

## Connect to ModelBound

1. Open the command palette → `ModelBound: Connect`.
2. Your browser opens to `https://modelbound.co/extension/connect`.
3. Sign in (GitHub, GitLab, Bitbucket or email) and approve the device.
4. Done — the extension stores your API key locally in VS Code SecretStorage. You can sign out anytime with `ModelBound: Sign Out`.

## Telemetry

The extension sends **lightweight, anonymous usage events** (event name + extension version + OS + editor — never file contents or PII) so we can measure feature usage. It respects `vscode.env.isTelemetryEnabled` and can be disabled at any time via the standard VS Code telemetry settings.

## License

MIT — © ModelBound
