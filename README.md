# ModelBound — Cursor plugin

Audit Agent Skills (`SKILL.md` files) for trust, token budget, duplicates, and tool-surface risk — without leaving Cursor. Run the Skill Development Pipeline and manage skill versions directly from your editor.

Built and maintained by [ModelBound](https://modelbound.co), the unified knowledge index and MCP tool proxy for AI agents.

## What's in the box

| Component | Purpose |
| --- | --- |
| **Skill** · `skill-health-lens` | Invoke with `/skill-health-lens` to run the four core checks |
| **Rule** · `skill-authoring` | Inline authoring standards applied when editing any `SKILL.md` |
| **Commands** · `/open-in-modelbound`, `/sync-from-modelbound`, `/show-hierarchy` | Bridge back to your ModelBound project |
| **Pipeline commands** · `/mb-pipeline`, `/mb-test`, `/mb-versions`, `/mb-restore`, `/mb-diff`, `/mb-health` | Run Test & Optimize and manage skill versions |
| **Hook** · `beforeFileEdit` + `afterFileEdit` on `SKILL.md` | Pre-edit backup to `.mb-backup/` and one-line token-budget hint on save |
| **MCP server** · `modelbound` | Sync status, AI review, team rule libraries (requires API key) |

### `/show-hierarchy`

Calls the `get_resource_tree` MCP tool to fetch the team's full AI resource hierarchy (platform → top-level dir → files), renders a compact markdown outline, and copies it to your clipboard so you can paste the map into Cursor chat or hand it to a teammate. Optionally pass a platform name (`/show-hierarchy claude-code`) to narrow the tree.

### `/mb-pipeline <skill-id>`

Runs the full ModelBound Skill Development Pipeline on a skill: tests, benchmarks, and optimization. Pass `--dry-run` to preview stages and estimated token cost without executing.

### `/mb-test [skill-id]`

Run tests for a specific skill, or omit the ID to list the 10 most recent test runs across your team.

### `/mb-versions <skill-id>`

Lists all saved checkpoints for a skill with timestamps, scores, labels, and sizes.

### `/mb-restore <skill-id> <version-id>`

Restores a skill to a previous checkpoint. Writes the result to a `.restored.md` file for review before replacing the original.

### `/mb-diff <skill-id> [from-version] [to-version]`

Shows a diff between two versions. Defaults to comparing the latest checkpoint against the current file.

### `/mb-health`

Checks local `.cursor/` and `.claude/` token counts and fetches remote health scores, budgets, and optimization suggestions from ModelBound.

## Install

Two equivalent ways:

```bash
# Recommended: drop the .cursor/ folder + hook into your repo
npx modelbound-cursor-plugin@latest install

# Or vendor by hand
git clone https://github.com/ModelBound/cursor-plugin .modelbound-cursor
cp -r .modelbound-cursor/.cursor ./
cp .modelbound-cursor/scripts/pre-skill-write.mjs .modelbound/
```

Then in Cursor chat:

```text
/mb-optimize ./skills/code-review.md
/mb-pipeline code-review
```

Requires Node ≥ 20. Auth via `MODELBOUND_API_KEY` env var or run `/mb-login` once.

## Slash commands

| Command | What it does |
|---|---|
| `/mb-optimize <file\|slug>` | Token optimization. Append `--apply` to save a new version. |
| `/mb-pipeline <skill>` | Full pipeline (lint → trust → test → benchmark → optimize). |
| `/mb-test <skill>` | Run the test suite. |
| `/mb-benchmark <skill> <a> <b>` | Head-to-head benchmark. |
| `/mb-versions <skill>` | List versions, newest first. |
| `/mb-restore <skill> <versionId>` | Restore (non-destructive). |
| `/mb-diff <skill> <from> [to]` | Unified diff between versions. |
| `/mb-health` | Connectivity + auth check. |
| `/mb-login` / `/mb-logout` / `/mb-whoami` | Auth shortcuts. |

All commands shell out to `@modelbound/cli` so semantics are identical across CLI, MCP, Claude Code, and Cursor.

## Pre-skill-write Git hook

`scripts/pre-skill-write.mjs` is a `pre-commit` hook (works with Husky, lefthook, or plain `.git/hooks`). For every staged skill file (`**/skills/**`, `**/.cursor/skills/**`, `**/SKILL.md`, `**/.agents/skills/**`), it:

1. Snapshots the previous committed version to `.modelbound/backups/<sha>-<basename>`.
2. Refuses the commit if the file would become empty or lose its YAML frontmatter without a `--no-verify`.

This catches the most common skill-file regressions before they land in Git. Opt out per-commit with `MODELBOUND_SKIP_HOOK=1`.

## License

MIT
