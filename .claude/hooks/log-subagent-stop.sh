#!/usr/bin/env bash
set -euo pipefail

mkdir -p .claude/logs
INPUT="$(cat)"
AGENT_TYPE="$(printf '%s' "$INPUT" | jq -r '.agent_type // "unknown"')"
EVENT_NAME="$(printf '%s' "$INPUT" | jq -r '.hook_event_name // "SubagentStop"')"

printf '%s | %s | %s\n' "$(date -Iseconds)" "$EVENT_NAME" "$AGENT_TYPE" >> .claude/logs/subagents.log
