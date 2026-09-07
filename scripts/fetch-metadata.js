// Populate a series' episode list from Cinemeta.
//
// Cinemeta is Stremio's own metadata addon, keyed by IMDb id and free to query,
// so it gives titles, air dates, overviews and stills for every series in the
// registry without an API key.
//
// What it writes is a catalogue, not a library: entries carry no `url`, so the
// addon still treats the series as unplayable and the landing page lists it as
// queued. Adding files later means filling in urls, not re-fetching this.
//
//   node scripts/fetch-metadata.js                 every series missing data
//   node scripts/fetch-metadata.js torchwood       just this one
//   node scripts/fetch-metadata.js --force         refetch even if data exists

const fs = require('node:fs');
const path = require('node:path');
const { series } = require('../lib/series');

const CINEMETA = 'https://v3-cinemeta.strem.io/meta';

/**
 * Season 0 is upstream's bucket for anything outside the numbered run —
 * specials, minisodes, charity shorts. We keep our own five-way taxonomy, and
 * the only distinction Cinemeta actually supports is "in a season" versus
 * "not", so everything in season 0 becomes a Special and is refined by hand.
 */
function typeFor(video) {
  return video.season === 0 ? 'Special' : 'Main Show';
}

async function fetchSeries(imdbId) {
  for (const kind of ['series', 'movie']) {
    const res = await fetch(`${CINEMETA}/${kind}/${imdbId}.json`);
    if (!res.ok) continue;
    const { meta } = await res.json();
    if (meta) return { meta, kind };
  }
  throw new Error(`no Cinemeta entry for ${imdbId}`);
}

function toEpisodes(meta, kind) {
  // A film has no videos; it is one entry, numbered so the catalog can address it.
  if (kind === 'movie' || !meta.videos?.length) {
    return [{
      title: meta.name,
      season: 1,
      episode: 1,
      type: 'Special',
      released: meta.released || (meta.year ? `${meta.year}-01-01T00:00:00.000Z` : null),
      overview: meta.description || '',
      thumbnail: meta.background || meta.poster || '',
      imdb: { id: meta.imdb_id || meta.id, season: 1, episode: 1 },
    }];
  }

  return meta.videos
    .slice()
    .sort((a, b) => (a.season - b.season) || (a.episode - b.episode))
    .map((v) => ({
      title: v.name || v.title || `Episode ${v.episode}`,
      // Season 0 is kept as season 0, not folded onto season 1. Folding it put
      // 93 specials on top of Classic Who's 42-episode first season and showed
      // it as 135. Stremio treats season 0 as specials by convention anyway.
      season: v.season,
      episode: v.episode,
      type: typeFor(v),
      released: v.released || v.firstAired || null,
      overview: v.overview || v.description || '',
      thumbnail: v.thumbnail || '',
      imdb: { id: meta.imdb_id || meta.id, season: v.season, episode: v.episode },
    }));
}

function render(key, name, episodes) {
  const body = episodes.map((e) => {
    const lines = [
      `  title: ${JSON.stringify(e.title)},`,
      `  season: ${e.season},`,
      `  episode: ${e.episode},`,
      `  type: ${JSON.stringify(e.type)},`,
    ];
    if (e.released) lines.push(`  released: ${JSON.stringify(e.released)},`);
    if (e.overview) lines.push(`  overview: ${JSON.stringify(e.overview)},`);
    if (e.thumbnail) lines.push(`  thumbnail: ${JSON.stringify(e.thumbnail)},`);
    lines.push(`  imdb: { id: ${JSON.stringify(e.imdb.id)}, season: ${e.imdb.season}, episode: ${e.imdb.episode} },`);
    return `{\n${lines.join('\n')}\n}`;
  }).join(',\n');

  return `// ${name} — catalogued, not yet playable.
//
// Fetched from Cinemeta by scripts/fetch-metadata.js. No entry has a \`url\`,
// so the addon does not offer these as streams and the landing page lists the
// series as queued. Adding files means adding urls here, not refetching.
//
// Upstream's season 0 holds specials and shorts and is kept as season 0, which
// is what Stremio expects. Everything in it is typed Special; refining that into
// minisode, prequel and animated needs a pass by hand.

const episodes = [
${body}
];

module.exports = episodes;
`;
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  const only = args.filter((a) => !a.startsWith('--'));

  for (const entry of series) {
    if (only.length && !only.includes(entry.key)) continue;

    const file = path.join(__dirname, '..', 'data', `${entry.data}.js`);
    const existing = require(file);

    // Never overwrite hand-curated work. An entry with a url was placed there
    // deliberately — ordered, typed, pointed at a real file — and none of that
    // comes back from Cinemeta. `--force` with no series named once wiped New
    // Who's 239 curated entries and every bucket url with them.
    const curated = existing.filter((e) => e.url || e.streamUrl).length;
    if (curated) {
      console.log(`${entry.key.padEnd(14)} refused — ${curated} curated entries with urls`);
      continue;
    }

    if (existing.length && !force) {
      console.log(`${entry.key.padEnd(14)} skipped — ${existing.length} entries already`);
      continue;
    }

    const imdbId = entry.imdb.default;
    try {
      const { meta, kind } = await fetchSeries(imdbId);
      const episodes = toEpisodes(meta, kind);
      fs.writeFileSync(file, render(entry.key, entry.name, episodes));

      const seasons = new Set(episodes.map((e) => e.season));
      const specials = episodes.filter((e) => e.season === 0).length;
      console.log(
        `${entry.key.padEnd(14)} ${String(episodes.length).padStart(4)} entries, ` +
        `${seasons.size} groups${specials ? ` (${specials} in season 0)` : ''}, from ${imdbId}`
      );
    } catch (err) {
      console.log(`${entry.key.padEnd(14)} FAILED — ${err.message}`);
    }
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
