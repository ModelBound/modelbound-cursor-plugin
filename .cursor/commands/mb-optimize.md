# /mb-optimize
Run ModelBound token optimization. Usage: `/mb-optimize <skill-file|slug> [--dry-run]`.

Sync the skill first so the cloud knows the target, then optimize by slug:

```bash
node .modelbound/mb.mjs sync --file "<path-or-skip-if-slug>"
node .modelbound/mb.mjs optimize "<slug-from-filename>" --dry-run $REST
```

For a file like `.modelbound/prompt-pr-contributor.md`, the slug is `prompt-pr-contributor`.

Summarize token savings. If `--dry-run` was not passed and savings exist, ask before applying.

If the API returns `no_target`, ensure you passed the **slug** (not only a path) or run `/mb-sync` first.
