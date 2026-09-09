// Episode stills, pulled from the video files themselves.
//
//   node scripts/build-stills.js <folder> [--force]
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

const root = process.argv[2];
const force = process.argv.includes('--force');
if (!root || !fs.existsSync(root)) {
  console.error('usage: node scripts/build-stills.js <folder> [--force]');
  process.exit(1);
}

const videos = [];
(function walk(d) {
  for (const f of fs.readdirSync(d).sort()) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (VIDEO.has(path.extname(f).toLowerCase())) videos.push(p);
  }
})(root);

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
  for (const video of videos) {
    const out = video.replace(/\.[^.]+$/, '.jpg');
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
