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

// Letterboxed sources: the 2160p WEB files are 2.00:1 pictures inside a 16:9
// frame, so a centre crop keeps the black bars and the still ends up with a
// band top and bottom. ffmpeg's own cropdetect reported these as full-frame,
// so the borders are measured here instead: one greyscale column average per
// row, then the first and last row above black. Season 13's Power of the
// Doctor and season 14's three specials all came out with 40 dark rows of 720
// before this existed.
function activeCrop(file, at) {
  let raw;
  try {
    raw = execFileSync(ffmpeg, ['-v', 'error', '-ss', at.toFixed(2), '-i', file,
      '-frames:v', '1', '-vf', 'format=gray,scale=64:ih', '-f', 'rawvideo', '-'],
      { maxBuffer: 16 * 1024 * 1024 });
  } catch { return null; }
  if (!raw || raw.length < 64) return null;
  // scale=64:ih keeps every source row: scaling the height down instead turns a
  // 120-row bar on a 2160-row frame into two rows, which reads as noise.
  const rows = raw.length / 64;
  if (!Number.isInteger(rows)) return null;
  const mean = [];
  for (let y = 0; y < rows; y += 1) {
    let t = 0;
    for (let x = 0; x < 64; x += 1) t += raw[y * 64 + x];
    mean.push(t / 64);
  }
  let top = 0; while (top < rows && mean[top] <= 16) top += 1;
  let bot = rows - 1; while (bot > top && mean[bot] <= 16) bot -= 1;
  const height = bot - top + 1;
  const vertical = (top === 0 && bot === rows - 1) || top < rows * 0.01
    || height < rows * 0.5
    ? null
    : { top: top / rows, height: height / rows };
  const horizontal = activeColumns(file, at);
  if (!vertical && !horizontal) return null;
  const box = {};
  if (vertical) { box.top = round6(vertical.top); box.height = round6(vertical.height); }
  if (horizontal) { box.left = round6(horizontal.left); box.width = round6(horizontal.width); }
  return box;
}

function round6(v) { return Math.round(v * 1e6) / 1e6; }

// The mirror of activeCrop's row pass, for the pillarbox a 4:3 picture leaves
// inside a 16:9 frame.
function activeColumns(file, at) {
  let raw;
  try {
    raw = execFileSync(ffmpeg, ['-v', 'error', '-ss', at.toFixed(2), '-i', file,
      '-frames:v', '1', '-vf', 'format=gray,scale=iw:64', '-f', 'rawvideo', '-'],
      { maxBuffer: 16 * 1024 * 1024 });
  } catch { return null; }
  if (!raw || raw.length < 64) return null;
  const cols = raw.length / 64;
  if (!Number.isInteger(cols)) return null;
  const mean = [];
  for (let x = 0; x < cols; x += 1) {
    let t = 0;
    for (let y = 0; y < 64; y += 1) t += raw[y * cols + x];
    mean.push(t / 64);
  }
  let left = 0; while (left < cols && mean[left] <= 16) left += 1;
  let right = cols - 1; while (right > left && mean[right] <= 16) right -= 1;
  const width = right - left + 1;
  if (left === 0 && right === cols - 1) return null;
  if (left < cols * 0.01 || width < cols * 0.5) return null;
  return { left: left / cols, width: width / cols };
}

function duration(file) {
  const out = execFileSync(ffprobe, ['-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=nw=1:nk=1', file], { encoding: 'utf8' });
  return parseFloat(out.trim()) || 0;
}

// A DVD-sourced file is usually interlaced, and a single frame pulled from one
// is two field times combed together: every vertical edge grows a comb. The
// Lost in Time rips of Day of Armageddon and its neighbours are field_order=tt
// and their first stills were unusable for exactly this. Deinterlace before
// sampling when the stream says it is interlaced.
function interlaced(file) {
  try {
    const out = execFileSync(ffprobe, ['-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=field_order', '-of', 'default=nw=1:nk=1', file],
      { encoding: 'utf8' }).trim();
    return out === 'tt' || out === 'bb' || out === 'tb' || out === 'bt';
  } catch { return false; }
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
    const deint = interlaced(video) ? 'yadif=0:-1:0,' : '';
    let best = null, bestScore = -Infinity, bestAt = 0;
    for (const point of SAMPLE_POINTS) {
      const at = total * point;
      let buf;
      try {
        const box = activeCrop(video, at);
        const w = box && box.width !== undefined ? `iw*${box.width}` : 'iw';
        const x = box && box.left !== undefined ? `iw*${box.left}` : '0';
        const hh = box && box.height !== undefined ? `ih*${box.height}` : 'ih';
        const y = box && box.top !== undefined ? `ih*${box.top}` : '0';
        const pre = box ? `crop=${w}:${hh}:${x}:${y},` : '';
        buf = execFileSync(ffmpeg, ['-v', 'error', '-ss', at.toFixed(2), '-i', video,
          '-frames:v', '1', '-vf', `${deint}thumbnail=90,${pre}${FILTER}`, '-f', 'image2pipe',
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
