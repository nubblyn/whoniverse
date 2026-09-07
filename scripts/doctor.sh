#!/usr/bin/env bash
# Check the copy pipeline is ready: right shell, rclone present, remotes working.
#
#   npm run doctor

set -uo pipefail

. "$(dirname "$0")/lib/find-rclone.sh"

ok()   { printf '  \033[32mok\033[0m    %s\n' "$1"; }
bad()  { printf '  \033[31mFAIL\033[0m  %s\n' "$1"; }
warn() { printf '  \033[33m--\033[0m    %s\n' "$1"; }

fails=0

echo "shell"
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) ok "Git Bash ($(uname -s)) — can see the Windows rclone config" ;;
  Linux)                bad "this is WSL, which cannot see the Windows rclone config. run via: npm run doctor"; fails=$((fails+1)) ;;
  *)                    warn "$(uname -s)" ;;
esac

echo
echo "rclone"
if RCLONE="$(find_rclone)"; then
  ok "$RCLONE"
  ok "$("$RCLONE" version | head -1)"
else
  bad "not found"
  exit 1
fi

echo
echo "remotes"
remotes="$("$RCLONE" listremotes 2>/dev/null)"
for r in ia b2; do
  if printf '%s' "$remotes" | grep -qx "$r:"; then ok "$r: configured"; else bad "$r: missing"; fails=$((fails+1)); fi
done

echo
echo "source (archive.org, anonymous)"
if printf '%s' "$remotes" | grep -qx 'ia:'; then
  n="$("$RCLONE" lsf ia:nw_S01 2>/dev/null | wc -l | tr -d ' ')"
  if [ "${n:-0}" -gt 0 ]; then ok "nw_S01 readable ($n files listed)"; else bad "cannot read nw_S01"; fails=$((fails+1)); fi
fi

echo
echo "destination (backblaze b2)"
if printf '%s' "$remotes" | grep -qx 'b2:'; then
  if buckets="$("$RCLONE" lsd b2: 2>&1)"; then
    ok "key works"
    name="${BUCKET:-whoniverse}"
    if printf '%s' "$buckets" | awk '{print $NF}' | grep -qx "$name"; then
      ok "bucket '$name' visible"
    else
      bad "bucket '$name' not visible. buckets seen: $(printf '%s' "$buckets" | awk '{print $NF}' | tr '\n' ' ')"
      fails=$((fails+1))
    fi
  else
    bad "key rejected: $(printf '%s' "$buckets" | head -1)"
    fails=$((fails+1))
  fi
fi

echo
if [ "$fails" -eq 0 ]; then
  echo "ready — the copy can start:  npm run mirror"
else
  echo "$fails problem(s) above."
fi
exit "$fails"
