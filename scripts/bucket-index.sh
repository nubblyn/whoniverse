#!/usr/bin/env bash
# Publish what is in the B2 bucket, so nothing has to be told by hand.
#
#   bash scripts/bucket-index.sh
#
# Writes two things from one listing:
#   ledger/out/bucket-index.txt   for ledger/viewer.py at build time
#   b2:whoniverse/bucket-index.json  for the site and the ledger at run time
#
# The second is the point. Backblaze will not list a bucket without an
# application key, and the site must not hold one, so the bucket publishes its
# own contents instead. Run this after any upload or delete and both the
# landing page and the ledger follow automatically — no redeploy, no commit.
set -euo pipefail

. "$(dirname "$0")/lib/find-rclone.sh"
RCLONE="${RCLONE:-$(find_rclone)}" || exit 1
BUCKET="${BUCKET:-whoniverse}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
TXT="$HERE/ledger/out/bucket-index.txt"
JSON="$(mktemp)"
trap 'rm -f "$JSON"' EXIT

mkdir -p "$(dirname "$TXT")"
"$RCLONE" lsf -R --files-only "b2:$BUCKET" | sort -u > "$TXT"
echo "wrote $TXT ($(wc -l < "$TXT") objects)"

# Only the paths the site asks about, so the file people download stays small:
# episode media and the per-series art. Everything else in the bucket is
# irrelevant to both surfaces.
node -e '
const fs = require("fs");
const files = fs.readFileSync(process.argv[1], "utf8").split("\n").map(s => s.trim()).filter(Boolean);
const keep = files.filter(p => /\.(mp4|mkv|m4v|srt|jpg|png)$/i.test(p));
fs.writeFileSync(process.argv[2], JSON.stringify({
  generated: new Date().toISOString(),
  count: keep.length,
  files: keep,
}));
' "$TXT" "$JSON"

"$RCLONE" copyto "$JSON" "b2:$BUCKET/bucket-index.json" \
  --header-upload "Cache-Control: public, max-age=300"
echo "published b2:$BUCKET/bucket-index.json ($(grep -cE '\.(mp4|mkv|m4v|srt|jpg|png)$' "$TXT") entries)"
