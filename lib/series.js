// The Whoniverse, as a registry.
//
// Everything the addon shows is driven from this file. Adding a series means
// adding an entry here and dropping its episode array in data/ — no handler in
// index.js needs to change.
//
// `stremioId` is a permanent identifier. Stremio keys a user's library, watched
// state and resume positions off it, so changing one silently orphans everyone
// who already added that series. whoniverse_new_who predates this refactor and
// is kept verbatim for exactly that reason.
//
// `imdb.bySeason` exists because Doctor Who is not one IMDb title. The 2005
// revival runs to 2022 as tt0436992 and the 2023 relaunch is a separate entry,
// tt31433814, numbered from season 1 again. Our catalog numbers straight
// through, so every lookup — artwork, metadata, and eventually which torrent to
// ask for — has to be told which title a given season really belongs to.

// Where the addon lives.
const SITE = process.env.SITE_URL || 'https://whoniverse.nubblyn.com';

// Every image the addon hands out is in our bucket, behind the CDN, next to
// the episodes. Nothing points at imgur, metahub or TMDB: a poster loads as
// fast as an episode and does not depend on a third party. scripts/build-art.js
// makes the files from art-src/ and scripts/upload-art.sh puts them there.
const CDN = 'https://cdn.nubblyn.com/file/whoniverse';

// A series' artwork lives in that series' own folder, beside its episodes,
// the same shape as the content folder it was uploaded from. There is no
// separate art directory: one place per series, not two.
const FOLDER = {
  'classic-who': 'classic_who',
  'wilderness-years': 'wilderness_years',
  'the-movie': 'doctor_who_the_movie',
  'new-who': 'new_who',
  torchwood: 'torchwood',
  'sarah-jane': 'the_sarah_jane_adventures',
  class: 'class',
  'land-and-sea': 'the_war_between_the_land_and_the_sea',
  // The chronology owns no video files: its episodes point at the other
  // series' streams. It has a folder all the same, for its artwork.
  'complete-chronology': 'complete_chronology',
};
// The hashes are written by scripts/build-art.js. Without one a replaced image
// sits behind Cloudflare's four hour cache, and behind Stremio's own image
// cache for longer than that; with one the URL changes when the file does.
// Absent on a fresh clone that has not built art yet.
let stamps = {};
try { stamps = require('../data/art-version.json'); } catch { /* not built yet */ }
const v = (kind, key) => (stamps[kind] && stamps[kind][key] ? `?v=${stamps[kind][key]}` : '');
// The addon's own mark belongs to no series, so it sits at the bucket root.
const ADDON_LOGO = `${CDN}/addon-logo.png${stamps.addonLogo ? `?v=${stamps.addonLogo}` : ''}`;

/** Poster, background and logo for a series, from that series' own folder. */
function bucketArt(key) {
  const f = FOLDER[key];
  const art = { poster: `${CDN}/${f}/${f}_poster.jpg${v('poster', key)}` };
  // A series can arrive with a poster and nothing else. Sending a URL for a
  // background that was never built gives Stremio a 404 to draw, so the field
  // only appears once the file does.
  if (v('background', key)) art.background = `${CDN}/${f}/${f}_background.jpg${v('background', key)}`;
  if (v('logo', key)) art.logo = `${CDN}/${f}/${f}_logo.png${v('logo', key)}`;
  return art;
}

const IMDB = {
  classic: 'tt0056751',      // 1963-1989
  movie: 'tt0116118',        // 1996 TV movie
  newWho: 'tt0436992',       // 2005-2022
  newWho2023: 'tt31433814',  // 2023-
  torchwood: 'tt0485301',
  sarahJane: 'tt0862620',
  class: 'tt5079788',
  landAndSea: 'tt30645193', // 2025 UNIT miniseries
};

// The registry is the ledger's, not this file's. ledger/series.tsv holds one
// row per series with its name, description, release span and genres, and
// ledger/build.py writes data/registry.json from it. Editing prose here would
// have put it out of step with the sheet, which is exactly how the 1996 film
// came to have no description anywhere.
//
// The IMDb ids stay in code. They are an address for looking up an incoming
// request, not something a viewer reads, and the per-season override that New
// Who needs does not fit a column.
const registry = require('../data/registry.json');

const IMDB_BY_KEY = {
  'classic-who': { default: IMDB.classic },
  'the-movie': { default: IMDB.movie },
  'new-who': {
    default: IMDB.newWho,
    bySeason: { 14: IMDB.newWho2023, 15: IMDB.newWho2023, 16: IMDB.newWho2023 },
  },
  torchwood: { default: IMDB.torchwood },
  'sarah-jane': { default: IMDB.sarahJane },
  class: { default: IMDB.class },
  'land-and-sea': { default: IMDB.landAndSea },
};

const series = registry.series.map((s) => ({
  key: s.key,
  art: s.art,
  stremioId: s.stremioId,
  name: s.name,
  ...(IMDB_BY_KEY[s.key] ? { imdb: IMDB_BY_KEY[s.key] } : {}),
  description: s.description,
  releaseInfo: s.releaseInfo,
  genres: s.genres,
  ...bucketArt(s.key),
  data: s.data,
}));

const byStremioId = new Map(series.map((s) => [s.stremioId, s]));
const byKey = new Map(series.map((s) => [s.key, s]));

/**
 * Which IMDb title a season of this series actually belongs to.
 * Only New Who currently needs the per-season override.
 */
function imdbIdFor(entry, season) {
  return entry.imdb?.bySeason?.[season] ?? entry.imdb?.default;
}

/**
 * The facts about a series that its episode data cannot supply.
 *
 * Episode and season counts are deliberately absent: every series is now
 * catalogued, so those are just the length of the data and were only ever going
 * to drift from it. `era` is the broadcast span as it should read, which is not
 * always what the air dates say — Classic Who's run is quoted 1963–1989 even
 * though the catalogue holds later specials. `serials` applies to Classic Who
 * alone, which was made as multi-part stories rather than episodes.
 */
/**
 * `card` names the episode whose still fronts the series on the rail.
 *
 * Stills rather than the key art: the cards are square, and a portrait poster
 * cropped square loses most of its composition, while a 16:9 frame crops to a
 * square cleanly. It also means the card shows the thing you would actually
 * watch. The episode is named rather than derived so the choice is deliberate —
 * a 1963 opener is not the strongest frame Classic Who has.
 *
 * `focus` is the object-position, since the interesting part of a frame is
 * rarely dead centre.
 *
 * `film` marks the one-off stories. Their card shows only the date: "1 episode,
 * 1 season" is technically true of a TV movie and tells nobody anything. The
 * War Between the Land and the Sea is five parts on IMDb but one story, told
 * over three weeks, and is filed the same way.
 */
const FACTS = {
  'classic-who': { era: '1963–1989', serials: 157, card: { season: 12, episode: 9 }, focus: '50% 40%' },
  'the-movie': { era: '1996', film: true, card: { season: 1, episode: 1 }, focus: '50% 34%' },
  'new-who': { era: '2005–2025', card: { season: 3, episode: 11 }, focus: '50% 38%' },
  torchwood: { era: '2006–2011', card: { season: 2, episode: 1 }, focus: '50% 42%' },
  'sarah-jane': { era: '2007–2011', card: { season: 1, episode: 1 }, focus: '50% 38%' },
  class: { era: '2016', card: { season: 1, episode: 3 }, focus: '50% 40%' },
  'wilderness-years': { era: '1993–2003', card: { season: 1, episode: 1 }, focus: '50% 40%' },
  'land-and-sea': { era: '2025', card: { season: 1, episode: 1 }, focus: '50% 40%' },
  'complete-chronology': { era: '1963–Present', chronology: true, card: { season: 1, episode: 708 }, focus: '50% 40%' },
};

module.exports = {
  series, byStremioId, byKey, imdbIdFor, IMDB, FACTS, SITE, ADDON_LOGO,
  ADDON: registry.addon,
};
