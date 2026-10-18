# /mb-profile
Profile every skill and rule in this repo: token footprint, loop risk, unsafe commands. Offline, no account, no AI cost. Usage: `/mb-profile [folder]` (defaults to the repo root).

```bash
npx -y modelbound@latest scan "<folder>"
```

Summarize in three lines: total tokens loaded, the heaviest skill and its share, and each blocking finding with its one-line fix.
Offer to slim the heaviest skill or fix blocking findings. To profile real runs, point the user to https://modelbound.co/connect.
