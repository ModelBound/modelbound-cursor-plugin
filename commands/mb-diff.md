# /mb-diff
Unified diff between two skill versions. Usage: `/mb-diff <skill> <from> [to]`.

Use **numeric version labels without a `v` prefix** (e.g. `0.1.31`, not `v0.1.31`). Run `/mb-versions` first to list labels.

Default `to` is `current` when omitted.

Execute:
```bash
node .modelbound/mb.mjs compare --skill "<skill>" --from "<from>" --to "<to-or-current>"
```

Render the `diff` field from the response. If `latest`/`current` fail with "no body snapshot", pick two numeric versions from `/mb-versions`.
