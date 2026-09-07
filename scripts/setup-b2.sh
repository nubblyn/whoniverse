#!/usr/bin/env bash
# Connect rclone to your Backblaze B2 bucket. Run this yourself, in your own
# terminal — it asks for the key here so it never has to be pasted anywhere
# else. The key is stored only in rclone's own config file on this machine.
#
# Before running, in the Backblaze web UI:
#   1. Buckets -> Create a Bucket:  name  whoniverse   ·  Public   ·  EU
#   2. Application Keys -> Add:      restricted to that bucket, Read and Write
#
# Then:  bash scripts/setup-b2.sh

set -euo pipefail

. "$(dirname "$0")/lib/find-rclone.sh"
RCLONE="${RCLONE:-$(find_rclone)}" || exit 1
BUCKET="${BUCKET:-whoniverse}"

echo "Backblaze B2 -> rclone remote 'b2'"
echo
read -r  -p "keyID:            " KEY_ID
read -rs -p "applicationKey:   " APP_KEY
echo
echo

if [ -z "$KEY_ID" ] || [ -z "$APP_KEY" ]; then
  echo 'both values are required — nothing was written'
  exit 1
fi

"$RCLONE" config create b2 b2 account="$KEY_ID" key="$APP_KEY" --non-interactive >/dev/null
unset APP_KEY

echo "remote created. checking access..."
if ! "$RCLONE" lsd b2: >/dev/null 2>&1; then
  echo "could not list buckets with that key — check keyID / applicationKey and try again"
  "$RCLONE" config delete b2
  exit 1
fi

if "$RCLONE" lsd b2: 2>/dev/null | awk '{print $NF}' | grep -qx "$BUCKET"; then
  echo "bucket '$BUCKET' found."
else
  echo "bucket '$BUCKET' not visible to this key."
  echo "either create it (Public, EU) in the Backblaze UI, or the key is restricted to a different bucket."
  exit 1
fi

echo
echo "ready. the copy can start:  npm run mirror"
