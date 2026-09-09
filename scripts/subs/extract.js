// Pull subtitles out of the downloaded videos.
//
//   node scripts/subs/extract.js <folder>            report what is in there
//   node scripts/subs/extract.js <folder> --write    write .srt next to each video
//   node scripts/subs/extract.js <folder> --sup      also dump image subs for OCR
//
// Text tracks (SubRip, ASS, mov_text) come straight out as .srt. Image tracks
// (PGS from Blu-ray, VobSub from DVD) cannot: they are pictures of words and
// need OCR, which Subtitle Edit does far better than anything scriptable here.
// For those this prints the command to run and, with --sup, writes the raw
// stream so the OCR step has something to chew on.
//
// ffmpeg is not on PATH on this machine; Stremio ships a copy and we use that.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const VIDEO = new Set(['.mkv', '.mp4', '.m4v', '.avi', '.ts']);
const TEXT = new Set(['subrip', 'ass', 'ssa', 'mov_text', 'webvtt']);
const IMAGE = new Set(['hdmv_pgs_subtitle', 'dvd_subtitle', 'dvb_subtitle', 'xsub']);

function tool(name) {
  const local = path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Stremio', `${name}.exe`);
  if (fs.existsSync(local)) return local;
  try {
    execFileSync(name, ['-version'], { stdio: 'ignore' });
    return name;
  } catch {
    throw new Error(`${name} not found. Install ffmpeg, or run Stremio once so its copy exists.`);
  }
}

const root = process.argv[2];
const write = process.argv.includes('--write');
const dumpSup = process.argv.includes('--sup');
if (!root || !fs.existsSync(root)) {
  console.error('usage: node scripts/subs/extract.js <folder> [--write] [--sup]');
  process.exit(1);
}
const ffprobe = tool('ffprobe');
const ffmpeg = tool('ffmpeg');

const videos = [];
(function walk(d) {
  for (const f of fs.readdirSync(d).sort()) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (VIDEO.has(path.extname(f).toLowerCase())) videos.push(p);
  }
})(root);

// A file may carry several tracks. Prefer a full English track over a forced
// one, which only covers foreign dialogue, and prefer text over pictures.
function pick(streams) {
  const eng = streams.filter((s) => !s.lang || s.lang.startsWith('en'));
  const usable = (eng.length ? eng : streams).filter((s) => !s.forced);
  const pool = usable.length ? usable : (eng.length ? eng : streams);
  return pool.find((s) => TEXT.has(s.codec)) || pool.find((s) => IMAGE.has(s.codec)) || null;
}

const summary = { text: 0, image: 0, none: 0, written: 0, skipped: 0, sup: 0, vobsub: 0, failed: 0 };
const needOcr = [];
for (const video of videos) {
  const info = JSON.parse(execFileSync(ffprobe,
    ['-v', 'error', '-print_format', 'json', '-show_streams', video],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }));
  const streams = (info.streams || [])
    .filter((s) => s.codec_type === 'subtitle')
    .map((s, i) => ({
      order: i,
      codec: s.codec_name,
      lang: (s.tags || {}).language || '',
      title: (s.tags || {}).title || '',
      forced: !!(s.disposition || {}).forced,
    }));
  const rel = path.relative(root, video);
  const chosen = pick(streams);
  if (!chosen) {
    summary.none += 1;
    console.log(`  no subtitles   ${rel}`);
    continue;
  }
  const srt = video.replace(/\.[^.]+$/, '.srt');
  if (TEXT.has(chosen.codec)) {
    summary.text += 1;
    if (!write) continue;
    if (fs.existsSync(srt)) { summary.skipped += 1; continue; }
    execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', video,
      '-map', `0:s:${chosen.order}`, '-c:s', 'srt', srt]);
    summary.written += 1;
    console.log(`  wrote          ${path.basename(srt)}`);
  } else {
    summary.image += 1;
    needOcr.push(rel);
    // Pulling the subtitle stream out first matters: Subtitle Edit otherwise
    // reads the whole video to reach it, which on a 1.6GB Blu-ray rip is the
    // difference between seconds and many minutes per episode.
    if (dumpSup) {
      if (chosen.codec === 'dvd_subtitle') {
        // VobSub is an .idx/.sub pair and ffmpeg has no muxer for it. These
        // come off DVDs and the files are small, so let the OCR read the mkv.
        summary.vobsub += 1;
      } else {
        const out = video.replace(/\.[^.]+$/, '.sup');
        if (!fs.existsSync(out)) {
          try {
            execFileSync(ffmpeg, ['-v', 'error', '-y', '-i', video,
              '-map', `0:s:${chosen.order}`, '-c:s', 'copy', out]);
            summary.sup += 1;
          } catch (err) {
            summary.failed += 1;
            console.log(`  could not dump ${path.basename(video)}: ${String(err.message).split('\n')[0]}`);
          }
        }
      }
    }
  }
}

console.log(`\n  ${videos.length} videos: ${summary.text} with text subtitles, ` +
  `${summary.image} with image subtitles, ${summary.none} with none`);
if (write) console.log(`  wrote ${summary.written} srt, skipped ${summary.skipped} that already existed`);
if (dumpSup) console.log(`  dumped ${summary.sup} sup files` + (summary.vobsub ? `, left ${summary.vobsub} VobSub inside their mkv` : '') + (summary.failed ? `, ${summary.failed} failed` : ''));
if (needOcr.length) {
  console.log(`\n  ${needOcr.length} need OCR. Subtitle Edit reads PGS and VobSub straight out of an mkv;`);
  console.log('  its command line tool is seconv, and nOCR needs no Tesseract install:');
  console.log(`    seconv "${path.join(root, '**', '*.mkv')}" subrip --ocr-engine:nocr --ocr-db:Latin.nocr`);
  console.log('  then: strip-sdh, polish, lint.');
}
