# /mb-eval
Eval test suite for skills. Subcommands: `list`, `create`, `run`, `results`.

**List cases:**
```bash
npx -y @modelbound/cli eval list
```

**Create case:**
```bash
npx -y @modelbound/cli eval create --name "My case" --prompt "User asks X" --expected "Should do Y"
```

**Run / score output:**
```bash
npx -y @modelbound/cli eval run --case "<eval_case_id>" --output "<actual skill output>"
```

**Results history:**
```bash
npx -y @modelbound/cli eval results --case "<eval_case_id>" --limit 20
```

Requires API key with `agent` scope for create/run/list.
