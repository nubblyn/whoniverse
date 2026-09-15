// What is actually in the bucket, read from the bucket itself.
//
// Backblaze will not list a bucket without an application key, and neither the
// site nor Vercel holds one. So scripts/bucket-index.sh publishes the listing
// into the bucket as bucket-index.json and everything reads that. Uploading or
// deleting a file and re-running that script is enough — no redeploy, no
// commit, no data/ file to keep in step.
//
// Note the host. Cloudflare refuses requests from Vercel's functions, so
// anything server-side has to go to B2's own origin rather than the CDN; the
// browser, which is not a Vercel function, is fine on either.

const ORIGIN = process.env.WHONIVERSE_B2_ORIGIN
  || 'https://f003.backblazeb2.com/file/whoniverse';
const INDEX_URL = `${ORIGIN}/bucket-index.json`;

// One fetch per warm function, refreshed on a timer. A landing page render
// must not wait on the network more often than it has to, and the listing
// changes when someone uploads, not when someone visits.
const TTL_MS = 5 * 60 * 1000;
let cache = { at: 0, set: null, generated: null };
let inflight = null;

/**
 * A Set of every path in the bucket, or null if it could not be read.
 *
 * Null is a real answer and callers must handle it: it means "cannot tell",
 * not "empty". Treating a failed fetch as an empty bucket would blank every
 * count on the page the moment B2 had a bad minute.
 */
async function bucketIndex() {
  const now = Date.now();
  if (cache.set && now - cache.at < TTL_MS) return cache.set;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const ctl = AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined;
      const res = await fetch(INDEX_URL, { signal: ctl });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json();
      if (!body || !Array.isArray(body.files)) throw new Error('malformed index');
      cache = { at: Date.now(), set: new Set(body.files), generated: body.generated || null };
      return cache.set;
    } catch {
      // Keep serving the last good listing rather than nothing: a stale answer
      // is closer to the truth than no answer.
      if (cache.set) { cache.at = Date.now(); return cache.set; }
      return null;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** When the listing we are holding was generated, for the page to say so. */
function generatedAt() { return cache.generated; }

/** Does the bucket hold a playable video for this file stem? */
function hasVideo(index, stem) {
  if (!index) return null;
  return index.has(`${stem}.mp4`) || index.has(`${stem}.mkv`);
}

/**
 * The bucket path a recorded URL points at.
 *
 * Episodes carry a full CDN address with a cache-busting hash. What the bucket
 * listing holds is the plain key, so drop the origin and the query.
 */
function pathOf(url) {
  if (!url) return null;
  const m = String(url).match(/\/file\/whoniverse\/(.+?)(?:\?|$)/);
  return m ? m[1] : null;
}

/** Is the file this episode points at actually in the bucket? */
function episodeIsUploaded(index, episode) {
  if (!index) return null;
  const p = pathOf(episode.streamUrl || episode.url);
  return p ? index.has(p) : false;
}

module.exports = { bucketIndex, generatedAt, hasVideo, pathOf, episodeIsUploaded, INDEX_URL };
