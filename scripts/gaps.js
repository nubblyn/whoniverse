// Which New Who entries can't get metadata from upstream, and what we have for them.
//
// Two kinds of gap. Entries with no IMDb mapping at all have nothing upstream
// to fetch — for those, whatever is in data/new-who.js is the only metadata
// that will ever exist, and it must be kept. Entries that are mapped may still
// find upstream thin: no overview, or no still. Those keep ours too, and are
// worth knowing about before anything overwrites a field.
//
//   node scripts/gaps.js

const CINEMETA = 'https://v3-cinemeta.strem.io/meta/series';

async function upstream(imdbId) {
  const res = await fetch(`${CINEMETA}/${imdbId}.json`);
  if (!res.ok) throw new Error(`Cinemeta ${res.status} for ${imdbId}`);
  const { meta } = await res.json();
  const byId = new Map();
  for (const v of meta.videos || []) byId.set(`${imdbId}:${v.season}:${v.episode}`, v);
  return byId;
}

async function main() {
  const episodes = require('../data/new-who.js');
  const ids = [...new Set(episodes.filter((e) => e.imdb).map((e) => e.imdb.id))];
  const up = new Map();
  for (const id of ids) for (const [k, v] of await upstream(id)) up.set(k, v);

  const unmapped = [];
  const thin = [];
  let full = 0;

  for (const e of episodes) {
    const ours = {
      overview: Boolean(e.overview && e.overview.trim()),
      thumbnail: Boolean(e.thumbnail),
    };
    if (!e.imdb) { unmapped.push({ e, ours }); continue; }

    const v = up.get(`${e.imdb.id}:${e.imdb.season}:${e.imdb.episode}`);
    const has = {
      overview: Boolean(v?.overview && v.overview.trim()),
      thumbnail: Boolean(v?.thumbnail),
      rating: Boolean(v?.rating && v.rating !== '0'),
    };
    if (has.overview && has.thumbnail) full++;
    else thin.push({ e, has, ours });
  }

  const tag = (e) => `${e.season}x${String(e.episode).padStart(2, '0')}  [${e.type.padEnd(9)}]  ${e.title}`;

  console.log(`${episodes.length} entries`);
  console.log(`  ${full} mapped with upstream overview + still`);
  console.log(`  ${thin.length} mapped but upstream is thin`);
  console.log(`  ${unmapped.length} unmapped — no upstream at all\n`);

  if (thin.length) {
    console.log('MAPPED, UPSTREAM THIN (ours is kept for whatever is missing):');
    for (const { e, has, ours } of thin) {
      const missing = ['overview', 'thumbnail'].filter((k) => !has[k]).join('+');
      console.log(`  ${tag(e)}  — upstream lacks ${missing}; ours has overview=${ours.overview} thumb=${ours.thumbnail}`);
    }
    console.log();
  }

  console.log('UNMAPPED (data/new-who.js is the only source — keep as is):');
  for (const { e, ours } of unmapped) {
    console.log(`  ${tag(e)}  — ours: overview=${ours.overview} thumb=${ours.thumbnail}`);
  }

  const upRatings = [...up.values()].filter((v) => v.rating && v.rating !== '0').length;
  console.log(`\nratings: Cinemeta carries a non-zero per-episode rating on ${upRatings} of ${up.size} upstream videos`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
