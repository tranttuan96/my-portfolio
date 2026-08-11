#!/bin/sh
# Stop hook — the turn does not end until the verify gate is green.
#
# Claude Code passes the hook payload on stdin. `stop_hook_active` is true when
# this turn is already a continuation forced by a previous Stop block; bail out
# in that case so a gate that can never pass cannot loop forever.
#
# vite build is deliberately not in here: it is the slowest stage and adds
# nothing tsc has not already caught. Run `npm run build` before committing.

payload=$(cat)
active=$(printf '%s' "$payload" | python3 -c \
  'import json,sys; print(json.load(sys.stdin).get("stop_hook_active", False))' \
  2>/dev/null)

[ "$active" = "True" ] && exit 0

fail() {
  printf 'Verify gate failed — fix this before finishing:\n\n%s\n' "$1" >&2
  exit 2
}

out=$(sh scripts/check-no-external-assets.sh 2>&1) || fail "$out"
out=$(npx tsc --noEmit 2>&1)                       || fail "$out"
out=$(python3 .claude/skills/audit-docs/check-tokens.py 2>&1) || fail "$out"

exit 0
