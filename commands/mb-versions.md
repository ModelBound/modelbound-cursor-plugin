---
name: mb-versions
description: List saved checkpoints for a skill. Shows version ID, timestamp, score, label, and size.
---

# List Skill Versions

1. Call `skill.versions` with `{ skillId, source: "cursor-plugin" }`.
2. Render a list:
   - Version ID
   - Created at (human-readable)
   - Score (if available)
   - Label (if available)
   - Size in bytes
3. If no versions exist, show "No versions found."
