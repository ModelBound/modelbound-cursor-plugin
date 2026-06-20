#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const repo = process.argv[2] || path.join(os.homedir(), "Documents/modelbound/modelbound-cursor-extension");
const mb = path.join(path.dirname(new URL(import.meta.url).pathname), "mb.mjs");
const skill = ".modelbound/prompt-pr-contributor.md";

function loadKey() {
  if (process.env.MODELBOUND_API_KEY) return;
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".modelbound", "config.json"), "utf8"));
    if (cfg.token) process.env.MODELBOUND_API_KEY = cfg.token;
  } catch { /* noop */ }
  try {
    const envPath = path.join(path.dirname(mb), "..", ".env");
    const m = fs.readFileSync(envPath, "utf8").match(/MODELBOUND_API_KEY=(.+)/);
    if (m) process.env.MODELBOUND_API_KEY = m[1].trim();
  } catch { /* noop */ }
}

loadKey();

const tests = [
  ["health", [mb, "health"]],
  ["whoami", [mb, "auth", "status"]],
  ["context set", [mb, "context", "set", "--repo", "ModelBound/modelbound-cursor-extension"]],
  ["sync", [mb, "sync", "--file", skill]],
  ["findings list", [mb, "findings", "list", "--skill", skill]],
  ["benchmark", [mb, "benchmark", "--skill", skill]],
  ["compare numeric", [mb, "compare", "--skill", skill, "--from", "0.1.31", "--to", "0.1.32"]],
  ["compare latest/current", [mb, "compare", "--skill", skill, "--from", "latest", "--to", "current"]],
  ["suggest", [mb, "suggest", "--skill", skill]],
  ["pipeline config", [mb, "pipeline", "config", "--skill", skill]],
  ["pipeline status", [mb, "pipeline", "status", "--skill", skill]],
  ["test", [mb, "test", "--skill", skill]],
  ["versions", [mb, "versions", "--skill", skill]],
  ["version diff", [mb, "version", "diff", "--skill", skill, "--from", "0.1.31", "--to", "0.1.32"]],
  ["optimize dry-run", [mb, "optimize", "prompt-pr-contributor", "--dry-run"]],
  ["eval list", [mb, "eval", "list"]],
  ["pipeline run test_optimize", [mb, "pipeline", "run", "--skill", skill, "--stage", "test_optimize", "--no-watch"]],
];

const results = [];
for (const [name, args] of tests) {
  const r = spawnSync("node", args, { cwd: repo, encoding: "utf8", env: process.env });
  const tail = (r.stdout + r.stderr).trim().split("\n").slice(-12).join("\n");
  const ok = r.status === 0;
  results.push({ name, ok, status: r.status ?? 1, tail });
  console.log(`\n===== ${name} ===== ${ok ? "PASS" : "FAIL"}`);
  console.log(tail);
}

console.log("\n\n=== SUMMARY ===");
for (const r of results) console.log(`${r.ok ? "✓" : "✗"} ${r.name}`);
process.exit(results.some((r) => !r.ok) ? 1 : 0);
