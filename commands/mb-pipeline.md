# /mb-pipeline
Run the Skill Development Pipeline. Usage: `/mb-pipeline <skill-file|slug> [--stage full|test_optimize|production]`.

Parse the first token as the skill target (file path preferred — no UUID needed). Remaining flags pass through.

Execute:
```bash
npx -y @modelbound/cli pipeline run --skill "<skill>" $REST --watch
```

Pre-flight (automatic): workspace context → sync file → repo-linked UUID → pipeline run.

Summarize each stage from `stage_results` (edit, test, production). On failure, run `findings list` and propose fixes.

Known backend blockers may affect pipeline until Lovable deploys `_actor` and `version_before/version_after` fixes — surface errors verbatim.
