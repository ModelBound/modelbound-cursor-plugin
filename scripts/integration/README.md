# Cursor plugin integration tests

No Cursor IDE install required.

| Command | What it covers |
|---------|----------------|
| `npm test` | Structure + hook smoke |
| `npm run test:e2e` | Full E2E (offline + optional cloud) |
| `npm run test:e2e:full` | `npm test` then E2E with `--skip-validate` |

Cloud phases use `MODELBOUND_API_KEY` (env or `../modelbound-cli/.env`). CLI pin defaults to **modelbound@0.3.6**.

Legacy manual harness (extension fixture):

```bash
node scripts/test-commands.mjs /path/to/repo-with-skill
```
