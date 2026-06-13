---
name: mb-pipeline
description: Run the ModelBound Skill Development Pipeline (test → benchmark → optimize) on a skill. Pass a skill ID or the current SKILL.md file path.
---

# Run Skill Development Pipeline

1. Resolve the skill identifier:
   - If an argument is provided and it ends with `SKILL.md`, extract the directory basename as the skill ID.
   - Otherwise use the provided argument directly as the skill ID.
2. Call the ModelBound MCP tool `pipeline.run` with `{ skillId, source: "cursor-plugin" }`.
3. Render the pipeline result:
   - Show each stage name, status (✓ passed / ✗ failed / ○ skipped), and duration.
   - If a score is returned, display it as `Score: X/100`.
   - If an optimized skill ID is returned, display it as `Optimized skill: <id>`.
4. If the user passed `--dry-run`, call `pipeline.config` instead and show the preview stages + estimated token cost.
