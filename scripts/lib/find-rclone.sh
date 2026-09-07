# Locate the rclone binary.
#
# Not simply "$LOCALAPPDATA/rclone/rclone.exe". That variable is often absent
# by the time PowerShell has launched npm which has launched bash, and when it
# is present it holds a Windows path with backslashes that bash cannot use as
# it stands. Missing both produced a literal "/rclone/rclone.exe: No such file
# or directory" — the path collapsed around an empty variable.
#
# Usage:  . "$(dirname "$0")/lib/find-rclone.sh"
#         RCLONE="$(find_rclone)" || exit 1

# C:\Users\x\AppData\Local  ->  /c/Users/x/AppData/Local
_to_unix_path() {
  if command -v cygpath >/dev/null 2>&1; then
    cygpath -u "$1" 2>/dev/null && return 0
  fi
  # Fall back to doing it by hand: flip the separators, then lowercase the
  # drive letter and turn "c:" into "/c". Done with tr and a case statement
  # rather than sed's \L, which is a GNU extension and not always present.
  local p drive rest
  p="$(printf '%s' "$1" | tr '\\' '/')"
  case "$p" in
    [A-Za-z]:/*)
      drive="$(printf '%s' "${p%%:*}" | tr 'A-Z' 'a-z')"
      rest="${p#*:}"
      printf '/%s%s' "$drive" "$rest"
      ;;
    *) printf '%s' "$p" ;;
  esac
}

find_rclone() {
  if command -v rclone >/dev/null 2>&1; then
    command -v rclone
    return 0
  fi

  local base unix c
  for base in "${LOCALAPPDATA:-}" "${USERPROFILE:-}/AppData/Local" "$HOME/AppData/Local"; do
    [ -n "$base" ] || continue
    unix="$(_to_unix_path "$base")"
    for c in "$unix/rclone/rclone.exe" "$unix/rclone/rclone"; do
      if [ -x "$c" ]; then
        printf '%s' "$c"
        return 0
      fi
    done
  done

  echo "rclone not found on PATH or under AppData/Local/rclone." >&2
  echo "Install the portable build:" >&2
  echo '  mkdir -p "$HOME/AppData/Local/rclone" && cd "$HOME/AppData/Local/rclone" \' >&2
  echo '    && curl -sLo r.zip https://downloads.rclone.org/rclone-current-windows-amd64.zip \' >&2
  echo '    && unzip -oq r.zip && mv -f rclone-*/rclone.exe . && rm -rf rclone-* r.zip' >&2
  return 1
}
