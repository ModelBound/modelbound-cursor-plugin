# /mb-findings
Safety and quality findings for a skill. Usage: `/mb-findings <skill-file|slug>` or `/mb-findings ignore <skill> --key "..."`.

**List** (default):
```bash
node .modelbound/mb.mjs findings list --skill "<skill>"
```

Show each finding (blocking or warning) with severity and stable `key`. Propose fixes for critical items.

**Ignore** (when user says ignore a finding):
```bash
node .modelbound/mb.mjs findings ignore --skill "<skill>" --key "<stable-key>"
```

After ignore, suggest re-running Test & Optimize:
```bash
node .modelbound/mb.mjs pipeline run --skill "<skill>" --stage test_optimize --watch
```

Note: ignore may fail with `team_id` constraint until Lovable deploys fix.
