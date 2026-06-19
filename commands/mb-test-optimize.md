# /mb-test-optimize
Full Test & Optimize workflow for a skill (matches the ModelBound Skill Editor panel).

**Recommended flow:**
```bash
npx -y @modelbound/cli context set --repo "$(git remote get-url origin | sed -E 's#.*[:/]([^/]+/[^/.]+).*#\1#')"
npx -y @modelbound/cli sync --file "<skill-file>"
npx -y @modelbound/cli findings list --skill "<skill-file>"
# If user wants to dismiss a false positive:
npx -y @modelbound/cli findings ignore --skill "<skill-file>" --key "<stable-key>"
npx -y @modelbound/cli benchmark --skill "<skill-file>"
npx -y @modelbound/cli compare --skill "<skill-file>"
npx -y @modelbound/cli suggest --skill "<skill-file>"
npx -y @modelbound/cli pipeline run --skill "<skill-file>" --stage test_optimize --watch
```

Use `/mb-pipeline-config` to adjust trust/latency/test gates before re-running.
