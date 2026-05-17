#!/usr/bin/env bash
set -euo pipefail

INPUT="$(cat)"
FILE_PATH="$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')"

[ -n "$FILE_PATH" ] || exit 0

case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx)
    npm run lint:file -- "$FILE_PATH" >/dev/null 2>&1 || {
      echo "Validation failed: lint error in $FILE_PATH" >&2
      exit 2
    }
    ;;
  *)
    exit 0
    ;;
esac
