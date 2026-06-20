# /mb-context
Set workspace scoping before skill operations. Usage: `/mb-context set [--repo org/repo]`.

Execute:
```bash
node .modelbound/mb.mjs context set $ARGS
```

Repo is auto-detected from `git remote get-url origin` when omitted. Call at session start or before cross-repo skill ops.
