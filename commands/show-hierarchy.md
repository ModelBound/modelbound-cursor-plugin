---
name: show-hierarchy
description: Print the ModelBound resource hierarchy (platform → folder → files) and copy a markdown outline to the clipboard for pasting into Cursor chat.
---

# Show ModelBound Resource Hierarchy

1. Read the bound project from `.modelbound/project.json`.
2. Call the `get_resource_tree` MCP tool on the `modelbound` MCP server. Pass no filters by default; if the user mentions a specific platform (`claude-code`, `cursor`, `kiro`, `amazon-q`, `copilot`, `windsurf`), forward it as the `platform` argument.
3. Render the response as a compact markdown outline grouped by platform → top-level directory (`.claude/skills`, `.cursor/rules`, `.kiro/steering`, …) → file. Include the `ai_type` of each file in parentheses when available.
4. Run `bash scripts/copy-hierarchy.sh` with the rendered outline piped on stdin so the user can paste the map into Cursor chat or a teammate's DM.
5. Remind the user: pair this with `list_skills` (filtered by `ai_type` / `source_platform`) to actually load a subset, or with `get_skill` to fetch one file's content.

This command is read-only — it never writes to local files beyond a system clipboard copy.
