# Changelog

## 0.3.5 — 2026-09-27

### Fixed
- `package.json` / plugin metadata repository URL matches GitHub (`modelbound-cursor-plugin`) for npm provenance publish

## 0.3.4 — 2026-09-27

### Added
- E2E harness (`npm run test:e2e:full`) — commands, hooks, offline `init`/`new`/`lint`/`validate`/`trust`
- Slash commands for CLI parity: `/mb-init`, `/mb-new`, `/mb-trust`, `/mb-lint`, `/mb-validate`
- Pin `mb.mjs` fallback to **modelbound@0.3.6** (harness, trace, report, reliability)

### Notes
- `/mb-trace` uses MCP `report_run` (Cursor-native); CLI `mb trace` is for shell/CI — see `docs/PARITY.md`

## 0.3.0 — 2026-06-19

### Changed
- **Aligned all slash commands with `@modelbound/cli` v0.2.0** (extension v1.9.16 parity)
- Commands use `--skill <file|slug>` — no UUID required; CLI resolves via sync + workspace context
- Auth commands use `auth login|logout|status` (aliases: `login`, `logout`, `whoami`)
- Benchmark is latency suite (`benchmark --skill`), not head-to-head version compare
- Pipeline uses `pipeline run --skill ... --stage test_optimize|production|full --watch`
- **Skill path detection** expanded in pre-commit hook, edit hooks, and authoring rule globs (`.modelbound/`, `.kiro/skills/`, `.cursor/rules/`, `.claude/`)

### Added
- `/mb-findings` — Trust & Safety scores + findings list/ignore workflow
- `/mb-suggest` — suggest skill improvements
- `/mb-compare` — compare skill versions (`latest` vs `current` default)
- `/mb-sync` — sync local skill file to repo-linked UUID
- `/mb-context` — set workspace scoping (`context set`)
- `.cursor/rules/skill-authoring.mdc` — installed with expanded globs

### Notes
- Known hosted-backend blockers (pipeline JWT, status column, findings team_id, benchmark auth) documented in command prompts — same as Cursor extension

## 0.2.0 — 2026-06-13

### Added
- **Skill Development Pipeline** slash commands:
  - `/mb-pipeline <skill>` — run test → benchmark → optimize pipeline
  - `/mb-pipeline <skill> --dry-run` — preview stages and token cost
  - `/mb-test [skill]` — run tests or list recent runs
  - `/mb-versions <skill>` — list saved checkpoints with scores
  - `/mb-restore <skill> <version>` — restore a skill to a checkpoint
  - `/mb-diff <skill> [from] [to]` — diff between versions
  - `/mb-health` — local token count + remote health scores and budgets
- **Pre-edit backup hook** — `beforeFileEdit` on `SKILL.md` snapshots files to `.mb-backup/` (silent, best-effort)

## 0.1.0 (initial)

- Skill: `skill-health-lens` — local audit for trust, token budget, duplicates, tool surface
- Rule: `skill-authoring` standards applied on `SKILL.md` edits
- Commands: `/open-in-modelbound`, `/sync-from-modelbound`
- Hook: `afterFileEdit` on `SKILL.md` prints a one-line token-budget hint
- MCP server: `modelbound` for sync status, AI review, and team rule libraries
