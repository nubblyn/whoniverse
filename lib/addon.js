// The addon itself: manifest and handlers, with nothing about how it is served.
//
// Kept separate from index.js because the addon runs in two shapes. Locally it
// is a long-running server (serveHTTP); on Vercel it is a request handler built
// from getRouter. Both need the same interface, and neither should own it.

const { addonBuilder } = require('stremio-addon-sdk');

const {
  populatedSeries,
  playableSeries,
  typeOf,
  toCatalogMeta,
  toSeriesMeta,
  findByVideoId,
} = require('./catalog');
const { streamsFor } = require('./streams');
const { subtitlesFor } = require('./subtitles');

const { ADDON_LOGO, ADDON } = require('./series');
const CATALOG_ID = 'whoniverse_catalog';

// Nothing here is configurable and no route needs guarding: every stream is a
// public URL, and no request touches an account or a secret.
/** A list as English: "a, b and c". */
function andList(names) {
  if (names.length < 2) return names[0] || '';
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * The sentence about what plays and what does not, worked out rather than
 * written down.
 *
 * It was written down, and it rotted: it still said the film, Torchwood, The
 * Sarah Jane Adventures, Class and The War Between the Land and the Sea were
 * "catalogued and on the way" for a while after all five had gone live. This
 * cannot fall out of step, because it is the same `playableSeries()` the
 * catalogue itself uses. The chronology is named apart from the rest: it is a
 * view of the others, not a source of its own.
 */
function statusSentence() {
  const chronology = 'complete-chronology';
  const playing = playableSeries().filter((s) => s.key !== chronology).map((s) => s.name);
  const soon = populatedSeries()
    .filter((s) => s.key !== chronology && !playing.includes(s.name))
    .map((s) => s.name);
  const parts = [];
  if (playing.length) parts.push(`${andList(playing)} play now.`);
  if (soon.length) parts.push(`${andList(soon)} ${soon.length > 1 ? 'are' : 'is'} catalogued and on the way.`);
  if (populatedSeries().some((s) => s.key === chronology)) {
    parts.push('The Complete Chronology runs all of it as one list.');
  }
  return parts.join(' ');
}

// Name and description come from ledger/addon.tsv, the same place the series
// prose lives, so what the addon says about itself is edited beside what it
// says about everything else. The version stays in code: it belongs to the
// deploy, not to the catalogue.
const manifest = {
  id: ADDON.id,
  version: '2.1.1',
  name: ADDON.name,
  description: ADDON.description.replace('{status}', statusSentence()),
  logo: ADDON_LOGO,
  types: ['series'],
  // Prefixes are declared per resource, not on the manifest. Our metas are only
  // ever `whoniverse_*`, but our videos carry IMDb ids where we know them, so
  // streams and subtitles must answer `tt*` too. Declaring `tt` at manifest
  // level would also make clients ask us for the meta of every IMDb title
  // anyone opens — thousands of requests we would answer with null.
  resources: [
    'catalog',
    // Our ids only. Answering `tt` ids as well made every client ask us about
    // every IMDb title anyone opened, and let other addons answer for ours.
    { name: 'meta', types: ['series'], idPrefixes: ['whoniverse_'] },
    { name: 'stream', types: ['series'], idPrefixes: ['whoniverse_'] },
    { name: 'subtitles', types: ['series'], idPrefixes: ['whoniverse_'] },
  ],
  // One row, because everything is a series. The 1996 film is a one-episode
  // series rather than Stremio's movie type: a client cannot mix films and
  // series in a row, so filing it as a film split the Whoniverse in two for
  // the sake of a single title. Rows follow the registry's order, which is
  // the website's order.
  catalogs: [
    { type: 'series', id: CATALOG_ID, name: 'Whoniverse' },
  ],
  behaviorHints: { configurable: false, adult: false },
};

const builder = new addonBuilder(manifest);

// Every catalogued series is listed, whether its files have landed or not, so
// the row shows the whole Whoniverse. A series with nothing playable yet gets
// its artwork and its description and no episode list at all: see toSeriesMeta.
builder.defineCatalogHandler(async (args) => {
  if (args.id !== CATALOG_ID) return { metas: [] };
  return { metas: populatedSeries().filter((s) => typeOf(s) === args.type).map(toCatalogMeta) };
});

builder.defineMetaHandler(async (args) => {
  const entry = populatedSeries().find((s) => s.stremioId === args.id);
  if (!entry || typeOf(entry) !== args.type) return { meta: null };
  return { meta: toSeriesMeta(entry) };
});

/**
 * The episode behind a stream or subtitles request. The id is always a video
 * id, ours (`whoniverse_new_who:6:3`) or IMDb's (`tt0436992:1:1`), now that
 * the 1996 film is a one-episode series like everything else.
 */
function resolve(args) {
  if (!args.id) return null;
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
