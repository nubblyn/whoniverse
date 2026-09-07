// Map our catalog numbering onto IMDb's.
//
// This is the prerequisite for everything that reaches upstream — artwork,
// ratings, and the indexer search, which can only ask for an episode by the
// numbering IMDb uses.
//
// Three things make it non-trivial:
//
//   1. Doctor Who is not one IMDb title. 2005-2022 is tt0436992; the 2023
//      relaunch is tt31433814, renumbered from season 1.
//   2. Our seasons fold specials and minisodes inline, so our episode numbers
//      drift from IMDb's within the same season.
//   3. Most of what we fold in lives in IMDb's season 0 — 169 entries on the
//      older title alone — where numbering is a single flat sequence.
//
// So matching is by title, not by number. Run with --write to record the
// result on each episode; without it, nothing is modified.

const fs = require('fs');
const path = require('path');

const TITLES = ['tt0436992', 'tt31433814'];
const CINEMETA = 'https://v3-cinemeta.strem.io/meta/series';

const WORD_PART = { one: 1, two: 2, three: 3, four: 4 };

/**
 * Normalise a title to a comparison key, keeping the part number separate.
 *
 * The part number has to survive. The two sources spell it differently — we
 * write "The End of Time, Part One", Cinemeta writes "The End of Time (1)" —
 * and stripping parenthesised text collapses both halves of every two-parter
 * onto one key, silently mapping part two onto part one.
 */
function norm(s) {
  const raw = String(s).toLowerCase();

  let part = null;
  const worded = /\b(?:part|pt)\.?\s*(one|two|three|four|\d)\b/.exec(raw);
  const paren = /\((\d)\)\s*$/.exec(raw);
  if (worded) part = WORD_PART[worded[1]] || Number(worded[1]);
  else if (paren) part = Number(paren[1]);

  const key = raw
    .replace(/&/g, ' and ')
    // "Children in Need: Born Again" and "Born Again" are the same thing.
    .replace(/^(children in need|christmas special|prequel|minisode)\s*[:\-]\s*/, ' ')
    // Cinemeta prefixes the 2021 series "Flux Chapter One: ..."; we don't.
    .replace(/\bflux\b\s*[:\-]?\s*/, ' ')
    .replace(/\bchapter\s+(one|two|three|four|five|six|\d)\b\s*[:\-]?\s*/, ' ')
    .replace(/\b(?:part|pt)\.?\s*(?:one|two|three|four|\d)\b/g, ' ')
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(the|a|an)\b/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  return { key: part ? `${key}#${part}` : key, base: key, part };
}

async function loadUpstream() {
  const index = new Map();       // normalised title -> [{imdbId, season, episode, name}]
  for (const imdbId of TITLES) {
    const res = await fetch(`${CINEMETA}/${imdbId}.json`);
    if (!res.ok) throw new Error(`Cinemeta ${res.status} for ${imdbId}`);
    const { meta } = await res.json();
    for (const v of meta.videos || []) {
      const { key } = norm(v.name);
      if (!key) continue;
      if (!index.has(key)) index.set(key, []);
      index.get(key).push({ imdbId, season: v.season, episode: v.episode, name: v.name });
    }
  }
  return index;
}

/**
 * Which upstream title a season of ours belongs to. Used to break ties when a
 * name exists on both — "Empire of Death" style collisions are rare but real.
 */
function expectedTitle(season) {
  return season >= 14 ? 'tt31433814' : 'tt0436992';
}

/**
 * Choose among upstream entries sharing a title.
 *
 * Type is the deciding signal, because our catalog deliberately gives a prequel
 * the same name as the episode it trails — "The Impossible Astronaut" is both a
 * Prequel and a Main Show entry. Upstream keeps the episode in its numbered
 * season and everything else in season 0, so the type says which to take.
 */
function pick(candidates, ourSeason, type) {
  const want = expectedTitle(ourSeason);
  const sameTitle = candidates.filter((c) => c.imdbId === want);
  const pool = sameTitle.length ? sameTitle : candidates;

  // A prequel is never the thing it is named after. Upstream almost never
  // lists them separately, so unless the candidate says so itself, the only
  // entry sharing the name is the episode or special the prequel trails —
  // and claiming it would send the indexer after the wrong file.
  if (type === 'Prequel' && !pool.some((c) => /prequel/i.test(c.name))) return null;

  const wantsSpecials = type !== 'Main Show';
  const preferred = pool.filter((c) => (wantsSpecials ? c.season === 0 : c.season > 0));
  if (preferred.length) return preferred[0];

  // A prequel whose only candidate is the numbered episode it trails has no
  // upstream entry of its own — Cinemeta lists "The Impossible Astronaut" once,
  // as the episode. Returning it would alias the prequel onto the episode and
  // hand the indexer the wrong file, so report it as unmatched instead. These
  // land in the self-hosted bucket anyway, where no IMDb id is needed.
  if (wantsSpecials) return null;

  return pool[0];
}

async function main() {
  const write = process.argv.includes('--write');
  const upstream = await loadUpstream();
  const episodes = require(path.join('..', 'data', 'new-who.js'));

  const matched = [];
  const unmatched = [];

  for (const ep of episodes) {
    const { key, base, part } = norm(ep.title);

    // Exact key, part number included.
    let hits = upstream.get(key);

    // Then the same title without its part number, for the cases where only
    // one side numbers the parts — but only when that is unambiguous.
    if (!hits && part) {
      const loose = upstream.get(base);
      if (loose && loose.length === 1) hits = loose;
    }
    if (!hits && !part) {
      const withPart = [...upstream.keys()].filter((k) => k.startsWith(`${base}#`));
      if (withPart.length === 1) hits = upstream.get(withPart[0]);
    }

    // No substring fallback. "dalek" is inside "daleks in manhattan" and "lux"
    // is inside "survivors of the flux", so containment silently maps unrelated
    // episodes onto each other — worse than reporting them for a manual pass.
    if (!hits) { unmatched.push(ep); continue; }
    const hit = pick(hits, ep.season, ep.type);
    if (!hit) { unmatched.push(ep); continue; }
    matched.push({ ep, hit });
    if (write) ep.imdb = { id: hit.imdbId, season: hit.season, episode: hit.episode };
  }

  console.log(`matched   ${matched.length} / ${episodes.length}`);
  console.log(`unmatched ${unmatched.length}`);

  const byBucket = {};
  matched.forEach(({ hit }) => {
    const k = `${hit.imdbId} S${hit.season === 0 ? '0 (specials)' : hit.season}`;
    byBucket[k] = (byBucket[k] || 0) + 1;
  });
  console.log('\nwhere they landed:');
  Object.keys(byBucket).sort().forEach((k) => console.log(`  ${k.padEnd(28)} ${byBucket[k]}`));

  if (unmatched.length) {
    console.log('\nneed a manual mapping:');
    unmatched.forEach((e) => console.log(`  ${e.season}x${String(e.episode).padStart(2, '0')}  [${e.type}]  ${e.title}`));
  }

  if (write) {
    const out = path.join(__dirname, '..', 'data', 'imdb-map.json');
    fs.writeFileSync(out, JSON.stringify(
      matched.map(({ ep, hit }) => ({
        season: ep.season, episode: ep.episode, title: ep.title, type: ep.type,
        imdbId: hit.imdbId, imdbSeason: hit.season, imdbEpisode: hit.episode,
        upstreamName: hit.name,
      })), null, 1));
    console.log(`\nwrote ${matched.length} mappings to data/imdb-map.json`);
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
