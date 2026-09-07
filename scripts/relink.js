// Point every New Who URL at a new host.
//
// The file layout is preserved exactly — new-who/S01/E01_rose.mp4 — so this is
// a prefix swap, not a remap. Video, subtitles and thumbnail all move together.
//
//   node scripts/relink.js https://cdn.nubblyn.com/file/whoniverse --dry-run
//   node scripts/relink.js https://cdn.nubblyn.com/file/whoniverse
//
// The base may be passed as an argument or as MEDIA_BASE. The argument form
// exists because PowerShell has no `VAR=value command` syntax, so the env-var
// form fails there with "not recognized as the name of a cmdlet".
//
// A base may carry a path. Without a Cloudflare Transform Rule, B2's own URLs
// look like https://cdn.example.com/file/<bucket>/…, and that works with no
// extra configuration. Add the rule later and re-run with the shorter base —
// this is re-runnable, since it matches whatever host the data currently uses.

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const dry = args.includes('--dry-run');
const base = (args.find((a) => !a.startsWith('--')) || process.env.MEDIA_BASE || '')
  .replace(/\/+$/, '');

if (!/^https:\/\/[^/]+(\/[^\s]*)?$/.test(base)) {
  console.error('usage: node scripts/relink.js <https-base> [--dry-run]');
  console.error('  e.g. node scripts/relink.js https://cdn.nubblyn.com/file/whoniverse');
  process.exit(1);
}

const file = path.join(__dirname, '..', 'data', 'new-who.js');
const before = fs.readFileSync(file, 'utf8');

// One pass, one alternation. Two sequential passes would work but the second
// re-matches what the first just wrote, so every URL is counted twice and the
// reported total is double the real one.
//
// Alternative one: the original archive.org layout, nw_S01/.
// Alternative two: any base this script has written before, so re-pointing to
// a new host works as many times as needed.
const pattern = /https:\/\/archive\.org\/download\/nw_S(\d{2})\/|https:\/\/[^"'\s]*?\/new-who\/S(\d{2})\//g;

let count = 0;
const after = before.replace(pattern, (_, fromArchive, fromBase) => {
  count++;
  return `${base}/new-who/S${fromArchive || fromBase}/`;
});

console.log(`${dry ? 'would rewrite' : 'rewrote'} ${count} urls -> ${base}/new-who/Sxx/…`);

if (count === 0) {
  console.log('nothing matched — the data may already point at this base');
} else if (!dry) {
  fs.writeFileSync(file, after);
}
