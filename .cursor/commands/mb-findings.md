# /mb-findings
Trust & Safety findings for a skill. Usage: `/mb-findings <skill-file|slug>` or `/mb-findings ignore <skill> --key "..."`.

**List** (default):
```bash
npx -y @modelbound/cli findings list --skill "<skill>"
```

Show trust score (total/clarity/safety/fit), each finding with severity and stable `key`. Propose fixes for critical items.

**Ignore** (when user says ignore a finding):
```bash
npx -y @modelbound/cli findings ignore --skill "<skill>" --key "<stable-key>"
```

After ignore, suggest re-running Test & Optimize:
```bash
npx -y @modelbound/cli pipeline run --skill "<skill>" --stage test_optimize --watch
```

Note: ignore may fail with `team_id` constraint until Lovable deploys fix.
