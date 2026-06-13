# Changelog

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
