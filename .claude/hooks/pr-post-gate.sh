#!/bin/bash
# The gate runs before every Bash tool call, so this prefilter keeps the common
# case free of a Python process.
set -uo pipefail

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

payload="$(cat)"

case "$payload" in
  *"gh "*) ;;
  *) exit 0 ;;
esac

printf '%s' "$payload" | python3 "$HOOK_DIR/pr-post-gate.py"
