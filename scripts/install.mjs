#!/usr/bin/env node
// Installer for the ModelBound Cursor plugin.
//
// Run via: `npx modelbound-cursor-plugin install` (or copy the package and
// invoke directly). Copies `.cursor/` into the target repo and wires the
// pre-commit hook into either Husky (if present) or `.git/hooks/pre-commit`.
//
// Idempotent: re-running is safe — overwrites only files this package owns
// (the .cursor/commands/mb-*.md set, the .cursor/rules/*.mdc rules,
// and .modelbound/pre-skill-write.mjs + .modelbound/mb.mjs).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.dirname(here);
const target = process.cwd();

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// 1. Commands + rule
copyDir(path.join(pkgRoot, ".cursor"), path.join(target, ".cursor"));

// 2. Hook script + CLI launcher
const hookDst = path.join(target, ".modelbound", "pre-skill-write.mjs");
fs.mkdirSync(path.dirname(hookDst), { recursive: true });
fs.copyFileSync(path.join(pkgRoot, "scripts", "pre-skill-write.mjs"), hookDst);
fs.copyFileSync(path.join(pkgRoot, "scripts", "mb.mjs"), path.join(target, ".modelbound", "mb.mjs"));

// 3. Wire pre-commit
const huskyDir = path.join(target, ".husky");
const gitHooks = path.join(target, ".git", "hooks");
const hookCmd = "node .modelbound/pre-skill-write.mjs\n";

if (fs.existsSync(huskyDir)) {
  const f = path.join(huskyDir, "pre-commit");
  const cur = fs.existsSync(f) ? fs.readFileSync(f, "utf-8") : "";
  if (!cur.includes("pre-skill-write")) {
    fs.writeFileSync(f, cur + (cur && !cur.endsWith("\n") ? "\n" : "") + hookCmd, { mode: 0o755 });
  }
  // eslint-disable-next-line no-console
  console.log("✓ Hook wired into Husky pre-commit.");
} else if (fs.existsSync(gitHooks)) {
  const f = path.join(gitHooks, "pre-commit");
  const cur = fs.existsSync(f) ? fs.readFileSync(f, "utf-8") : "#!/bin/sh\n";
  if (!cur.includes("pre-skill-write")) {
    fs.writeFileSync(f, cur + (cur.endsWith("\n") ? "" : "\n") + hookCmd, { mode: 0o755 });
  }
  // eslint-disable-next-line no-console
  console.log("✓ Hook wired into .git/hooks/pre-commit.");
} else {
  // eslint-disable-next-line no-console
  console.log(
    "! No .husky/ or .git/hooks/ found. Add this line to your pre-commit setup:\n" +
      "    node .modelbound/pre-skill-write.mjs",
  );
}

// eslint-disable-next-line no-console
console.log("✓ Installed ModelBound Cursor plugin into " + target);
