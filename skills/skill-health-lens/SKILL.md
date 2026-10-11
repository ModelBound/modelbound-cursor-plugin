---
name: skill-health-lens
description: Audit Agent Skills (SKILL.md files) for safety checks, token budget, duplicate content, and risky tool surface. Use when reviewing a SKILL.md, before publishing a skill, or when an agent's skill library starts to feel bloated or untrustworthy. Invoke with "/skill-health-lens" or ask the agent to "lens this skill".
---

# Skill Health Lens

Audits Agent Skills against the same checks ModelBound runs in its Skill Development Pipeline — **Checks**, **Token Budget**, **Duplicates**, and **Tool Surface** — without running the full pipeline.

## When to use

- Reviewing or editing any `SKILL.md` file
- Before publishing a skill to a team marketplace or Cursor Marketplace
- When an agent's skill library has grown past ~10 skills
- When a skill keeps misfiring or being ignored by the agent

## What to check

For each `SKILL.md` in scope:

### 1. Safety & quality checks
Check each skill with ModelBound's h5 heuristics and report **pass / warnings / blocking** — never a numeric score:

- **Frontmatter completeness** — `name`, `description`, optional `allowed_tools` present and well-formed
- **Description quality** — has a clear "when to use" signal, is between 30 and 400 chars, names concrete triggers
- **Instruction shape** — uses numbered steps or bullets, no walls of prose, no contradictory rules
- **Determinism** — avoids vague language ("maybe", "consider", "could") in favor of imperatives
- **Safety** — no injection-like phrasing, secret reads, or unscoped destructive commands

Status:
- **✅ Pass** — no open issues
- **⚠️ Warnings** — quality issues; don't block publishing
- **⛔ Blocking** — safety issues or failing tests; fix before publishing

### 2. Token budget
Estimate tokens (chars / 4) for the skill body and compare against ModelBound's thresholds:

- **Green** ≤ 2,000 tokens
- **Amber** 2,000–5,000 tokens
- **Red** > 5,000 tokens

Flag the top 3 most token-heavy sections and suggest where to split into sub-skills or move into a referenced doc.

### 3. Duplicate content
For each skill, compare with every other `SKILL.md` in the workspace using a Jaccard similarity over normalized tokens. Flag pairs with similarity ≥ 0.4 as **likely duplicates** and ≥ 0.6 as **near-clones**. Suggest a merge or rename.

### 4. Tool surface audit
Parse the `allowed_tools` frontmatter (and any explicit tool mentions in the body). Flag:

- Skills with **no** `allowed_tools` field (implicit unrestricted access)
- Skills granting access to destructive tools (`run_terminal`, `delete_file`, `write_file` on broad globs)
- Skills mixing **read-only research** with **mutating actions** (split recommendation)

## How to run

1. Glob `**/SKILL.md` from the workspace root (or operate on the currently open file).
2. For each file, compute the four sections above.
3. Produce a single Markdown report grouped by skill, then a workspace-level summary table.
4. End with **3 prioritized fixes** the user can apply now (concrete, copy-paste-ready edits).

## ModelBound integration

When the user is signed in to ModelBound (via the `modelbound` MCP server defined in this plugin), also:

- Call `skills.list` (optionally filtered by `category` or `group_id`) and `skills.listGroups` to pull the user's Skills — including a whole group at once when they say things like "lens my Onboarding group" or "audit every Backend skill".
- Use `skills.get` / `skills.getFile` for the full bundle, and `platform.exportSkillForIde` with `group_id` to bundle every skill in a group into the IDE in one shot.
- Offer to request an AI review for any skill with blocking issues, and show its real-world success rate when ModelBound has run reports.
- Surface team-level policies (banned tools, required sections) so they're checked alongside the four core checks.

> Note: ModelBound no longer uses the legacy "pack" concept — everything is a **Skill**, optionally organized into a **Skill group**. Older `packs.*` / `export_pack_for_ide` tool names still work as deprecated aliases but new code should use `skills.*` and `platform.exportSkillForIde`.

If the MCP server is unreachable or the user is not signed in, the four core checks still run locally.

## Output format

```
# Skill Health Lens — <N> skills in <workspace>

## Summary
| Skill | Checks | Tokens | Duplicates | Tools |
| --- | --- | --- | --- | --- |
| code-reviewer | ✅ pass | 🟢 1.2k | — | ✅ scoped |
| pr-helper    | ⚠️ 2 warnings | 🔴 6.8k | clones code-reviewer (0.62) | ⚠️ unrestricted |

## Top 3 fixes
1. **pr-helper**: split into `pr-summarize` and `pr-review` (current body is 6.8k tokens).
2. **pr-helper**: add `allowed_tools: [read_file, grep]` to drop the unrestricted warning.
3. **pr-helper** ↔ **code-reviewer**: 62% overlap — consider merging or extracting a shared rule.

## Details
...
```

## Out of scope

- Editing skills automatically — the agent surfaces fixes, the user applies them
- Replacing the ModelBound Skill Development Pipeline — this is the local "Test & Optimize" lens only
- Running scoring inside the agent loop on every keystroke — invoke on demand
