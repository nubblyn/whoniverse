// Turning an episode into a stream.
//
// Every stream is a plain `url`. Nothing here resolves anything, talks to a
// debrid service, or returns a torrent hash. That is a deliberate floor, not a
// gap: Nuvio has no BitTorrent engine, so an `infoHash` stream does not play
// there at all, and asking viewers for a debrid key would mean a settings page.
// A URL plays in Stremio and Nuvio alike, with or without debrid, on install.
//
// Where the URL points is not this module's concern. Today it is archive.org;
// next it is a Telegram file proxy. The addon does not know or care.

const { subtitlesFor } = require('./subtitles');

/**
 * Stremio's rule for `notWebReady`: only an MP4 over HTTPS is web-ready.
 * Anything else must say so, or the web player tries and fails silently.
 */
function isWebReady(url) {
  return /^https:\/\//i.test(url) && /\.mp4(?:[?#]|$)/i.test(url);
}

/**
 * Whether a browser can decode the file's audio. Browsers play AAC, MP3, Opus
 * and FLAC; Dolby's AC-3 and E-AC-3 they do not, so the picture runs silent in
 * Stremio Web. An episode that records its audio codec (`audio: 'E-AC-3'`) is
 * marked not web-ready, which tells the client to route it through its own
 * server rather than the browser. Episodes without the field are assumed AAC.
 */
function hasBrowserAudio(episode) {
  return !episode.audio || /^(aac|mp3|opus|flac|vorbis)$/i.test(episode.audio);
}

/**
 * Stream name: the addon's, and nothing else. It used to be addon name, newline,
 * quality, the convention Torrentio set so Nuvio can badge a stream by its
 * tokens. That only helps a viewer choosing between several streams, and every
 * episode here has exactly one; what it cost was a picker that read differently
 * from series to series, and New Who, which never recorded a quality, showed
 * none at all beside its 4K episodes. The user settled on one label everywhere
 * on 22 September 2026.
 */
function streamName() {
  return 'Whoniverse';
}

/**
 * The file's own name, taken off the end of its URL.
 *
 * Every stream URL carries a hash in the query so that replacing a master with
 * a better one changes the address. That hash has no business in a name a
 * viewer sees or a player reads a container from, and only the spin-offs
 * record a `filename` of their own, so the rest have it worked out here rather
 * than left to the client to guess from an address with a query on it.
 */
function nameFromUrl(url) {
  const path = url.split(/[?#]/)[0];
  return decodeURIComponent(path.slice(path.lastIndexOf('/') + 1));
}

/**
 * The one stream for an episode, or none.
 *
 * `bingeGroup` is what makes "next episode" work without a click: when the
 * following episode offers a stream in the same group, the client picks it
 * automatically. It is the series and nothing more. It used to carry the
 * quality too, meant to keep a viewer on one tier, but with one stream per
 * episode there is never a tier to choose, and the only effect was that
 * autoplay stopped wherever the quality changed: 33 places inside Classic Who
 * seasons and 5 in the Wilderness Years.
 */
function streamsFor(entry, episode) {
  const url = episode.url || episode.streamUrl;
  if (!url) return [];

  // What the stream is called in the list. The client already shows the
  // episode's name above it, so repeating it here said nothing; this is the
  // action.
  // The 1996 film is a one-episode series, so the registry no longer marks it
  // a film. The ledger still calls that row a Movie, which is what this reads.
  const label = episode.type === 'Movie' ? 'Play Film' : 'Play Episode';
  const behaviorHints = {
    notWebReady: !isWebReady(url) || !hasBrowserAudio(episode),
    bingeGroup: `whoniverse|${entry.key}`,
  };
  const filename = episode.filename || nameFromUrl(url);
  if (filename) behaviorHints.filename = filename;

  return [{
    name: streamName(),
    // `description` only. `title` is its deprecated twin, and Stremio's core
    // reads it as an alias of `description`: send both and the stream fails to
    // parse, and the episode shows "No streams were found".
    description: label,
    url,
    subtitles: subtitlesFor(episode),
    behaviorHints,
  }];
}

module.exports = { streamsFor };
