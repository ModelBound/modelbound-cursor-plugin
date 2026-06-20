# ModelBound — Cursor plugin

Audit Agent Skills for trust, token budget, duplicates, and tool-surface risk — without leaving Cursor. Run the Skill Development Pipeline, Trust & Safety findings, and manage skill versions directly from your editor.

Built and maintained by [ModelBound](https://modelbound.co), the unified knowledge index and MCP tool proxy for AI agents.

All slash commands shell out to the ModelBound CLI via `node .modelbound/mb.mjs` (installed by this plugin). The launcher uses a global `modelbound` binary if present, otherwise [`npx modelbound`](https://www.npmjs.com/package/modelbound) from npm. Same semantics as the Cursor extension and MCP. **You never need skill UUIDs**: pass a file path or slug and the CLI syncs + resolves internally.

## What's in the box

| Component | Purpose |
| --- | --- |
| **Skill** · `skill-health-lens` | Invoke with `/skill-health-lens` to run the four core checks |
| **Rule** · `skill-authoring` | Inline authoring standards on all watched skill paths |
| **Trust & Optimize** · `/mb-findings`, `/mb-suggest`, `/mb-compare`, `/mb-benchmark` | Test & Optimize phase (extension v1.9.16 parity) |
| **Pipeline** · `/mb-pipeline`, `/mb-test`, `/mb-sync`, `/mb-context` | Skill Development Pipeline with auto sync |
| **Versions** · `/mb-versions`, `/mb-restore`, `/mb-diff` | Checkpoint history and restore |
| **Auth** · `/mb-login`, `/mb-logout`, `/mb-whoami`, `/mb-health` | Device login + MCP connectivity |
| **Hook** · `beforeFileEdit` + `afterFileEdit` on skill files | Pre-edit backup to `.mb-backup/` and token-budget hint on save |
| **MCP server** · `modelbound` | Hosted at `https://mcp.modelbound.co` (requires `MODELBOUND_API_KEY`) |

### Test & Optimize workflow (Brian's case)

```bash
/mb-context set --repo org/repo
/mb-sync .modelbound/prompt-pr-contributor.md
/mb-findings .modelbound/prompt-pr-contributor.md
/mb-findings ignore ... --key "escalation:critical:..."
/mb-pipeline .modelbound/prompt-pr-contributor.md --stage test_optimize
```

### Skill file paths (auto-detected)

- `.modelbound/**/*.md|.json`
- `.kiro/skills/**/*.md`
- `.cursor/rules/**/*.md|.mdc`
- `.claude/**/*.md`
- `.agents/skills/**/SKILL.md`

## Install

```bash
npx modelbound-cursor-plugin@latest install
```

Requires Node ≥ 20. Auth via `MODELBOUND_API_KEY` or run `/mb-login` once.

## Slash commands

| Command | CLI equivalent |
|---|---|
| `/mb-findings <skill>` | `findings list --skill …` |
| `/mb-suggest <skill>` | `suggest --skill …` |
| `/mb-compare <skill>` | `compare --skill … --from latest --to current` |
| `/mb-benchmark <skill>` | `benchmark --skill …` |
| `/mb-pipeline <skill>` | `pipeline run --skill … --watch` |
| `/mb-test <skill>` | `test --skill …` |
| `/mb-sync <file>` | `sync --file …` |
| `/mb-context set` | `context set [--repo org/repo]` |
| `/mb-optimize <file\|slug>` | `optimize …` |
| `/mb-versions <skill>` | `versions --skill …` |
| `/mb-restore <skill> <ver>` | `version restore --skill … --version …` |
| `/mb-diff <skill> <from> [to]` | `version diff --skill …` |
| `/mb-health` | `health` |
| `/mb-login` / `/mb-logout` / `/mb-whoami` | `auth login` / `auth logout` / `auth status` |

## Known backend blockers

Pipeline, findings ignore, benchmark, compare, and suggest may hit hosted-backend bugs until Lovable deploys fixes. The CLI surfaces these errors explicitly (`Pipeline failed:`, `[MCP_ERROR]`, etc.). See `docs/BACKEND-BLOCKERS.md` in modelbound-cli.

## Pre-skill-write Git hook

`scripts/pre-skill-write.mjs` snapshots staged skill files (same paths as above) to `.modelbound/backups/` before commit and blocks empty files or dropped YAML frontmatter. Opt out with `MODELBOUND_SKIP_HOOK=1` or `--no-verify`.

Edit hooks in `hooks/hooks.json` back up to `.mb-backup/` and print a token-budget hint on save for the same skill paths.

## License

MIT
