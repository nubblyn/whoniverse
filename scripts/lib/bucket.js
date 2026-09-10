// Ask the bucket what it holds, and what each file's bytes hash to.
//
// The node side of scripts/lib/find-rclone.sh. Two callers so far:
// build-spinoffs.js, which needs the listing to find each episode's files, and
// stamp-media.js, which needs only the hashes.
//
// B2 stores a SHA1 with every object and rclone hands it over in the same call
// that lists the folder, so a cache-busting stamp costs nothing extra and is
// taken from the copy actually being served. Hashing a local file instead
// looked equivalent and was not: media is deleted from this machine once the
// bucket holds it, which is the point of putting it there, and the builder
// broke the day the spin-offs were cleared off the disk.

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const BUCKET = 'b2:whoniverse';
const CDN = 'https://cdn.nubblyn.com/file/whoniverse';

/** rclone, from PATH or the portable install under AppData\Local. */
function findRclone() {
  const local = path.join(process.env.LOCALAPPDATA || '', 'rclone', 'rclone.exe');
  return fs.existsSync(local) ? local : 'rclone';
}

/**
 * Everything under `prefix`, as bucket-relative path -> { size, sha1 }.
 * `prefix` is a folder in the bucket, e.g. 'new_who'. Omit it for the lot.
 *
 * A missing hash comes back as '' rather than undefined. B2 leaves the SHA1
 * off an object uploaded as a large file in parts, and a caller stamping URLs
 * needs to tell "no hash for this" from "no such file".
 */
function listing(prefix = '') {
  const where = prefix ? `${BUCKET}/${prefix}` : BUCKET;
  const rows = JSON.parse(execFileSync(findRclone(),
    ['lsjson', '-R', '--hash', '--files-only', where],
    { encoding: 'utf8', maxBuffer: 1 << 28 }));
  const out = new Map();
  for (const f of rows) {
    out.set(f.Path.replace(/\\/g, '/'), {
      size: f.Size,
      sha1: (f.Hashes && f.Hashes.sha1) || '',
    });
  }
  return out;
}

/** Eight characters of a SHA1: enough to change a URL, short enough to read. */
function shortHash(sha1) {
  return sha1 ? sha1.slice(0, 8) : '';
}

module.exports = { BUCKET, CDN, findRclone, listing, shortHash };
