---
name: mb-diff
description: Show diff between two skill versions. Defaults to latest vs current if no versions are specified.
---

# Diff Skill Versions

1. Parse arguments as `<skill-id> [from-version] [to-version]`.
2. Call `skill.diff` with:
   - `versionA` = from-version or `"latest"`
   - `versionB` = to-version or `"current"`
   - `source: "cursor-plugin"`
3. Render:
   - Header showing `from → to` with addition/deletion counts.
   - The diff text in a code block.
