// The OpenSubtitles hash of every video in the bucket, so a subtitle addon can
// find a file by it.
//
//   node scripts/hash-videos.js                    say what is missing or out of step
//   node scripts/hash-videos.js --write            fetch what is needed, write data/hashes.json
//   node scripts/hash-videos.js --write new_who    the same for one bucket folder
//
// Community Subtitles (and any subtitle addon that declares no id prefix) is
// asked about our episodes like any other video, and it matches by this hash:
// subtitles are uploaded against the file being played, so one upload serves
// everyone who streams that file from the bucket. Our own ids give it nothing
// else to go on. lib/streams.js sends the hash and the size in each stream's
// behaviorHints, so the client does not have to work them out.
//
// The hash is the file's size plus the sum, as 64-bit little-endian words, of
// its first and last 64 KiB, modulo 2^64, written as 16 hex digits. That is 128
// KB read per file with two range requests; nothing is downloaded.
//
// Each entry records the `?v=` stamp (eight characters of the file's B2 SHA1,
// as stamp-media.js writes into the URLs) and the size it was computed from.
// lib/streams.js uses an entry only while its stamp is the one in the URL, so
// a replaced file is never sent with the old file's hash: it goes without until
// this has run again. Run it after stamp-media.js whenever a video is added or
// replaced.
//
// Note the host: Cloudflare refuses tools and Vercel alike, so this reads B2's
// own origin.

const fs = require('node:fs');
const path = require('node:path');
const { listing, shortHash } = require('./lib/bucket');

const ORIGIN = process.env.WHONIVERSE_B2_ORIGIN
  || 'https://f003.backblazeb2.com/file/whoniverse';
const OUT = path.join(__dirname, '..', 'data', 'hashes.json');
const CHUNK = 65536;
const CONCURRENCY = 8;
const VIDEO = /\.(mp4|mkv|m4v)$/i;
const MASK = (1n << 64n) - 1n;

/** Sum of a buffer as 64-bit little-endian words, modulo 2^64. */
function sumWords(buf) {
  let sum = 0n;
  for (let i = 0; i + 8 <= buf.length; i += 8) sum += buf.readBigUInt64LE(i);
  return sum & MASK;
}

/** The hash of a file from its size and its first and last 64 KiB. */
function openSubtitlesHash(size, head, tail) {
  return ((BigInt(size) + sumWords(head) + sumWords(tail)) & MASK).toString(16).padStart(16, '0');
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** One range of a file, and the file's total size from the reply. */
async function range(url, spec) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      const res = await fetch(url, { headers: { Range: `bytes=${spec}`, 'User-Agent': 'whoniverse-hash-videos' } });
      if (res.status !== 206) throw new Error(`HTTP ${res.status}, wanted 206`);
      const total = Number(res.headers.get('content-range').split('/')[1]);
      return { buf: Buffer.from(await res.arrayBuffer()), total };
    } catch (err) {
      if (attempt === 3) throw err;
      await sleep(500 * attempt);
    }
  }
}

async function hashOf(rel, size) {
  const url = `${ORIGIN}/${encodeURI(rel)}`;
  const head = await range(url, `0-${CHUNK - 1}`);
  // The listing and the file disagree: the index is stale, and a hash made
  // from this file would sit under another file's stamp.
  if (head.total !== size) throw new Error(`bucket says ${size} bytes, file is ${head.total}`);
  const tail = await range(url, `${size - CHUNK}-${size - 1}`);
  return openSubtitlesHash(size, head.buf, tail.buf);
}

/** One entry to a line, so a changed file is a one-line diff. */
function serialise(entries) {
  const rows = Object.keys(entries).sort().map((p) => ` ${JSON.stringify(p)}: ${JSON.stringify(entries[p])}`);
  return `{\n${rows.join(',\n')}\n}\n`;
}

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const only = args.filter((a) => !a.startsWith('--'));
  const inScope = (p) => !only.length || only.includes(p.split('/')[0]);

  const files = listing();
  const videos = [...files].filter(([p]) => VIDEO.test(p) && inScope(p));
  console.log(`${videos.length} videos in the bucket`);

  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
  const todo = videos.filter(([p, f]) => !prev[p] || prev[p].v !== shortHash(f.sha1) || prev[p].size !== f.size);
  const gone = Object.keys(prev).filter((p) => inScope(p) && !files.has(p));
  console.log(`${videos.length - todo.length} hashed and current, ${todo.length} to hash, ${gone.length} gone from the bucket`);

  if (!write) {
    for (const [p] of todo.slice(0, 10)) console.log(`   ${p}`);
    if (todo.length > 10) console.log(`   ... and ${todo.length - 10} more`);
    if (todo.length || gone.length) console.log('\ndry run. add --write.');
    return;
  }

  const next = { ...prev };
  for (const p of gone) delete next[p];

  const queue = [...todo];
  const failed = [];
  let done = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    for (;;) {
      const item = queue.pop();
      if (!item) return;
      const [p, f] = item;
      try {
        next[p] = { v: shortHash(f.sha1), size: f.size, hash: await hashOf(p, f.size) };
      } catch (err) {
        failed.push(`${p}: ${err.message}`);
        delete next[p];
      }
      done += 1;
      if (done % 50 === 0) console.log(`  ${done}/${todo.length}`);
    }
  }));

  fs.writeFileSync(OUT, serialise(next));
  console.log(`wrote ${path.relative(path.join(__dirname, '..'), OUT)}: ${Object.keys(next).length} entries`);
  if (failed.length) {
    console.log(`\n${failed.length} could not be hashed:`);
    for (const line of failed.slice(0, 10)) console.log(`   ${line}`);
    process.exit(1);
  }
}

module.exports = { openSubtitlesHash };

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
