// Run the indexer search across every mapped episode and record the picks.
//
// This is the automated half of curation: it proposes a ranked shortlist per
// episode, which you then review. Nothing here decides anything you cannot
// override by editing data/sources.json afterwards.
//
// Only episodes with an IMDb mapping are searched — the indexer can only be
// asked for an episode by upstream numbering. Everything unmapped (prequels
// and minisodes that upstream does not list separately) is skipped, which is
// correct: those are the entries that need self-hosting anyway.
//
//   node scripts/pick-sources.js --limit 10        # try a sample first
//   node scripts/pick-sources.js                   # the whole mapped set
//   node scripts/pick-sources.js --quality 2160p

const fs = require('fs');
const path = require('path');
const { findSources } = require('./find-sources');

const OUT = path.join(__dirname, '..', 'data', 'sources.json');

// Torrentio is somebody else's free service. Space the requests out rather
// than firing 219 at once.
const DELAY_MS = 350;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const args = process.argv.slice(2);
  const flag = (name, fallback) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : fallback;
  };

  const limit = Number(flag('limit', 0));
  const quality = String(flag('quality', '1080p')).toLowerCase();
  const keep = Number(flag('keep', 3));

  const map = require(path.join('..', 'data', 'imdb-map.json'));
  const targets = limit ? map.slice(0, limit) : map;

  // Resume rather than restart: a re-run keeps whatever already succeeded.
  const existing = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
  const results = { ...existing };

  let found = 0;
  let empty = 0;
  let failed = 0;

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const key = `${t.season}x${t.episode}`;
    if (results[key]?.sources?.length) continue;

    try {
      const picks = await findSources(t.imdbId, t.imdbSeason, t.imdbEpisode, { quality, limit: keep });
      const sources = picks.map((p) => ({
        infoHash: p.infoHash,
        fileIdx: p.fileIdx,
        group: p.group || null,
        quality: p.quality,
        sizeGB: Number(p.sizeGB.toFixed(2)),
        seeders: p.seeders,
        release: p.release.replace(/\s+/g, ' '),
      }));

      results[key] = { title: t.title, imdb: `${t.imdbId}:${t.imdbSeason}:${t.imdbEpisode}`, sources };
      if (sources.length) found++; else empty++;

      const top = sources[0];
      console.log(
        `${String(i + 1).padStart(3)}/${targets.length}  ${key.padEnd(6)} ${t.title.slice(0, 34).padEnd(34)} ` +
        (top ? `${top.quality} ${String(top.sizeGB).padStart(5)}GB ${top.group || '—'}` : 'NO RESULTS')
      );
    } catch (err) {
      failed++;
      console.log(`${String(i + 1).padStart(3)}/${targets.length}  ${key.padEnd(6)} ${t.title.slice(0, 34).padEnd(34)} ERROR ${err.message}`);
    }

    await sleep(DELAY_MS);
  }

  fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
  console.log(`\nwith sources ${found}   no results ${empty}   errors ${failed}`);
  console.log(`wrote ${Object.keys(results).length} entries to data/sources.json`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
