#!/usr/bin/env bash
# Pre-edit backup for SKILL.md files.
# Creates a timestamped copy under .mb-backup/ before any edit.
# Silent on failure — backup is best-effort.

set -e

file="${CURSOR_HOOK_FILE_PATH:-}"
[ -z "$file" ] && exit 0
[ ! -f "$file" ] && exit 0

# Only backup SKILL.md files
[[ "$file" =~ SKILL\.md$ ]] || exit 0

ts=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
rel=$(realpath --relative-to="$(pwd)" "$file" 2>/dev/null || echo "$file")
safe=${rel//\//__}
backup_dir=".mb-backup"
out="$backup_dir/${safe}.${ts}.bak"

mkdir -p "$backup_dir"
cp "$file" "$out" 2>/dev/null || true
exit 0
