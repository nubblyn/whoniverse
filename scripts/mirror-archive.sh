#!/usr/bin/env bash
# Mirror the New Who items from archive.org into Backblaze B2.
#
# rclone reads the Internet Archive with its own backend and writes to B2 with
# its own backend; nothing is staged on disk. The bytes do stream through
# whichever machine runs this, so from home that is 305GB down and 305GB up.
# On a throwaway VPS in Europe (B2's EU region is Amsterdam) it is an hour or
# two and a euro or two, and your connection never sees it.
#
# Only the originals are copied — E*.mp4, E*.srt, E*.jpg at the item root.
# archive.org grows a 3-8GB tail of its own derivatives per item: an
# E*.ia.mp4 re-encode and an E*_thumb.jpg per episode, a .thumbs/ strip,
# a torrent. Across all sixteen items that is 101GB of the 406GB they report,
# and none of it is ours. The filter rules below are ordered — rclone takes
# the first match — so the excludes must come before the includes.
#
# One-time setup, on whichever machine runs this:
#
#   rclone config        create two remotes, names below:
#     ia     type internetarchive   leave the access key blank: public read
#     b2     type b2                 the bucket's application key, scoped to it
#
# Credentials live in rclone's own config, never here.
#
#   scripts/mirror-archive.sh            all sixteen seasons
#   scripts/mirror-archive.sh 01 04      just these
#   DRY=1 scripts/mirror-archive.sh      list what would copy, move nothing
#
# Re-running is safe: anything already in the bucket is skipped.

set -euo pipefail

. "$(dirname "$0")/lib/find-rclone.sh"
RCLONE="${RCLONE:-$(find_rclone)}" || exit 1

IA_REMOTE="${IA_REMOTE:-ia}"
DEST_REMOTE="${DEST_REMOTE:-b2}"
BUCKET="${BUCKET:-whoniverse}"
PREFIX="${PREFIX:-new-who}"

FILTER=(
  --filter '- *.ia.mp4'
  --filter '- /*.thumbs/**'
  --filter '- *_thumb.jpg'
  --filter '+ /E*.mp4'
  --filter '+ /E*.srt'
  --filter '+ /E*.jpg'
  --filter '- *'
)

seasons=("$@")
if [ ${#seasons[@]} -eq 0 ]; then
  seasons=(01 02 03 04 05 06 07 08 09 10 11 12 13 14 15 16)
fi

dry=()
[ -n "${DRY:-}" ] && dry=(--dry-run)

for n in "${seasons[@]}"; do
  echo "== nw_S$n -> $DEST_REMOTE:$BUCKET/$PREFIX/S$n"
  "$RCLONE" copy "$IA_REMOTE:nw_S$n" "$DEST_REMOTE:$BUCKET/$PREFIX/S$n" \
    "${FILTER[@]}" \
    --transfers 4 --checkers 8 \
    --b2-chunk-size 96M --b2-upload-concurrency 4 \
    --retries 5 --low-level-retries 20 \
    --progress --stats-one-line \
    "${dry[@]}"
done

echo
echo "done. next: MEDIA_BASE=https://media.<your-domain> npm run relink"
