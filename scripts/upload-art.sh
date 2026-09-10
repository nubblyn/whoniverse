#!/usr/bin/env bash
# Upload the addon's images to the bucket.
#
# Copies art-cdn/ (built by scripts/build-art.js) into the bucket root, so each
# series' artwork lands in that series' own folder beside its episodes:
# https://cdn.nubblyn.com/file/whoniverse/new_who/new_who_poster.jpg is what
# the registry hands to Stremio. Copy, not sync: nothing is deleted remotely.
#
#   npm run art:upload

set -euo pipefail
cd "$(dirname "$0")/.."
. scripts/lib/find-rclone.sh
RCLONE="$(find_rclone)" || exit 1

[ -d art-cdn ] || { echo "art-cdn/ missing — run: npm run art" >&2; exit 1; }

"$RCLONE" copy art-cdn b2:whoniverse --transfers 8 -v --stats-one-line 2>&1 | tail -3
echo "uploaded: $(find art-cdn -type f | wc -l) files"
