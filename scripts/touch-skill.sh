#!/usr/bin/env bash
# Lightweight on-save touch for skill files.
# Surfaces a one-line token budget hint after edit.
# Never blocks the edit — exit 0 even on errors.

set -eu

file="${CURSOR_HOOK_FILE_PATH:-}"
[ -z "$file" ] && exit 0
[ ! -f "$file" ] && exit 0

is_skill_file() {
  local f="$1"
  local base rel
  base=$(basename "$f")
  rel="${f#./}"
  rel="${rel//\\//}"

  [ "$base" = "SKILL.md" ] && return 0
  [[ "$rel" =~ ^\.modelbound/[^/]+\.(md|json)$ ]] && return 0
  [[ "$rel" =~ ^\.kiro/skills/[^/]+\.md$ ]] && return 0
  [[ "$rel" =~ ^\.cursor/rules/[^/]+\.(md|mdc)$ ]] && return 0
  [[ "$rel" =~ ^\.claude/[^/]+\.md$ ]] && return 0
  [[ "$rel" =~ (^|/)(skills|\.cursor/skills|\.agents/skills|\.workspace/skills)/ ]] && return 0
  return 1
}

is_skill_file "$file" || exit 0

bytes=$(wc -c <"$file" | tr -d ' ')
tokens=$(( bytes / 4 ))

if   [ "$tokens" -gt 5000 ]; then status="🔴 ${tokens} tokens — split recommended"
elif [ "$tokens" -gt 2000 ]; then status="🟡 ${tokens} tokens — watch budget"
else                              status="🟢 ${tokens} tokens"
fi

label=$(basename "$file")
printf '[modelbound] %s — %s\n' "$label" "$status" >&2
exit 0
