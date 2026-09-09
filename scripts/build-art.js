// Build every image the project serves from the sources in art-src/.
//
// Two outputs:
//
//   public/art/   what the landing page serves from Vercel: the hero, the logo
//                 and the seven series cards as 2x WebP (10.9MB of PNG exports
//                 come out at about 500KB).
//
//   art-cdn/      what the addon points Stremio and Nuvio at, uploaded to the
//                 bucket by scripts/upload-art.sh. Posters as JPEG at up to
//                 800x1200, backgrounds as JPEG at up to 1920 wide, logos as
//                 PNG so they keep their transparency, plus the addon's own
//                 logo. JPEG and PNG rather than WebP because the clients
//                 include TV builds on older engines; the website can afford
//                 to assume more.
//
// Every image the addon hands out lives in our bucket. Nothing is fetched from
// imgur, metahub or TMDB at request time, so a poster loads as fast as an
// episode does and does not depend on a third party staying up.
//
//   npm run art

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const { series } = require('../lib/series');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'art-src');
const SITE = path.join(ROOT, 'public', 'art');
const CDN = path.join(ROOT, 'art-cdn');

const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

let total = 0;
function log(label, info, extra = '') {
  total += info.size;
  console.log(`${label.padEnd(36)} ${String(info.width).padStart(4)}x${String(info.height).padEnd(5)} ${(info.size / 1024).toFixed(0).padStart(5)}KB ${extra}`);
}

async function site() {
  fs.mkdirSync(SITE, { recursive: true });
  const hero = await sharp(path.join(SRC, 'hero.png')).resize(1600, 900, { fit: 'cover' }).webp({ quality: 82 }).toFile(path.join(SITE, 'hero.webp'));
  log('public/art/hero.webp', hero);
  fs.copyFileSync(path.join(SRC, 'logo.png'), path.join(SITE, 'logo.png'));
  for (const entry of series) {
    const src = path.join(SRC, entry.art.replace(/\.webp$/, '.png'));
    const meta = await sharp(src).metadata();
    const ratio = (meta.width / meta.height).toFixed(3);
    // Cards are locked to 2:3 on the page and never cropped there, so they
    // must leave here at exactly that ratio. `cover` only trims a source that
    // strays, and the log says so.
    const info = await sharp(src).resize(400, 600, { fit: 'cover' }).webp({ quality: 82 }).toFile(path.join(SITE, entry.art));
    log(`public/art/${entry.art}`, info, ratio === '0.667' ? '' : `(source ${meta.width}x${meta.height}, trimmed)`);
  }
}

async function cdn() {
  for (const dir of ['poster', 'background', 'logo']) fs.mkdirSync(path.join(CDN, dir), { recursive: true });

  // Trimmed first: the source carries transparent padding, which at favicon
  // sizes is the difference between a legible TARDIS and a blue smudge.
  const mark = sharp(path.join(SRC, 'cdn', 'addon-logo.png')).trim({ threshold: 10 });
  const addonLogo = await mark.clone().resize(512, 512, { fit: 'contain', background: TRANSPARENT })
    .png().toFile(path.join(CDN, 'addon-logo.png'));
  log('art-cdn/addon-logo.png', addonLogo);

  // Cloudflare caches the bucket for four hours and keys on the URL, so a
  // replaced file keeps serving the old bytes. Every CDN image gets a hash in
  // its address, written to data/art-version.json at the end of this function,
  // which makes a changed file a changed URL.

  // The site's own icon, so a 16px favicon does not pull a 300KB file off the CDN.
  const icon = await mark.clone().resize(192, 192, { fit: 'contain', background: TRANSPARENT })
    .png().toFile(path.join(SITE, 'icon.png'));
  log('public/art/icon.png', icon);

  for (const entry of series) {
    const k = entry.key;
    // The poster is the same picture as the website card, from the same file.
    const poster = await sharp(path.join(SRC, entry.art.replace(/\.webp$/, '.png')))
      .resize(800, 1200, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 86, mozjpeg: true })
      .toFile(path.join(CDN, 'poster', `${k}.jpg`));
    log(`art-cdn/poster/${k}.jpg`, poster);

    const bg = await sharp(path.join(SRC, 'cdn', `${k}-background.jpg`))
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true })
      .toFile(path.join(CDN, 'background', `${k}.jpg`));
    log(`art-cdn/background/${k}.jpg`, bg);

    const logo = await sharp(path.join(SRC, 'cdn', `${k}-logo.png`))
      .resize(800, 400, { fit: 'inside', withoutEnlargement: true }).png()
      .toFile(path.join(CDN, 'logo', `${k}.png`));
    log(`art-cdn/logo/${k}.png`, logo);
  }

  // The addon logo has carried a hash in its URL for a while, for the reason
  // given above: replace a file and Cloudflare keeps serving the old bytes for
  // four hours, and Stremio's own image cache holds on longer than that. The
  // posters needed the same treatment and did not have it, so a new poster
  // looked like it had not uploaded at all.
  const stamps = { addonLogo: version(path.join(CDN, 'addon-logo.png')) };
  for (const dir of ['poster', 'background', 'logo']) {
    stamps[dir] = Object.fromEntries(series.map((e) => {
      const ext = dir === 'logo' ? 'png' : 'jpg';
      return [e.key, version(path.join(CDN, dir, `${e.key}.${ext}`))];
    }));
  }
  fs.writeFileSync(path.join(ROOT, 'data', 'art-version.json'), `${JSON.stringify(stamps)}\n`);
  console.log(`${'data/art-version.json'.padEnd(36)} ${series.length * 3 + 1} files stamped`);
}

/** Eight characters of the file's md5, or empty if it is not there. */
function version(file) {
  try {
    return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
  } catch {
    return '';
  }
}

(async () => {
  await site();
  await cdn();
  console.log(`\n${(total / 1024).toFixed(0)}KB written`);
})().catch((e) => { console.error(e.message); process.exit(1); });
