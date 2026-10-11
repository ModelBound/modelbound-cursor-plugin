# /mb-checks
Show pass / warnings / blocking checks and confidence trend for a local skill file. Usage: `/mb-checks <path-to-SKILL.md>`.

Execute:
```bash
node .modelbound/mb.mjs checks "$1"
```

Uses the same h5 heuristics as the ModelBound CLI and MCP checks. Blocking issues stop publishing; warnings don't.
