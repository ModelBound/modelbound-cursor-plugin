# /mb-restore
Restore a skill to a prior checkpoint (non-destructive). Usage: `/mb-restore <skill> <version>`.

Execute:
```bash
npx -y @modelbound/cli version restore --skill "<skill>" --version "<version>"
```

Confirm the new version label and remind the user to review before replacing the local file.
