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
 * Stream name. Clients render this as the label, and Nuvio reads quality tokens
 * out of it for its badges, so the convention — used by Torrentio and others —
 * is addon name, newline, quality.
 */
function streamName(episode) {
  return episode.quality ? `Whoniverse\n${episode.quality}` : 'Whoniverse';
}

/**
 * The one stream for an episode, or none.
 *
 * `bingeGroup` is what makes "next episode" work without a click: when the
 * following episode offers a stream in the same group, the client picks it
 * automatically. Group by series and quality so a viewer stays on the same
 * quality tier through a season.
 */
function streamsFor(entry, episode) {
  const url = episode.url || episode.streamUrl;
  if (!url) return [];

  // What the stream is called in the list. The client already shows the
  // episode's name above it, so repeating it here said nothing; this is the
  // action.
  // The 1996 film is a one-episode series, so the registry no longer marks it
  // a film. The ledger still calls that row a Movie, which is what this reads.
  const label = episode.type === 'Movie' ? 'Play film' : 'Play episode';
  const behaviorHints = {
    notWebReady: !isWebReady(url) || !hasBrowserAudio(episode),
    bingeGroup: `whoniverse|${entry.key}|${episode.quality || 'default'}`,
  };
  if (episode.filename) behaviorHints.filename = episode.filename;

  return [{
    name: streamName(episode),
    // `description` only. `title` is its deprecated twin, and Stremio's core
    // reads it as an alias of `description`: send both and the stream fails to
    // parse, and the episode shows "No streams were found".
    description: label,
    url,
    subtitles: subtitlesFor(episode),
    behaviorHints,
  }];
}

module.exports = { streamsFor, isWebReady };
