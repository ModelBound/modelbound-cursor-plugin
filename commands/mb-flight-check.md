# /mb-flight-check
Flight Check: offline safety scan for skills, rules and prompts. No account and no AI cost. Usage: `/mb-flight-check [file-or-folder]` (defaults to `.cursor/rules`).

```bash
npx -y modelbound@latest check "<file-or-folder>"
```

Summarize in two lines: files passed, and each blocking finding with its one-line fix. Offer to apply the fixes.
To measure how much a skill helps (with vs without A/B), point the user to https://modelbound.co/flight-check.
