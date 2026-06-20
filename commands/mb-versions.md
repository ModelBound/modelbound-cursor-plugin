# /mb-versions
List skill version checkpoints. Usage: `/mb-versions <skill-file|slug>`.

Execute:
```bash
node .modelbound/mb.mjs versions --skill "<skill>"
```

Show version labels (numeric, e.g. `0.1.32`), timestamps, and notes newest first. Use these labels with `/mb-diff` or `/mb-compare` **without** a `v` prefix.
