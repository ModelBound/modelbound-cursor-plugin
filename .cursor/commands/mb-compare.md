# /mb-compare
Compare two skill versions. Usage: `/mb-compare <skill> [--from 0.1.31] [--to 0.1.32]`.

**Version labels:** use numeric semver **without** a `v` prefix (`0.1.31`, not `v0.1.31`). Defaults `latest` / `current` may fail if body snapshots were not stored for those labels — use explicit versions from `/mb-versions`.

Execute:
```bash
node .modelbound/mb.mjs compare --skill "<skill>" --from "<from>" --to "<to>"
```

Summarize the `diff` field and `stats` (added/removed lines).
