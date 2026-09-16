// Episode stills, pulled from the video files themselves.
//
//   node scripts/build-stills.js <folder> [--force]
//   node scripts/build-stills.js --urls <file> --out <dir> [--force]
//
// The --urls form reads one bucket URL a line and writes <stem>.jpg into --out.
// ffmpeg range-requests an mp4 with moov at the front, so seeking to four
// sample points in a 1.5GB episode costs about three seconds and a few MB, not
// a download. That is what makes it practical to redo the stills of a season
// whose files have already been uploaded and deleted locally, which is the
// usual case when a video is replaced rather than added.
//
// Writes <episode>.jpg beside each video: 1280x720 JPEG, centre-cropped, which
// is what the 239 New Who stills already on the CDN are. Sources that are not
// 16:9 are cropped rather than letterboxed, again matching those.
//
// Choosing the frame is the whole job. It samples four points across the middle
// of the episode, lets ffmpeg's thumbnail filter pick the most representative
// frame near each, then scores them: a still wants to be bright enough to read,
// varied enough to show something, and not a single flat colour. Frames from
// the first and last tenth are skipped, which keeps out title cards, recaps and
// closing credits, and reduces the chance of spoiling the ending.
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const sharp = require('sharp');

const VIDEO = new Set(['.mkv', '.mp4', '.m4v', '.avi', '.ts']);
const W = 1280;
const H = 720;
const SAMPLE_POINTS = [0.22, 0.38, 0.55, 0.7];

function tool(name) {
  const local = path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Stremio', `${name}.exe`);
  if (fs.existsSync(local)) return local;
  execFileSync(name, ['-version'], { stdio: 'ignore' });
  return name;
}
const ffprobe = tool('ffprobe');
const ffmpeg = tool('ffmpeg');

const force = process.argv.includes('--force');
const argOf = (flag) => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? null : process.argv[i + 1];
};
const urlList = argOf('--urls');
const outDir = argOf('--out');
const root = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
if (!urlList && (!root || !fs.existsSync(root))) {
  console.error('usage: node scripts/build-stills.js <folder> [--force]');
  console.error('       node scripts/build-stills.js --urls <file> --out <dir> [--force]');
  process.exit(1);
}
if (urlList && !outDir) {
  console.error('--urls needs --out <dir>');
  process.exit(1);
}

// Each entry is [source ffmpeg can open, where the .jpg goes].
const videos = [];
if (urlList) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const line of fs.readFileSync(urlList, 'utf8').split(/\r?\n/)) {
    const url = line.trim();
    if (!url || url.startsWith('#')) continue;
    const stem = decodeURIComponent(url.split('?')[0].split('/').pop()).replace(/\.[^.]+$/, '');
    videos.push([url, path.join(outDir, `${stem}.jpg`)]);
  }
} else {
  (function walk(d) {
    for (const f of fs.readdirSync(d).sort()) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (VIDEO.has(path.extname(f).toLowerCase())) videos.push([p, p.replace(/\.[^.]+$/, '.jpg')]);
    }
  })(root);
}

// iw*sar corrects anamorphic SD, where a 720x576 frame is really 16:9.
const FILTER = `scale=iw*sar:ih,scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1`;

function duration(file) {
  const out = execFileSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1', file], { encoding: 'utf8' });
  return parseFloat(out.trim()) || 0;
}

async function score(buf) {
  const { channels, isOpaque } = await sharp(buf).stats();
  const mean = channels.reduce((a, c) => a + c.mean, 0) / channels.length;
  const sd = channels.reduce((a, c) => a + c.stdev, 0) / channels.length;
  // Too dark or blown out is unusable however detailed it is.
  if (mean < 28 || mean > 225) return -1;
  // Detail carries the score; brightness only has to be reasonable.
  const midtone = 1 - Math.abs(mean - 118) / 160;
  return sd * 2 + midtone * 30 + (isOpaque ? 0 : -5);
}

async function main() {
  let built = 0, kept = 0, failed = 0;
  for (const [video, out] of videos) {
    if (fs.existsSync(out) && !force) { kept += 1; continue; }
    const total = duration(video);
    if (!total) { failed += 1; console.log(`  no duration   ${path.basename(video)}`); continue; }
    let best = null, bestScore = -Infinity, bestAt = 0;
    for (const point of SAMPLE_POINTS) {
      const at = total * point;
      let buf;
      try {
        buf = execFileSync(ffmpeg, ['-v', 'error', '-ss', at.toFixed(2), '-i', video,
          '-frames:v', '1', '-vf', `thumbnail=90,${FILTER}`, '-f', 'image2pipe',
          '-vcodec', 'mjpeg', '-q:v', '2', '-'],
          { maxBuffer: 64 * 1024 * 1024 });
      } catch { continue; }
      if (!buf || !buf.length) continue;
      const s = await score(buf);
      if (s > bestScore) { bestScore = s; best = buf; bestAt = at; }
    }
    if (!best) { failed += 1; console.log(`  no usable frame ${path.basename(video)}`); continue; }
    await sharp(best).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
    built += 1;
    const kb = Math.round(fs.statSync(out).size / 1024);
    console.log(`  ${path.basename(out).padEnd(52)} ${String(kb).padStart(4)}KB  from ${Math.round(bestAt / 60)}m`);
  }
  console.log(`\n  ${built} stills written, ${kept} already there, ${failed} failed`);
}

main().catch((e) => { console.error(e); process.exit(1); });
