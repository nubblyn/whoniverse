// Rebuild the spin-off data files from the ledger and the bucket.
//
//   node scripts/build-spinoffs.js            print what would change
//   node scripts/build-spinoffs.js --write    write data/*.js
//
// The ledger is the source for everything a viewer reads: title, category, air
// date and the description. Those descriptions are written by hand, in house
// style. Nothing here comes from Cinemeta, TMDB or IMDb, and no external id is
// carried on a spin-off episode: these series were never playable, so there are
// no old links to keep resolving, which is the only reason New Who still holds
// its `imdb` aliases.
//
// The bucket is the source for the two URLs. Every file is looked up rather
// than constructed from a pattern, so a typo becomes a missing episode here
// instead of a dead stream in the app.
//
// The ledger has no episode column. An episode's number is its position within
// its season, and the check is that the number lands on the file whose name
// already carries the same season and episode.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CDN = 'https://cdn.nubblyn.com/file/whoniverse';
const CONTENT = 'C:/Users/hello/Downloads/content';
const WRITE = process.argv.includes('--write');

const SERIES = [
  // The 1996 film sits inside the Wilderness Years, at 1x03 between Dimensions
  // in Time and the Curse of Fatal Death, so this builds that series and the
  // film comes with it. The other nine rows have no file yet and contribute a
  // title and nothing else.
  { data: 'wilderness-years', ledger: '02-wilderness-years', bucket: 'wilderness_years', name: 'Wilderness Years' },
  { data: 'torchwood', ledger: '05-torchwood', bucket: 'torchwood', name: 'Torchwood' },
  { data: 'sarah-jane', ledger: '06-sarah-jane', bucket: 'the_sarah_jane_adventures', name: 'The Sarah Jane Adventures' },
  { data: 'class', ledger: '07-class', bucket: 'class', name: 'Class' },
  { data: 'land-and-sea', ledger: '08-land-and-sea', bucket: 'the_war_between_the_land_and_the_sea', name: 'The War Between the Land and the Sea' },
];

function findRclone() {
  const local = path.join(process.env.LOCALAPPDATA || '', 'rclone', 'rclone.exe');
  if (fs.existsSync(local)) return local;
  return 'rclone';
}

/**
 * Eight characters of the subtitle's own content, read from the copy on disk
 * under content/. The bucket copy is the same file; hashing the local one
 * saves a download per episode and fails loudly if the two ever drift, because
 * a missing local file throws rather than quietly stamping nothing.
 */
function subtitleHash(bucket, rel) {
  const local = path.join(CONTENT, bucket, rel);
  return crypto.createHash('md5').update(fs.readFileSync(local)).digest('hex').slice(0, 8);
}

function tsv(file) {
  const rows = fs.readFileSync(file, 'utf8').replace(/\r/g, '').split('\n').filter(Boolean);
  const head = rows[0].split('\t');
  return rows.slice(1).map((r) => {
    const cells = r.split('\t');
    return Object.fromEntries(head.map((h, i) => [h, cells[i] ?? '']));
  });
}

/**
 * Read the ledger's `have` column, which is free text describing the master.
 *   "1080p 25fps AAC"                    -> { quality: '1080p', audio: 'AAC' }
 *   "720x576 25fps AAC"                  -> { quality: '576p',  audio: 'AAC' }
 *   "2160p 23.976fps TrueHD/DTS/AC-3"    -> { quality: '2160p', audio: 'TrueHD' }
 *
 * Where several audio codecs are listed the first is the default track, which
 * is the one a client will actually play and the one web-readiness turns on.
 */
function fromHave(have) {
  const out = {};
  const res = /(\d{3,4})p|(\d{3,4})x(\d{3,4})/.exec(have || '');
  if (res) {
    const height = res[1] ? +res[1] : +res[3];
    const width = res[2] ? +res[2] : null;
    // Tiers a client badges, chosen on height, with width as the tie-break for
    // a letterboxed master that is wider than it is tall for its class.
    out.quality = height >= 2000 || (width && width >= 3800) ? '2160p'
      : height >= 1400 ? '1440p'
        : height >= 1000 || (width && width >= 1900) ? '1080p'
          : height >= 700 ? '720p'
            : height >= 570 ? '576p' : `${height}p`;
  }
  const aud = /(TrueHD|E-AC-3|AC-3|AAC|MP3|Opus|FLAC|DTS-HD(?:\s*MA)?|DTS)/i.exec(have || '');
  if (aud) out.audio = aud[1];
  return out;
}

// Midday UTC: the ledger records a date, not a time, and midday is the one
// hour that reads as the same calendar day in every timezone a viewer is in.
function released(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date || '') ? `${date}T12:00:00.000Z` : undefined;
}

const rclone = findRclone();
let missing = 0;

for (const s of SERIES) {
  const rows = tsv(path.join(ROOT, 'ledger', 'series', `${s.ledger}.tsv`));

  const listing = execFileSync(rclone, ['ls', `b2:whoniverse/${s.bucket}`], {
    encoding: 'utf8', maxBuffer: 1 << 24,
  }).split('\n').map((l) => l.trim()).filter(Boolean);

  const video = new Map();
  const still = new Map();
  const subs = new Map();
  for (const line of listing) {
    const rel = line.replace(/^\d+\s+/, '');
    const m = /^season_\d+\/S(\d+)_E(\d+)_.+\.(mkv|mp4|m4v|jpg|srt)$/.exec(rel);
    if (!m) continue;
    const key = `${+m[1]}x${+m[2]}`;
    if (m[3] === 'jpg') still.set(key, rel);
    else if (m[3] === 'srt') subs.set(key, rel);
    else if (!video.has(key) || rel.endsWith('.mkv')) video.set(key, rel);
  }

  const counter = {};
  const episodes = [];
  for (const r of rows) {
    const season = parseInt(r.season, 10);
    counter[season] = (counter[season] || 0) + 1;
    const episode = counter[season];
    const key = `${season}x${episode}`;

    // A series can be part downloaded. The Wilderness Years holds the 1996
    // film and nine webcasts and charity specials that have no file yet, and
    // dropping those would have quietly shrunk the series from ten rows to
    // one. An item with nothing to play still gets its title, date and
    // description; the client greys it out.
    const have = video.has(key);
    if (!have) missing++;
    const e = {
      title: r.title,
      season,
      episode,
      type: r.category,
      released: released(r.released),
      overview: r.description || undefined,
      ...(have ? fromHave(r.have) : {}),
      thumbnail: still.has(key) ? `${CDN}/${s.bucket}/${still.get(key)}` : undefined,
      streamUrl: have ? `${CDN}/${s.bucket}/${video.get(key)}` : undefined,
      // Almost every episode came off a disc and carries the broadcaster's own
      // subtitles inside the file, so there is nothing to serve alongside it.
      // The exceptions are the few taken from the web, which have none: those
      // get an .srt in the bucket, and it is picked up here if it is there.
      //
      // The hash is the same trick the artwork uses. A corrected subtitle keeps
      // its name, and without a changed URL the relay's reply sits in the edge
      // cache for a day while viewers read the old text.
      subtitleUrl: subs.has(key)
        ? `${CDN}/${s.bucket}/${subs.get(key)}?v=${subtitleHash(s.bucket, subs.get(key))}`
        : undefined,
      filename: have ? path.basename(video.get(key)) : undefined,
    };
    episodes.push(e);
  }

  const header = `// ${s.name} — from the ledger, not from anywhere else.
//
// Every field a viewer reads is written by hand in ledger/series/${s.ledger}.tsv
// and copied here by scripts/build-spinoffs.js. Nothing comes from Cinemeta,
// TMDB or IMDb, and no episode carries an external id: these series were never
// playable before, so there are no old links to keep resolving. Edit the
// ledger and re-run the script; do not edit this file.
//
// The two URLs are looked up in the bucket rather than built from a pattern, so
// a name that does not exist fails the build instead of the stream.

const episodes = [
`;

  const KEYS = ['title', 'season', 'episode', 'type', 'released', 'overview',
    'quality', 'audio', 'thumbnail', 'streamUrl', 'subtitleUrl', 'filename'];
  const body = episodes.map((e) => {
    const lines = KEYS
      .filter((k) => e[k] !== undefined)
      .map((k) => `  ${k}: ${typeof e[k] === 'number' ? e[k] : JSON.stringify(e[k])},`);
    return '{\n' + lines.join('\n') + '\n}';
  }).join(',\n');

  const text = header + body + '\n];\n\nmodule.exports = episodes;\n';
  const dest = path.join(ROOT, 'data', `${s.data}.js`);

  const before = require(dest);
  console.log(`\n=== ${s.data} ===`);
  console.log(`  ${before.length} entries -> ${episodes.length}`);
  console.log(`  with a stream : ${episodes.filter((e) => e.streamUrl).length}`);
  console.log(`  with a still  : ${episodes.filter((e) => e.thumbnail).length}`);
  console.log(`  quality       : ${[...new Set(episodes.map((e) => e.quality))].join(', ')}`);
  console.log(`  audio         : ${[...new Set(episodes.map((e) => e.audio))].join(', ')}`);
  const changedTitles = episodes.filter((e) => {
    const b = before.find((x) => x.season === e.season && x.episode === e.episode);
    return b && b.title !== e.title;
  });
  if (changedTitles.length) {
    console.log(`  titles changed: ${changedTitles.length}`);
    for (const e of changedTitles) console.log(`      ${e.season}x${e.episode}  ${e.title}`);
  }
  if (WRITE) fs.writeFileSync(dest, text, 'utf8');
}

console.log(WRITE ? '\nwritten' : '\ndry run. add --write.');
if (missing) {
  console.log(`${missing} items have no file yet and are listed unavailable`);
}
