// Subtitles, served through the addon rather than straight from the CDN.
//
// Stremio's desktop and mobile apps fetch subtitles through their own local
// server, so a bare CDN URL works there. Stremio Web fetches them from the
// browser, and the CDN answers without an Access-Control-Allow-Origin header,
// so the browser refuses the response and the player reports "failed to load
// external subtitles". Routing the file through here puts the header on it.
//
// Only files under the bucket's own prefix are fetched: this is a relay for our
// subtitles, not a general proxy.

const { SITE } = require('./series');

const CDN_BASE = 'https://cdn.nubblyn.com/file/whoniverse/';
// The relay itself reads from the bucket's own host. Cloudflare sits in front
// of the CDN name and refuses the function's fetch (a datacentre client with a
// Node user agent), while B2 answers it. Subtitles are small enough that B2's
// egress is not a concern.
const ORIGIN_BASE = 'https://f003.backblazeb2.com/file/whoniverse/';
const ROUTE = '/subs/';
// Series/season/file, plain characters only, ending in .srt.
const SAFE_PATH = /^[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\/[A-Za-z0-9._-]+\.srt$/;

/** The public URL clients should load an episode's subtitles from. */
function subtitleUrlFor(episode) {
  const src = episode.subtitleUrl;
  if (!src) return null;
  if (!src.startsWith(CDN_BASE)) return src;
  return `${SITE}${ROUTE}${src.slice(CDN_BASE.length)}`;
}

/** The subtitle entries for a stream or the subtitles resource. */
function subtitlesFor(episode) {
  const url = subtitleUrlFor(episode);
  return url ? [{ id: 'whoniverse_en', url, lang: 'eng' }] : [];
}

/** Whether a request path is for the relay. */
function isSubtitlePath(path) {
  return path.startsWith(ROUTE);
}

/** Answer a relay request: fetch from the CDN, pass through with CORS. */
async function serveSubtitle(path, res) {
  const rel = decodeURIComponent(path.slice(ROUTE.length));
  if (!SAFE_PATH.test(rel)) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ err: 'not found' }));
    return;
  }

  let upstream;
  try {
    upstream = await fetch(ORIGIN_BASE + rel, { headers: { 'User-Agent': 'whoniverse-addon' } });
  } catch (err) {
    console.error('subtitle relay fetch failed', rel, err.message);
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`upstream fetch failed: ${err.message}`);
    return;
  }
  if (!upstream.ok) {
    console.error('subtitle relay upstream', upstream.status, rel);
    res.statusCode = upstream.status === 404 ? 404 : 502;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(`upstream ${upstream.status}`);
    return;
  }

  const body = Buffer.from(await upstream.arrayBuffer());
  res.statusCode = 200;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/x-subrip; charset=utf-8');
  res.setHeader('Content-Length', body.length);
  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  res.end(body);
}

module.exports = { subtitleUrlFor, subtitlesFor, isSubtitlePath, serveSubtitle };
