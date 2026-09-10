// Build the Complete Chronology from the ledger and the other series' data.
//
//   node scripts/build-chronology.js            print what it would write
//   node scripts/build-chronology.js --write    write data/complete-chronology.js
//
// The chronology owns nothing. Its running order is ledger/all-who.tsv, which
// is every other series interleaved by UK air date, and each of its episodes
// reuses the stream, still and prose already published for that item under its
// own series. Nothing is duplicated in the bucket and nothing is written twice
// by hand: change an episode anywhere and the chronology follows.
//
// It is one season. The list is a single run from 1963 to now, and inventing
// seasons for it would mean choosing a boundary the programme does not have.
// Items with no file yet are still listed, unavailable, exactly as they are on
// their own series.
//
// ledger/out/file-names.tsv is the join. It carries the episode number the
// ledger assigned to each row, which is the number the data files use, so the
// match is exact rather than by title.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WRITE = process.argv.includes('--write');

function tsv(file) {
  const rows = fs.readFileSync(file, 'utf8').replace(/\r/g, '').trim().split('\n');
  const head = rows[0].split('\t');
  return rows.slice(1).map((r) => {
    const c = r.split('\t');
    return Object.fromEntries(head.map((h, i) => [h, c[i] ?? '']));
  });
}

const allWho = tsv(path.join(ROOT, 'ledger', 'all-who.tsv'));
const names = tsv(path.join(ROOT, 'ledger', 'out', 'file-names.tsv'));

// (series, season, category, title) -> the episode number the ledger gave it
const numberOf = new Map();
for (const n of names) {
  numberOf.set([n.series, n.season, n.category, n.title].join('|'), n.episode);
}

// (series, season, episode) -> the published entry
const source = new Map();
const DATA = ['classic-who', 'wilderness-years', 'the-movie', 'new-who',
  'torchwood', 'sarah-jane', 'class', 'land-and-sea'];
for (const key of DATA) {
  let eps;
  try { eps = require(path.join(ROOT, 'data', `${key}.js`)); } catch { continue; }
  for (const e of eps) source.set([key, e.season, e.episode].join('|'), e);
}

const out = [];
const ledgerOnly = [];
for (const row of allWho) {
  const num = numberOf.get([row.series, row.season, row.category, row.title].join('|'));
  const src = (num && source.get([row.series, +row.season, +num].join('|'))) || null;
  // A few dozen items are in the ledger but have no entry in data/ yet: the
  // six parts of Shada, K9 & Company, the Tardisodes and the other known
  // gaps. They are listed from the ledger's own row rather than skipped. A
  // complete running order that quietly drops forty-five items is not one.
  if (!src) ledgerOnly.push(`${row.series} ${row.season} ${row.category} ${row.title}`);
  const e = {
    title: src ? src.title : row.title,
    season: 1,
    episode: out.length + 1,
    type: row.category,
  };
  if (!src) { out.push(e); continue; }
  // Only what the source actually has. An item with no file yet contributes a
  // title and nothing else, and the client greys it out the same as elsewhere.
  for (const k of ['released', 'overview', 'quality', 'audio', 'thumbnail',
    'streamUrl', 'subtitleUrl', 'filename']) {
    if (src[k] !== undefined) e[k] = src[k];
  }
  out.push(e);
}

const withStream = out.filter((e) => e.streamUrl).length;
console.log('%d rows in the chronology, %d with a stream, %d with a still',
  out.length, withStream, out.filter((e) => e.thumbnail).length);
if (ledgerOnly.length) {
  console.log('\n%d listed from the ledger alone, with no entry in data/ yet:',
    ledgerOnly.length);
  for (const u of ledgerOnly.slice(0, 8)) console.log('   ' + u);
}

if (!WRITE) {
  console.log('\ndry run. add --write.');
  return;
}

const KEYS = ['title', 'season', 'episode', 'type', 'released', 'overview',
  'quality', 'audio', 'thumbnail', 'streamUrl', 'subtitleUrl', 'filename'];
const header = `// The Complete Chronology — generated, do not edit.
//
// Every item in the Whoniverse in one running order, taken from
// ledger/all-who.tsv. Each episode reuses the stream, still and prose that
// its own series already publishes, so there is one copy of everything and
// the chronology cannot drift from the series it is made of.
//
// One season by design: the list runs straight from 1963 to now, and the
// programme has no boundary to break it on.
//
// Rebuild with: node scripts/build-chronology.js --write

const episodes = [
`;
const body = out.map((e) => '{\n' + KEYS.filter((k) => e[k] !== undefined)
  .map((k) => `  ${k}: ${typeof e[k] === 'number' ? e[k] : JSON.stringify(e[k])},`)
  .join('\n') + '\n}').join(',\n');
fs.writeFileSync(path.join(ROOT, 'data', 'complete-chronology.js'),
  `${header}${body}\n];\n\nmodule.exports = episodes;\n`, 'utf8');
console.log('\nwrote data/complete-chronology.js');
