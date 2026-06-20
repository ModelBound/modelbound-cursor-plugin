# /mb-test-optimize
Full Test & Optimize workflow for a skill (matches the ModelBound Skill Editor panel).

**Recommended flow:**
```bash
node .modelbound/mb.mjs context set --repo "$(git remote get-url origin | sed -E 's#.*[:/]([^/]+/[^/.]+).*#\1#')"
node .modelbound/mb.mjs sync --file "<skill-file>"
node .modelbound/mb.mjs findings list --skill "<skill-file>"
# If user wants to dismiss a false positive:
node .modelbound/mb.mjs findings ignore --skill "<skill-file>" --key "<stable-key>"
node .modelbound/mb.mjs benchmark --skill "<skill-file>"
node .modelbound/mb.mjs compare --skill "<skill-file>" --from latest --to current
node .modelbound/mb.mjs suggest --skill "<skill-file>"
node .modelbound/mb.mjs pipeline run --skill "<skill-file>" --stage test_optimize --watch
```

Use `/mb-pipeline-config` to adjust trust/latency/test gates before re-running.
