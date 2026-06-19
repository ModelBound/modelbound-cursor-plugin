# /mb-sync
Sync a local skill file to ModelBound (repo-linked UUID). Usage: `/mb-sync <path-to-skill.md>`.

Execute:
```bash
npx -y @modelbound/cli sync --file "<path>"
```

Print the returned `skill_id` UUID. Use file paths under `.modelbound/`, `.cursor/rules/`, `.kiro/skills/`, `.claude/`, or `.agents/skills/*/SKILL.md` — no manual UUID needed.
