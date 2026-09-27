#!/usr/bin/env node
/** Validate modelbound-cursor-plugin structure, commands, and hook smoke tests. */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const smoke = process.argv.includes("--smoke");

let failed = 0;
function ok(msg) {
  console.log(`✓ ${msg}`);
}
function bad(msg) {
  console.error(`✗ ${msg}`);
  failed++;
}

const cursorCmd = path.join(root, ".cursor/commands");
const required = [
  ".cursor-plugin/plugin.json",
  "hooks/hooks.json",
  "scripts/mb.mjs",
  "scripts/install.mjs",
  "README.md",
];

for (const rel of required) {
  if (!fs.existsSync(path.join(root, rel))) bad(`missing ${rel}`);
  else ok(rel);
}

if (!fs.existsSync(cursorCmd)) {
  bad("missing .cursor/commands");
} else {
  const mbCommands = fs.readdirSync(cursorCmd).filter((f) => f.startsWith("mb-") && f.endsWith(".md"));
  if (mbCommands.length < 20) bad(`expected many mb-*.md commands, found ${mbCommands.length}`);
  else ok(`${mbCommands.length} mb-* slash command files`);

  for (const name of [
    "mb-report.md",
    "mb-reliability.md",
    "mb-harness.md",
    "mb-trace.md",
    "mb-health.md",
    "mb-init.md",
    "mb-new.md",
    "mb-trust.md",
  ]) {
    if (!fs.existsSync(path.join(cursorCmd, name))) bad(`missing .cursor/commands/${name}`);
    else ok(`.cursor/commands/${name}`);
  }
}

const hooks = JSON.parse(fs.readFileSync(path.join(root, "hooks/hooks.json"), "utf8"));
if (!hooks.hooks?.beforeFileEdit?.length || !hooks.hooks?.afterFileEdit?.length) {
  bad("hooks.json must define beforeFileEdit and afterFileEdit");
} else {
  ok("hooks.json before/after file edit");
}

if (smoke) {
  for (const rel of ["scripts/backup-skill.sh", "scripts/touch-skill.sh"]) {
    if (!fs.existsSync(path.join(root, rel))) bad(`missing ${rel}`);
    else ok(rel);
  }
  const mbHelp = spawnSync(process.execPath, [path.join(root, "scripts/mb.mjs"), "--help"], {
    encoding: "utf8",
    env: { ...process.env, PATH: process.env.PATH },
  });
  if (mbHelp.status !== 0 && !`${mbHelp.stdout}${mbHelp.stderr}`.includes("Usage")) {
    bad("mb.mjs --help (needs modelbound CLI on PATH or npx)");
  } else {
    ok("mb.mjs launcher runs");
  }
}

if (failed) process.exit(1);
console.log("\nPlugin validation passed.");
