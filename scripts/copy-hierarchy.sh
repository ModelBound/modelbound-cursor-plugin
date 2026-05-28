#!/usr/bin/env bash
# Read a markdown outline from stdin and copy it to the system clipboard.
# Falls back to printing the outline so users on bare Linux can still grab it.
set -eu

payload="$(cat || true)"
[ -z "$payload" ] && { echo "[show-hierarchy] nothing to copy" >&2; exit 0; }

copy() {
  if command -v pbcopy >/dev/null 2>&1; then
    printf '%s' "$payload" | pbcopy && return 0
  fi
  if command -v wl-copy >/dev/null 2>&1; then
    printf '%s' "$payload" | wl-copy && return 0
  fi
  if command -v xclip >/dev/null 2>&1; then
    printf '%s' "$payload" | xclip -selection clipboard && return 0
  fi
  if command -v clip.exe >/dev/null 2>&1; then
    printf '%s' "$payload" | clip.exe && return 0
  fi
  return 1
}

if copy; then
  echo "[show-hierarchy] copied resource tree to clipboard ($(printf '%s' "$payload" | wc -l | tr -d ' ') lines)" >&2
else
  echo "[show-hierarchy] no clipboard tool found — outline below:" >&2
  printf '%s\n' "$payload"
fi
