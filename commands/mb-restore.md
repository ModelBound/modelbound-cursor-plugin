---
name: mb-restore
description: Restore a skill to a previous checkpoint version. Writes the restored content to a `.restored.md` file next to the original.
---

# Restore Skill Version

1. Parse arguments as `<skill-id> <version-id>`.
2. Call `skill.diff` with `{ skillId, versionA: versionId, action: "restore", source: "cursor-plugin" }`.
3. Write the returned content to `<skill-name>.restored.md` in the same directory as the active file.
4. Confirm restoration with the output path.
