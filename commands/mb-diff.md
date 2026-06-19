# /mb-diff
Unified diff between two skill versions. Usage: `/mb-diff <skill> <from> [to]`.

Default `to` is the live/current version.

Execute:
```bash
npx -y @modelbound/cli version diff --skill "<skill>" --from "<from>" ${to:+--to "$to"}
```

Show the diff in a readable block.
