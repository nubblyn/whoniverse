#!/bin/bash
# Watch Downloads for completed TorBox zips, extract each, verify, delete the zip.
#
# Why it has to exist: the 27 packs are 266.6 GiB of zips, and extracting them
# all before deleting any would need 533 GiB against 412 GiB free. Handling them
# one at a time keeps peak use near a single season instead of the whole set.
#
# TorBox writes NAME.HASH.zip.part while downloading and a 0-byte NAME.zip
# placeholder beside it, so a zip is only ready when it has bytes and no .part
# is left matching it.

DL="/c/Users/hello/Downloads"
SZ="C:/Program Files/7-Zip/7z.exe"
LOG="${1:-$DL/unzip-watcher.log}"
DONE="$DL/.unzip-done"
touch "$DONE"

log() { echo "[$(date '+%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

log "watcher started, watching $DL"
log "$(ls "$DL"/*.zip.part 2>/dev/null | wc -l) downloads in progress"

idle=0
quiet=0
while true; do
  acted=0
  for z in "$DL"/*.zip; do
    [ -e "$z" ] || continue
    [ -s "$z" ] || continue                       # 0-byte placeholder, still downloading
    name=$(basename "$z")
    grep -qxF "$name" "$DONE" && continue         # handled already
    base="${name%.zip}"

    # TorBox's in-progress file is NAME.HASH.zip.part — if one matches, wait
    if compgen -G "$DL/$base".*.zip.part > /dev/null; then continue; fi
    [ -e "$z.part" ] && continue

    # 7z.exe is a Windows program and cannot read /c/Users/... . Git Bash
    # usually rewrites such arguments on the way out, but the heuristic gives up
    # on a name containing brackets, and scene releases are full of them
    # ("...-EDITH[TGx].zip"). Four archives were reported corrupt on that basis
    # while 7z t passed on all four by hand. Convert it here instead of hoping.
    zw=$(cygpath -w "$z")

    sz=$(stat -c %s "$z")
    log "complete: $name ($(awk -v b="$sz" 'BEGIN{printf "%.2f", b/1073741824}') GiB)"

    # 1. integrity first — never delete a zip we have not verified
    if ! "$SZ" t "$zw" -bso0 -bsp0 >/dev/null 2>&1; then
      log "  FAILED integrity test, leaving it alone"
      echo "$name" >> "$DONE"; acted=1; continue
    fi

    # 2. one common top-level dir means extract in place; otherwise make a folder
    tops=$("$SZ" l -ba -slt "$zw" 2>/dev/null | grep -a '^Path = ' | sed 's/^Path = //' \
           | tr '\\' '/' | cut -d/ -f1 | sort -u)
    ntop=$(echo "$tops" | grep -ac .)
    if [ "$ntop" -eq 1 ]; then dest="$DL"; else dest="$DL/$base"; mkdir -p "$dest"; fi
    want=$("$SZ" l -ba "$zw" 2>/dev/null | grep -avc '^....................D')

    # 3. extract
    if "$SZ" x "$zw" -o"$(cygpath -w "$dest")" -y -bso0 -bsp0 >/dev/null 2>&1; then
      if [ "$ntop" -eq 1 ]; then check="$DL/$tops"; else check="$dest"; fi
      got=$(find "$check" -type f 2>/dev/null | wc -l)
      log "  extracted to $(basename "$check"): $got files, archive listed $want"
      # 4. only delete once the file count checks out
      if [ "$got" -ge "$want" ] && [ "$got" -ge 1 ]; then
        rm -f "$z"
        log "  deleted the zip, freed $(awk -v b="$sz" 'BEGIN{printf "%.2f", b/1073741824}') GiB"
      else
        log "  file count short, keeping the zip"
      fi
    else
      log "  extraction failed, keeping the zip"
    fi
    echo "$name" >> "$DONE"; acted=1
  done

  # Done only when it has looked quiet for a long stretch. TorBox goes quiet
  # between items — no .part on disk for a minute or two — and an earlier
  # version took the first such gap as "finished" and exited with twelve
  # downloads still to come. Require 40 consecutive quiet checks, 20 minutes.
  parts=$(compgen -G "$DL"/*.zip.part > /dev/null && echo yes || echo no)
  left=0
  for z in "$DL"/*.zip; do
    [ -s "$z" ] || continue
    grep -qxF "$(basename "$z")" "$DONE" || left=1
  done
  if [ "$parts" = "no" ] && [ "$left" -eq 0 ]; then
    quiet=$((quiet+1))
    [ "$quiet" -eq 1 ] && log "nothing in flight; will exit if it stays quiet for 20 minutes"
    if [ "$quiet" -ge 40 ]; then
      log "quiet for 20 minutes, exiting"
      break
    fi
  else
    [ "${quiet:-0}" -gt 0 ] && log "work reappeared, staying up"
    quiet=0
  fi

  if [ "$acted" -eq 0 ]; then idle=$((idle+1)); else idle=0; fi
  if [ "$idle" -gt 480 ]; then log "idle four hours with work outstanding, exiting"; break; fi
  sleep 30
done
