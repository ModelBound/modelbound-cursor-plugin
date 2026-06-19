#!/usr/bin/env bash
# Pre-edit backup for skill files (extension skillDetect paths).
# Creates a timestamped copy under .mb-backup/ before any edit.
# Silent on failure — backup is best-effort.

set -e

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

ts=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
rel=$(realpath --relative-to="$(pwd)" "$file" 2>/dev/null || echo "$file")
safe=${rel//\//__}
backup_dir=".mb-backup"
out="$backup_dir/${safe}.${ts}.bak"

mkdir -p "$backup_dir"
cp "$file" "$out" 2>/dev/null || true
exit 0
