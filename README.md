# ModelBound Skill Health Lens — Cursor Plugin

Audit Agent Skills (`SKILL.md` files) for trust, token budget, duplicates, and tool-surface risk — without leaving Cursor.

Built and maintained by [ModelBound](https://modelbound.co), the unified knowledge index and MCP tool proxy for AI agents.

## What's in the box

| Component | Purpose |
| --- | --- |
| **Skill** · `skill-health-lens` | Invoke with `/skill-health-lens` to run the four core checks |
| **Rule** · `skill-authoring` | Inline authoring standards applied when editing any `SKILL.md` |
| **Commands** · `/open-in-modelbound`, `/sync-from-modelbound`, `/show-hierarchy` | Bridge back to your ModelBound project |
| **Hook** · `afterFileEdit` on `SKILL.md` | One-line token-budget hint on save |
| **MCP server** · `modelbound` | Sync status, AI review, team rule libraries (requires API key) |

### `/show-hierarchy`

Calls the `get_resource_tree` MCP tool to fetch the team's full AI resource hierarchy (platform → top-level dir → files), renders a compact markdown outline, and copies it to your clipboard so you can paste the map into Cursor chat or hand it to a teammate. Optionally pass a platform name (`/show-hierarchy claude-code`) to narrow the tree.

## Install

### From the Cursor Marketplace
*Pending review — link will appear here once published.*

### Manual install

```bash
# clone next to your project
git clone https://github.com/modelbound/cursor-plugin ~/.cursor-plugins/modelbound

# Cursor → Settings → Plugins → Install from path → choose ~/.cursor-plugins/modelbound
```

## Connect to ModelBound (optional)

The four core checks (trust, token budget, duplicates, tool surface) run **fully locally** with no account.

To unlock sync status, AI review, team rule libraries, and the scheduled re-scan, connect the plugin to your ModelBound account:

1. In Cursor, run `> ModelBound: Connect`.
2. Approve the device code in the browser tab that opens.
3. The plugin stores the resulting `mb_live_*` key in Cursor's secret store and uses it as the `MODELBOUND_API_KEY` env var for the MCP server defined in `mcp.json`.

You can revoke the key any time from [modelbound.co/settings/api-keys](https://modelbound.co/settings/api-keys).

## Telemetry

Anonymous usage events are sent to ModelBound to measure install → activation and feature adoption. Events contain no file contents, no skill bodies, and no personal data — only event names, a random install ID, plugin version, and OS.

To opt out, set the environment variable `MODELBOUND_TELEMETRY=off` in your shell profile.

## License

MIT © ModelBound
