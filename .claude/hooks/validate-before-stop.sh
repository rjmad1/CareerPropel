#!/usr/bin/env bash
set -euo pipefail

npm run lint >/dev/null 2>&1 || {
  echo "Validation failed: project lint failed" >&2
  exit 2
}

npm run type-check >/dev/null 2>&1 || {
  echo "Validation failed: typecheck failed" >&2
  exit 2
}

exit 0
