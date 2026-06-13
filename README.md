# ModelBound — Cursor plugin

Drop the ModelBound token-optimization and Skill Development Pipeline workflow into Cursor. Ships as a set of `.cursor/commands/*.md` slash commands (Cursor surfaces these in chat) plus a tiny pre-write Git hook that snapshots skill files before Cursor's agent rewrites them.

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
