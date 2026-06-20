#!/usr/bin/env node
/**
 * ModelBound CLI launcher for Cursor slash commands.
 *
 * Resolution order:
 *   1. `modelbound` on PATH (global/local install)
 *   2. `npx -y modelbound@latest` (https://www.npmjs.com/package/modelbound)
 *   3. `npx -y github:ModelBound/modelbound-cli` (source fallback)
 *
 * Loads MODELBOUND_API_KEY from (first hit):
 *   - process.env
 *   - $CWD/.env
 *   - ~/.modelbound/config.json
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = process.argv.slice(2);
const env = { ...process.env };

function loadDotEnv(file) {
  try {
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*MODELBOUND_API_KEY\s*=\s*(.+?)\s*$/);
      if (m && !env.MODELBOUND_API_KEY) env.MODELBOUND_API_KEY = m[1].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* missing file */
  }
}

if (!env.MODELBOUND_API_KEY) loadDotEnv(path.join(process.cwd(), ".env"));
if (!env.MODELBOUND_API_KEY) {
  try {
    const cfg = JSON.parse(
      fs.readFileSync(path.join(os.homedir(), ".modelbound", "config.json"), "utf8"),
    );
    if (cfg.token) env.MODELBOUND_API_KEY = cfg.token;
  } catch {
    /* no config */
  }
}

function run(cmd, cmdArgs) {
  return spawnSync(cmd, cmdArgs, { stdio: "inherit", env, shell: false });
}

let result = run("modelbound", args);
if (!result.error) process.exit(result.status ?? 0);

if (result.error?.code === "ENOENT") {
  result = run("npx", ["-y", "modelbound@latest", ...args]);
  if (!result.error || result.status === 0) process.exit(result.status ?? 0);

  result = run("npx", ["-y", "github:ModelBound/modelbound-cli", ...args]);
  process.exit(result.status ?? 1);
}

process.exit(result.status ?? 1);
