// Small versions of the episode stills, for the website's episode list.
//
// The addon's stills are 1280x720 JPEGs of 60 to 150KB each, right for a
// player's episode grid and far too heavy for a list of 239 rows. This reads
// each still from the CDN and writes a 320x180 WebP of a few KB into
// art-cdn/thumbs/, mirroring the still's path, so that
//   .../new-who/S01/E01_rose.jpg   becomes   .../art/thumbs/new-who/S01/E01_rose.webp
// once `npm run art:upload` has copied art-cdn/ to the bucket. Files already
// built are skipped, so re-running after adding episodes is cheap.
//
//   npm run thumbs

const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const { series } = require('../lib/series');

const CDN = 'https://cdn.nubblyn.com/file/whoniverse/';
const OUT = path.join(__dirname, '..', 'art-cdn', 'thumbs');

/** The bucket path of a URL, without the ?v=hash cache buster.
 *
 * Every URL in data/*.js carries the file's SHA1 as a query string, so the
 * extension is never last and an anchored replace never fired: the path kept
 * `.jpg?v=abcd1234`, and Windows refuses a filename with a `?` in it. That is
 * why this reported 2113 failures and built nothing. */
function relPath(url) {
  return url.slice(CDN.length).split('?')[0].replace(/\.(jpe?g|png|webp)$/i, '.webp');
}

/** Where a still's small version lives, or null when the still is not ours. */
function thumbFor(stillUrl) {
  if (!stillUrl || !stillUrl.startsWith(CDN)) return null;
  return `${CDN}art/thumbs/${relPath(stillUrl)}`;
}

async function main() {
  let built = 0, kept = 0, failed = 0;
  for (const entry of series) {
    for (const episode of require(path.join(__dirname, '..', 'data', `${entry.data}.js`))) {
      const src = episode.thumbnail;
      if (!src || !src.startsWith(CDN)) continue;
      const rel = relPath(src);
      const dest = path.join(OUT, rel);
      if (fs.existsSync(dest)) { kept++; continue; }
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        await sharp(Buffer.from(await res.arrayBuffer())).resize(320, 180, { fit: 'cover' }).webp({ quality: 72 }).toFile(dest);
        built++;
      } catch (err) {
        failed++;
        console.log(`failed ${rel}: ${err.message}`);
      }
    }
  }
  const total = fs.existsSync(OUT) ? fs.readdirSync(OUT, { recursive: true }).filter((f) => f.endsWith('.webp')).length : 0;
  console.log(`thumbs: built ${built}, already there ${kept}, failed ${failed}; ${total} files in art-cdn/thumbs`);
}

module.exports = { thumbFor };
if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });
