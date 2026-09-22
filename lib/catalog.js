// Loads each series' episode array and turns it into Stremio meta objects.

const path = require('node:path');
const { series } = require('./series');

/**
 * Running order: the ledger's numbering, season then episode.
 *
 * This used to sort by release date first, on the grounds that dates are what
 * put specials and minisodes where they aired. The ledger now numbers every
 * row at its place in the story instead, so the numbering is the order and the
 * date is only what the viewer is told. Sorting by date had come to fight it:
 * the Blu-ray Collection minisodes were released in 2019 to 2023 and belong at
 * the ends of their 1960s to 1980s seasons, Shada was released in 2017 and
 * belongs after The Horns of Nimon, and undated rows were parked after every
 * dated one, which put 464 Classic episodes behind season 12. The Complete
 * Chronology suffered it too: its own episode numbers disagreed with the order
 * it was sent in at seven places. Settled with the user on 22 September 2026:
 * an item sits where its story puts it and shows its real release date, even
 * when that is years later.
 */
function inBroadcastOrder(episodes) {
  return [...episodes].sort((a, b) => a.season - b.season || a.episode - b.episode);
}

const cache = new Map();

/** Episodes for a series, sorted, loaded once. */
function episodesFor(entry) {
  if (!cache.has(entry.key)) {
    const loaded = require(path.join('..', 'data', entry.data));
    cache.set(entry.key, inBroadcastOrder(loaded));
  }
  return cache.get(entry.key);
}

/**
 * The id a client uses for one episode: ours, always.
 *
 * These were IMDb ids (`tt0436992:1:1`) so that other addons would answer for
 * our episodes too. In practice that meant a stream aggregator listing its own
 * files next to ours, and "continue watching" showing Cinemeta's poster and
 * rating instead of this catalogue's. Our own ids keep the episode ours.
 */
function videoId(entry, episode) {
  return `${entry.stremioId}:${episode.season}:${episode.episode}`;
}

/** The IMDb form of a video id, kept so links made before the change still resolve. */
function imdbVideoId(episode) {
  const m = episode.imdb;
  return m?.id && m.season != null && m.episode != null ? `${m.id}:${m.season}:${m.episode}` : null;
}

/**
 * Episode still, from our bucket or not at all.
 *
 * This used to fall back to metahub, which meant a tile could show a still we
 * had never seen, keyed off IMDb's numbering rather than ours and liable to
 * change under us. Everything the addon shows now comes out of the bucket, so
 * an episode with no still of its own has none and the client draws its own
 * placeholder.
 */
const BUCKET = 'https://cdn.nubblyn.com/file/whoniverse/';
function thumbnailFor(entry, episode) {
  return episode.thumbnail?.startsWith(BUCKET) ? episode.thumbnail : undefined;
}

/** Whether a series has anything to play yet. */
function isPlayable(entry) {
  return episodesFor(entry).some(hasStream);
}

/** The Stremio type an entry is filed under: 'series' unless the registry says 'movie'. */
function typeOf(entry) {
  return entry.type || 'series';
}

/** The summary, with a note for as long as nothing in it plays. */
function summaryFor(entry) {
  return isPlayable(entry) ? entry.description : `${entry.description}\n\nComing soon.`;
}

/** One entry in a catalog row. */
function toCatalogMeta(entry) {
  return {
    id: entry.stremioId,
    type: typeOf(entry),
    name: entry.name,
    poster: entry.poster,
    posterShape: 'poster',
    // Nuvio's hover on the home screen shows the background; without one it
    // stretches the poster.
    background: entry.background,
    logo: entry.logo,
    description: summaryFor(entry),
    genres: entry.genres,
    releaseInfo: entry.releaseInfo,
  };
}

/**
 * Full meta for a detail page. A series carries every catalogued episode, playable
 * or not, so the page reads as a catalogue; a film carries none, and its stream is
 * asked for by the meta id itself.
 */
function toSeriesMeta(entry) {
  const meta = {
    id: entry.stremioId,
    type: typeOf(entry),
    name: entry.name,
    poster: entry.poster,
    posterShape: 'poster',
    background: entry.background,
    logo: entry.logo,
    description: summaryFor(entry),
    releaseInfo: entry.releaseInfo,
    genres: entry.genres,
  };
  if (typeOf(entry) === 'movie') return meta;

  // A series with nothing playable yet is listed for its artwork alone. Sending
  // the episode list anyway would fill the page with seasons whose every entry
  // dead-ends, and Stremio would put all 716 of Classic Who into the library of
  // anyone who added it. The videos arrive with the files.
  if (!episodesFor(entry).some(hasStream)) return meta;

  // Cinemeta sends released/firstAired and overview/description in pairs, so
  // both names are safe to send together and clients read whichever they
  // know. The episode's title is the exception: Stremio's core takes `name`
  // as an alias of `title` and rejects the video, and with it the entire
  // meta, when both are present. `title` is the documented field.
  meta.videos = episodesFor(entry).map((episode) => ({
    id: videoId(entry, episode),
    title: episode.title,
    season: episode.season,
    episode: episode.episode,
    number: episode.episode,
    released: episode.released,
    firstAired: episode.released,
    overview: episode.overview,
    description: episode.overview,
    thumbnail: thumbnailFor(entry, episode),
    // Greys out anything with no way to play it yet, rather than letting a
    // click dead-end on an empty stream list.
    available: hasStream(episode),
  }));
  return meta;
}

/** Whether an episode has a URL to play. `streamUrl` is the older field name. */
function hasStream(episode) {
  return Boolean(episode.url || episode.streamUrl);
}

let videoIndex = null;

/**
 * Find the episode behind a video id, whichever form the id takes.
 *
 * Built once over every populated series, because an IMDb-style id carries no
 * hint of which of our series it belongs to — `tt0436992:1:1` could only be
 * found by asking each series in turn, so ask them all up front.
 */
function findByVideoId(id) {
  if (!videoIndex) {
    videoIndex = new Map();
    for (const entry of populatedSeries()) {
      for (const episode of episodesFor(entry)) {
        videoIndex.set(videoId(entry, episode), { entry, episode });
        videoIndex.set(imdbVideoId(episode) || videoId(entry, episode), { entry, episode });
      }
    }
  }
  return videoIndex.get(id) || null;
}

/** Series with any entries at all, catalogued or not. Drives the website. */
function populatedSeries() {
  return series.filter((entry) => episodesFor(entry).length > 0);
}

/**
 * Series with at least one entry that can actually be played.
 *
 * This, not populatedSeries, is what the addon offers. Every series is
 * catalogued from Cinemeta, so all of them have episodes; offering a series
 * whose every episode is unplayable would put Classic Who in someone's library
 * as 796 dead entries.
 */
function playableSeries() {
  return series.filter((entry) => episodesFor(entry).some(hasStream));
}

module.exports = {
  episodesFor,
  populatedSeries,
  typeOf,
  playableSeries,
  toCatalogMeta,
  toSeriesMeta,
  findByVideoId,
  hasStream,
};
