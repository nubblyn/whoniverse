// The addon itself: manifest and handlers, with nothing about how it is served.
//
// Kept separate from index.js because the addon runs in two shapes. Locally it
// is a long-running server (serveHTTP); on Vercel it is a request handler built
// from getRouter. Both need the same interface, and neither should own it.

const { addonBuilder } = require('stremio-addon-sdk');

const {
  playableSeries,
  populatedSeries,
  episodesFor,
  typeOf,
  toCatalogMeta,
  toSeriesMeta,
  findByVideoId,
} = require('./catalog');
const { streamsFor } = require('./streams');
const { subtitlesFor } = require('./subtitles');

const { ADDON_LOGO } = require('./series');
const CATALOG_ID = 'whoniverse_catalog';
const MOVIE_CATALOG_ID = 'whoniverse_movies';

// Nothing here is configurable and no route needs guarding: every stream is a
// public URL, and no request touches an account or a secret.
const manifest = {
  id: 'community.whoniverse.addon',
  version: '2.1.1',
  name: 'Whoniverse',
  description:
    'Doctor Who in original UK broadcast order, with every special, minisode ' +
    'and prequel inside its season. New Who is complete. Classic Who, the ' +
    'Wilderness Years, the 1996 film, Torchwood, The Sarah Jane Adventures, ' +
    'Class and The War Between the Land and the Sea are catalogued and on ' +
    'the way.',
  logo: ADDON_LOGO,
  types: ['series', 'movie'],
  // Prefixes are declared per resource, not on the manifest. Our metas are only
  // ever `whoniverse_*`, but our videos carry IMDb ids where we know them, so
  // streams and subtitles must answer `tt*` too. Declaring `tt` at manifest
  // level would also make clients ask us for the meta of every IMDb title
  // anyone opens — thousands of requests we would answer with null.
  resources: [
    'catalog',
    // Our ids only. Answering `tt` ids as well made every client ask us about
    // every IMDb title anyone opened, and let other addons answer for ours.
    { name: 'meta', types: ['series', 'movie'], idPrefixes: ['whoniverse_'] },
    { name: 'stream', types: ['series', 'movie'], idPrefixes: ['whoniverse_'] },
    { name: 'subtitles', types: ['series', 'movie'], idPrefixes: ['whoniverse_'] },
  ],
  // One row per type that has something catalogued: a client cannot mix films
  // and series in a row, and an empty row is noise. Rows follow the
  // registry's order, which is the website's order.
  catalogs: [
    { type: 'series', id: CATALOG_ID, name: 'Whoniverse' },
    { type: 'movie', id: MOVIE_CATALOG_ID, name: 'Whoniverse' },
  ].filter((c) => populatedSeries().some((s) => typeOf(s) === c.type)),
  behaviorHints: { configurable: false, adult: false },
};

const builder = new addonBuilder(manifest);

// Every catalogued series is listed, whether its files have landed or not, so
// the row shows the whole Whoniverse. A series with nothing playable yet gets
// its artwork and its description and no episode list at all: see toSeriesMeta.
builder.defineCatalogHandler(async (args) => {
  if (args.id !== CATALOG_ID && args.id !== MOVIE_CATALOG_ID) return { metas: [] };
  return { metas: populatedSeries().filter((s) => typeOf(s) === args.type).map(toCatalogMeta) };
});

builder.defineMetaHandler(async (args) => {
  const entry = populatedSeries().find((s) => s.stremioId === args.id);
  if (!entry || typeOf(entry) !== args.type) return { meta: null };
  return { meta: toSeriesMeta(entry) };
});

/**
 * The episode behind a stream or subtitles request. For a series the id is a
 * video id, ours (`whoniverse_new_who:6:3`) or IMDb's (`tt0436992:1:1`). For a
 * film it is the meta id, and the film is its single entry.
 */
function resolve(args) {
  if (!args.id) return null;
  if (args.type === 'movie') {
    const entry = playableSeries().find((s) => s.stremioId === args.id && typeOf(s) === 'movie');
    const episode = entry && episodesFor(entry)[0];
    return episode ? { entry, episode } : null;
  }
  return findByVideoId(args.id);
}

builder.defineStreamHandler(async (args) => {
  const found = resolve(args);
  return { streams: found ? streamsFor(found.entry, found.episode) : [] };
});

// Clients differ on whether they read subtitles off the stream object or ask
// for them separately, so both paths are served.
builder.defineSubtitlesHandler(async (args) => {
  const found = resolve(args);
  return { subtitles: found ? subtitlesFor(found.episode) : [] };
});

module.exports = { manifest, addonInterface: builder.getInterface() };
