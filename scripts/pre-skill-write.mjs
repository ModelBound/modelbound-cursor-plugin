#!/usr/bin/env node
// Pre-skill-write Git hook for the ModelBound Cursor plugin.
//
// Usage: install as `.git/hooks/pre-commit` (or via Husky / lefthook).
//   exec node ${PROJECT_ROOT}/scripts/pre-skill-write.mjs "$@"
//
// What it does
//   For every staged file matching a skill path (skills/**, .cursor/skills/**,
//   .agents/skills/**, **/SKILL.md), it:
//     1. Snapshots the previously committed version to
//        .modelbound/backups/<short-sha>-<basename> so an accidental wipe
//        is recoverable.
//     2. Refuses the commit if the new file is empty OR has lost its YAML
//        frontmatter (heuristic: file used to start with `---` but no longer
//        does). The user can override with `--no-verify` or
//        `MODELBOUND_SKIP_HOOK=1`.
//
// Exit codes: 0 = allow, 1 = block.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

if (process.env.MODELBOUND_SKIP_HOOK === "1") process.exit(0);

const SKILL_RE = /(^|\/)(skills|\.cursor\/skills|\.agents\/skills|\.workspace\/skills)\//;
const isSkillPath = (p) => SKILL_RE.test(p) || /(^|\/)SKILL\.md$/.test(p);

const git = (args) =>
  execFileSync("git", args, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }).trim();

let staged;
try {
  staged = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]).split("\n").filter(Boolean);
} catch {
  process.exit(0); // not a git repo or no commits yet
}

const skillFiles = staged.filter(isSkillPath);
if (skillFiles.length === 0) process.exit(0);

const repoRoot = git(["rev-parse", "--show-toplevel"]);
const backupRoot = path.join(repoRoot, ".modelbound", "backups");

const errors = [];

for (const rel of skillFiles) {
  const abs = path.join(repoRoot, rel);

  // 1. Snapshot the previous committed version (if any).
  const prev = spawnSync("git", ["show", `HEAD:${rel}`], { encoding: "utf-8" });
  if (prev.status === 0 && typeof prev.stdout === "string" && prev.stdout.length > 0) {
    fs.mkdirSync(backupRoot, { recursive: true });
    const sha = git(["rev-parse", "--short", "HEAD"]).slice(0, 10);
    const dst = path.join(backupRoot, `${sha}-${path.basename(rel)}`);
    fs.writeFileSync(dst, prev.stdout);
  }

  // 2. Sanity-check the staged version.
  if (!fs.existsSync(abs)) continue; // deletion — let git handle it
  const next = fs.readFileSync(abs, "utf-8");

  if (next.trim().length === 0) {
    errors.push(`${rel}: file is empty.`);
    continue;
  }
  // If the previous version had frontmatter and the new one doesn't, warn loudly.
  if (
    prev.status === 0 &&
    prev.stdout.startsWith("---") &&
    !next.startsWith("---")
  ) {
    errors.push(`${rel}: YAML frontmatter was removed.`);
  }
}

if (errors.length > 0) {
  // eslint-disable-next-line no-console
  console.error(
    "\nModelBound pre-skill-write hook blocked the commit:\n" +
      errors.map((e) => `  • ${e}`).join("\n") +
      "\n\nFix the file(s), or bypass with `MODELBOUND_SKIP_HOOK=1 git commit ...`\n" +
      "Previous versions are backed up under .modelbound/backups/.\n",
  );
  process.exit(1);
}
process.exit(0);
