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
const CDN_ART = 'https://cdn.nubblyn.com/file/whoniverse/art';
// The hashes are written by scripts/build-art.js. Without one a replaced image
// sits behind Cloudflare's four hour cache, and behind Stremio's own image
// cache for longer than that; with one the URL changes when the file does.
// Absent on a fresh clone that has not built art yet.
let stamps = {};
try { stamps = require('../data/art-version.json'); } catch { /* not built yet */ }
const v = (kind, key) => (stamps[kind] && stamps[kind][key] ? `?v=${stamps[kind][key]}` : '');
const ADDON_LOGO = `${CDN_ART}/addon-logo.png${stamps.addonLogo ? `?v=${stamps.addonLogo}` : ''}`;

/** Poster, background and logo for a series, all from the bucket. */
function bucketArt(key) {
  const art = { poster: `${CDN_ART}/poster/${key}.jpg${v('poster', key)}` };
  // A series can arrive with a poster and nothing else. Sending a URL for a
  // background that was never built gives Stremio a 404 to draw, so the field
  // only appears once the file does.
  if (v('background', key)) art.background = `${CDN_ART}/background/${key}.jpg${v('background', key)}`;
  if (v('logo', key)) art.logo = `${CDN_ART}/logo/${key}.png${v('logo', key)}`;
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

const series = [
  {
    key: 'classic-who',
    art: 'card-1.webp',
    stremioId: 'whoniverse_classic_who',
    name: 'Classic Who',
    imdb: { default: IMDB.classic },
    description:
      'The original run of Doctor Who, from An Unearthly Child in 1963 to ' +
      'Survival in 1989. Seven Doctors across 26 seasons, told as multi-part ' +
      'serials and presented here in UK broadcast order with the specials in ' +
      'their place.',
    releaseInfo: '1963-1989',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    ...bucketArt('classic-who'),
    data: 'classic-who',
  },
  {
    key: 'wilderness-years',
    art: 'card-8.webp',
    stremioId: 'whoniverse_wilderness_years',
    name: 'Wilderness Years',
    description:
      'The sixteen years off the air, between Survival in 1989 and Rose in ' +
      '2005. Two charity specials and three webcasts: everything the ' +
      'programme managed while it was cancelled.',
    releaseInfo: '1993-2003',
    genres: ['Sci-Fi', 'Adventure'],
    ...bucketArt('wilderness-years'),
    data: 'wilderness-years',
  },
  {
    key: 'the-movie',
    art: 'card-2.webp',
    stremioId: 'whoniverse_the_movie',
    name: 'Doctor Who: The Movie',
    imdb: { default: IMDB.movie },
    // A one-episode series rather than Stremio's movie type. A client cannot
    // mix films and series in a catalog row, so filing it as a film put the
    // Whoniverse in two rows for the sake of a single title.
    description:
      'The 1996 television film that bridges the classic and modern eras. ' +
      'Sylvester McCoy\'s Seventh Doctor regenerates into Paul McGann\'s Eighth ' +
      'in San Francisco on the eve of the millennium, and the Master, in a ' +
      'stolen body, wants the TARDIS for himself.',
    releaseInfo: '1996',
    genres: ['Sci-Fi', 'Adventure'],
    ...bucketArt('the-movie'),
    data: 'the-movie',
  },
  {
    key: 'new-who',
    art: 'card-3.webp',
    // Predates this refactor and is already in people's libraries. Do not touch.
    stremioId: 'whoniverse_new_who',
    name: 'New Who',
    imdb: {
      default: IMDB.newWho,
      // The 2023 relaunch is its own IMDb title, restarting at season 1.
      bySeason: { 14: IMDB.newWho2023, 15: IMDB.newWho2023, 16: IMDB.newWho2023 },
    },
    description:
      'The revived series, from Rose in 2005 to the present day, in original ' +
      'UK broadcast order. Specials, minisodes and prequels sit inside their ' +
      'seasons, so the story runs straight through from the Ninth Doctor onward.',
    releaseInfo: '2005-Present',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    ...bucketArt('new-who'),
    data: 'new-who',
  },
  {
    key: 'torchwood',
    art: 'card-4.webp',
    stremioId: 'whoniverse_torchwood',
    name: 'Torchwood',
    imdb: { default: IMDB.torchwood },
    description:
      'Captain Jack Harkness leads a secret Cardiff institute that catches ' +
      'whatever falls through the Rift, in the darker spin-off made for adults. ' +
      'Four series, from the standalone cases of the early years to the ' +
      'worldwide crises of Children of Earth and Miracle Day.',
    releaseInfo: '2006-2011',
    genres: ['Sci-Fi', 'Drama', 'Thriller'],
    ...bucketArt('torchwood'),
    data: 'torchwood',
  },
  {
    key: 'sarah-jane',
    art: 'card-5.webp',
    stremioId: 'whoniverse_sarah_jane',
    name: 'The Sarah Jane Adventures',
    imdb: { default: IMDB.sarahJane },
    description:
      'Sarah Jane Smith, the Doctor\'s longest-serving companion, investigates ' +
      'alien activity from her attic on Bannerman Road with her son Luke and ' +
      'his friends. Five series of family adventures that run in step with the ' +
      'Tenth and Eleventh Doctors\' eras.',
    releaseInfo: '2007-2011',
    genres: ['Sci-Fi', 'Adventure', 'Family'],
    ...bucketArt('sarah-jane'),
    data: 'sarah-jane',
  },
  {
    key: 'class',
    art: 'card-6.webp',
    stremioId: 'whoniverse_class',
    name: 'Class',
    imdb: { default: IMDB.class },
    description:
      'Coal Hill Academy sixth-formers guard a tear in space and time left ' +
      'behind by the Doctor\'s many visits, with an alien prince and his exiled ' +
      'guardian hiding among the students. A single eight-episode series from ' +
      '2016.',
    releaseInfo: '2016',
    genres: ['Sci-Fi', 'Drama', 'Horror'],
    ...bucketArt('class'),
    data: 'class',
  },
  {
    key: 'land-and-sea',
    art: 'card-7.webp',
    stremioId: 'whoniverse_land_and_sea',
    name: 'The War Between the Land and the Sea',
    imdb: { default: IMDB.landAndSea },
    description:
      'An ancient species rises from the ocean floor to claim the planet, and ' +
      'UNIT stands between humanity and the deep. A five-part story from ' +
      'December 2025, the newest branch of the Whoniverse.',
    releaseInfo: '2025',
    genres: ['Sci-Fi', 'Drama', 'Thriller'],
    ...bucketArt('land-and-sea'),
    data: 'land-and-sea',
  },
];

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
};

module.exports = { series, byStremioId, byKey, imdbIdFor, IMDB, FACTS, SITE, ADDON_LOGO };
