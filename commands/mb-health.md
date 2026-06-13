---
name: mb-health
description: Check project health scores and token budgets. Shows local .cursor/ token count plus remote health data.
---

# Project Health Check

1. Scan `.cursor/` and `.claude/` directories recursively for markdown files.
2. Count tokens (rough estimate: bytes ÷ 4 or use a tokenizer if available).
3. Call `pipeline.status` with `{ source: "cursor-plugin" }` to fetch remote health.
4. Render:
   - Local context size (file count + token count)
   - Overall health score /100
   - Budget table with usage percentages and status icons
   - Optimization suggestions as a bulleted list
