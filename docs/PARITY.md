# CLI parity (modelbound vs Cursor plugin)

Slash commands invoke `node .modelbound/mb.mjs …`, which runs the **[modelbound](https://www.npmjs.com/package/modelbound)** CLI (currently pinned to **0.3.6** when using npx).

## Covered in Cursor (`/mb-*`)

| CLI area | Cursor command |
|----------|----------------|
| Auth | `/mb-login`, `/mb-logout`, `/mb-whoami` |
| MCP health | `/mb-health` |
| Context / sync | `/mb-context`, `/mb-sync` |
| Pipeline / test / eval | `/mb-pipeline`, `/mb-pipeline-config`, `/mb-test`, `/mb-test-optimize`, `/mb-eval` |
| Optimize / versions | `/mb-optimize`, `/mb-versions`, `/mb-diff`, `/mb-restore`, `/mb-benchmark`, `/mb-compare` |
| Trust & safety | `/mb-findings`, `/mb-suggest` |
| Feedback loop | `/mb-report`, `/mb-reliability` |
| Harness gate | `/mb-harness` → `mb harness` |
| Local anti-slop | `/mb-init`, `/mb-new`, `/mb-trust`, `/mb-lint`, `/mb-validate` |
| Run attribution | `/mb-trace` → MCP `report_run` (step summaries, not shell `mb trace`) |

## CLI-only (use terminal or add commands later)

| CLI command | Why not slash (yet) |
|-------------|---------------------|
| `review *` | Multi-step local lifecycle; use CLI or extension |
| `detect`, `ls` | Repo introspection; run `mb detect` / `mb ls` in terminal |
| `backup *` | Handled by plugin hooks + extension |
| `push` / `pull` | Use `/mb-sync` or extension pull |
| `config`, `mcp` | Advanced; rare in chat |
| `skills`, `skill` | Cloud library; partially covered by MCP in Cursor |
| `mb trace` (shell) | Cursor uses MCP tracing via `/mb-trace`; CLI `trace` wraps arbitrary commands for CI |

Install latest CLI: `npm install -g modelbound@0.3.6`
