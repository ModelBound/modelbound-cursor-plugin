#!/usr/bin/env node
// Pre-skill-write Git hook for the ModelBound Cursor plugin.
//
// Usage: install as `.git/hooks/pre-commit` (or via Husky / lefthook).
//   exec node ${PROJECT_ROOT}/scripts/pre-skill-write.mjs "$@"
//
// Watched skill paths (matches extension skillDetect.ts):
//   .modelbound/**/*.md|.json, .kiro/skills/**/*.md, .cursor/rules/**/*.md|.mdc,
//   .claude/**/*.md, .agents/skills/**/SKILL.md, legacy skills/** paths.
//
// Exit codes: 0 = allow, 1 = block.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

if (process.env.MODELBOUND_SKIP_HOOK === "1") process.exit(0);

/** @param {string} p */
function isSkillPath(p) {
  const norm = p.replace(/\\/g, "/");
  const base = path.basename(norm);
  if (base === "SKILL.md") return true;
  if (/^\.modelbound\/[^/]+\.(md|json)$/i.test(norm)) return true;
  if (/^\.kiro\/skills\/[^/]+\.md$/i.test(norm)) return true;
  if (/^\.cursor\/rules\/[^/]+\.(md|mdc)$/i.test(norm)) return true;
  if (/^\.claude\/[^/]+\.md$/i.test(norm)) return true;
  return /(^|\/)(skills|\.cursor\/skills|\.agents\/skills|\.workspace\/skills)\//.test(norm);
}

const git = (args) =>
  execFileSync("git", args, { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] }).trim();

let staged;
try {
  staged = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]).split("\n").filter(Boolean);
} catch {
  process.exit(0);
}

const skillFiles = staged.filter(isSkillPath);
if (skillFiles.length === 0) process.exit(0);

const repoRoot = git(["rev-parse", "--show-toplevel"]);
const backupRoot = path.join(repoRoot, ".modelbound", "backups");

const errors = [];

for (const rel of skillFiles) {
  const abs = path.join(repoRoot, rel);

  const prev = spawnSync("git", ["show", `HEAD:${rel}`], { encoding: "utf-8" });
  if (prev.status === 0 && typeof prev.stdout === "string" && prev.stdout.length > 0) {
    fs.mkdirSync(backupRoot, { recursive: true });
    const sha = git(["rev-parse", "--short", "HEAD"]).slice(0, 10);
    const dst = path.join(backupRoot, `${sha}-${path.basename(rel)}`);
    fs.writeFileSync(dst, prev.stdout);
  }

  if (!fs.existsSync(abs)) continue;
  const next = fs.readFileSync(abs, "utf-8");

  if (next.trim().length === 0) {
    errors.push(`${rel}: file is empty.`);
    continue;
  }
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
      "\n\nOverride with --no-verify or MODELBOUND_SKIP_HOOK=1.\n",
  );
  process.exit(1);
}

process.exit(0);
