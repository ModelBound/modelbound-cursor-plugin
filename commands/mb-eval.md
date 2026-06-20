# /mb-eval
Eval test suite for skills. Subcommands: `list`, `create`, `run`, `results`.

**List cases:**
```bash
node .modelbound/mb.mjs eval list
```

**Create case:**
```bash
node .modelbound/mb.mjs eval create --name "My case" --prompt "User asks X" --expected "Should do Y"
```

**Run / score output:**
```bash
node .modelbound/mb.mjs eval run --case "<eval_case_id>" --output "<actual skill output>"
```

**Results history:**
```bash
node .modelbound/mb.mjs eval results --case "<eval_case_id>" --limit 20
```

Requires API key with `agent` scope for create/run/list.
