---
name: mb-test
description: Run skill tests or list recent test runs. Omit the skill ID to see the 10 most recent test runs across the team.
---

# Run Skill Tests

1. If no argument is provided:
   - Call `skill.testRuns` with `{ limit: 10, source: "cursor-plugin" }`.
   - Render a table of recent runs (ID · skill · status · date).
2. If a skill ID is provided:
   - Call `skill.test` with `{ skillId, source: "cursor-plugin" }`.
   - Render results: passed/failed/skipped counts.
   - List each test case with status icon and duration.
