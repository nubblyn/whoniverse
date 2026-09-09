// Fetch a second opinion on every episode's subtitle, to check our OCR against.
//
//   node scripts/subs/fetch-external.js <out folder> [--series torchwood] [--dry]
//
// Through the same door Stremio and Nuvio use: the OpenSubtitles v3 addon at
// opensubtitles-v3.strem.io, which is a public endpoint in the Stremio addon
// protocol. Ask it for a video id and it answers with subtitle URLs. That is
// why a client finds subtitles the instant you open an episode, and it needs no
// account, no API key and no daily quota.
//
// The direct OpenSubtitles REST API was the first attempt and it allows five
// downloads a day on an API key, which is three weeks for this catalogue. It
// also meant handling a credential. This needs neither.
//
// What comes back is somebody else's transcription of the same episode, so it
// will disagree with ours constantly on wording and on where a line breaks.
// cross-check.py knows that and only reports the disagreements that look like
// our mistake.
const fs = require('fs');
const path = require('path');

const ADDON = 'https://opensubtitles-v3.strem.io';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const outRoot = args.find((a) => !a.startsWith('--'));
const pick = (flag) => { const i = args.indexOf(flag); return i === -1 ? null : args[i + 1]; };
const onlySeries = pick('--series');
const limit = Number(pick('--limit') || 0) || Infinity;
if (!outRoot) {
  console.error('usage: node scripts/subs/fetch-external.js <out folder> [--series x] [--limit n] [--dry]');
  process.exit(1);
}

// The Downloads folders, which have been renumbered once already. Only the
// four finished spin-offs have subtitles of ours to check.
const SERIES = {
  torchwood: '5. Torchwood',
  'sarah-jane': '6. The Sarah Jane Adventures',
  class: '7. Class',
  'land-and-sea': '8. The War Between the Land and the Sea',
};

// Letters and digits only. `Co-owner of a Lonely Heart` and our
// `coowner_of_a_lonely_heart` have to land on the same string, and so do
// `Mona Lisa's Revenge (1)` and `mona_lisas_revenge_1`. The part number is
// kept: `Sky (2)` is IMDb S5E2, and matching it to `Sky (1)` fetches the
// wrong half of the story.
const key = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** English subtitles for one episode, best first. */
async function candidates(imdb) {
  const id = `${imdb.id}:${imdb.season}:${imdb.episode}`;
  const res = await fetch(`${ADDON}/subtitles/series/${encodeURIComponent(id)}.json`, {
    headers: { Accept: 'application/json', 'User-Agent': 'Whoniverse/2.1.1' },
  });
  if (!res.ok) throw new Error(`addon ${res.status}`);
  const body = await res.json();
  return (body.subtitles || []).filter((s) => /^en/i.test(s.lang || '') && s.url);
}

/** The first candidate that downloads as a usable SubRip file. */
async function grab(list) {
  for (const sub of list.slice(0, 4)) {
    try {
      const res = await fetch(sub.url, { redirect: 'follow' });
      if (!res.ok) continue;
      const text = await res.text();
      // Guard against an HTML error page or a stub: a real episode has cues.
      const cues = (text.match(/-->/g) || []).length;
      if (cues >= 100) return { text, cues, id: sub.id };
    } catch { /* try the next one */ }
  }
  return null;
}

(async () => {
  let done = 0;
  let missing = 0;
  for (const [series, folder] of Object.entries(SERIES)) {
    if (onlySeries && onlySeries !== series) continue;
    const data = require(path.join(__dirname, '..', '..', 'data', `${series}.js`));
    const list = Array.isArray(data) ? data : (data.episodes || data.entries || Object.values(data)[0]);
    const byTitle = new Map(list.filter((e) => e.imdb).map((e) => [key(e.title), e.imdb]));

    const dir = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads', folder);
    const ours = [];
    (function walk(d) {
      for (const f of fs.readdirSync(d).sort()) {
        const p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) walk(p);
        else if (f.endsWith('.srt')) ours.push(f);
      }
    })(dir);

    for (const name of ours) {
      if (done >= limit) break;
      const dest = path.join(outRoot, series, name);
      if (fs.existsSync(dest)) continue;
      const stem = key(name.replace(/\.srt$/, '').replace(/^S\d+_E\d+_/, '')
        .replace(/_(special|minisode|prequel|animated_series)$/i, ''));
      // Our file names drop a leading "the" that the data keeps, and the other
      // way round, so both readings are tried before giving up.
      const imdb = byTitle.get(stem) || byTitle.get(`the${stem}`)
        || byTitle.get(stem.replace(/^the/, ''));
      if (!imdb) { console.log(`  ${name}  NO IMDb MATCH`); missing += 1; continue; }
      if (dry) { console.log(`  ${name}  ->  ${imdb.id} S${imdb.season}E${imdb.episode}`); done += 1; continue; }

      try {
        const list2 = await candidates(imdb);
        if (!list2.length) { console.log(`  ${name}  no English subtitle offered`); missing += 1; continue; }
        const got = await grab(list2);
        if (!got) { console.log(`  ${name}  ${list2.length} offered, none downloaded`); missing += 1; continue; }
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, got.text);
        done += 1;
        console.log(`  ${name}  ${got.cues} cues`);
      } catch (e) {
        console.log(`  ${name}  ${e.message}`);
        missing += 1;
      }
      await sleep(400);          // a public endpoint, so do not lean on it
    }
  }
  console.log(`\n${done} fetched, ${missing} not available`);
})();
