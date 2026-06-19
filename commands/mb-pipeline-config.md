# /mb-pipeline-config
Configure Test & Optimize pipeline gates for a skill.

```bash
npx -y @modelbound/cli pipeline config --skill "<skill>"
```

To update gates:
```bash
npx -y @modelbound/cli pipeline config --skill "<skill>" --min-trust 60 --enforce-trust
npx -y @modelbound/cli pipeline config --skill "<skill>" --max-latency 2500 --enforce-latency
npx -y @modelbound/cli pipeline config --skill "<skill>" --no-enforce-tests
npx -y @modelbound/cli pipeline config --skill "<skill>" --targets save,marketplace,claude_export
```

Show current config when no gate flags are passed.
