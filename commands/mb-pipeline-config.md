# /mb-pipeline-config
Configure Test & Optimize pipeline gates for a skill.

```bash
node .modelbound/mb.mjs pipeline config --skill "<skill>"
```

To update gates:
```bash
node .modelbound/mb.mjs pipeline config --skill "<skill>" --min-trust 60 --enforce-trust
node .modelbound/mb.mjs pipeline config --skill "<skill>" --max-latency 2500 --enforce-latency
node .modelbound/mb.mjs pipeline config --skill "<skill>" --no-enforce-tests
node .modelbound/mb.mjs pipeline config --skill "<skill>" --targets save,marketplace,claude_export
```

Show current config when no gate flags are passed.
