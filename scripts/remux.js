// Turn the downloaded MKVs into the MP4s the addon serves.
//
//   node scripts/remux.js <folder> [<folder>...]           dry run, prints the plan
//   node scripts/remux.js <folder> --write                 do it
//   node scripts/remux.js <folder> --write --out <dir>     write somewhere else
//   node scripts/remux.js <folder> --write --replace       delete each source once its MP4 verifies
//
// A folder or a single .mkv, as many as you like.
//
// This is a container swap, not a re-encode. The HEVC picture is copied byte
// for byte and so is the audio, unless the audio is Dolby: browsers cannot
// decode AC-3 or E-AC-3, so `lib/streams.js` would have to mark those streams
// not web-ready. Cheaper to encode five episodes of Land and Sea to AAC than to
// lose the web player for a whole series.
//
// Three things go in the bin. Embedded subtitles, because MP4 holds neither PGS
// nor VobSub and we serve our own .srt beside the file anyway. Data streams,
// because without `-dn` ffmpeg smuggles the PGS back in as `bin_data`. Chapters,
// because ffmpeg writes them into MP4 as a text track that clients then offer as
// a subtitle.
//
// Everything else stays, commentary tracks included. MP4 carries as many audio
// tracks as MKV does; the only difference is that the label rides in
// `handler_name` rather than `title`, so that is where this puts it.
//
// An output that already exists is checked rather than trusted, and skipped
// only if it passes, so the run is resumable and a half-written file from an
// interrupted run is redone. The source MKVs are left alone unless `--replace`
// is given, and then only one at a time, after that file's MP4 has passed.
//
// ffmpeg is not on PATH on this machine; Stremio ships a copy and we use that.
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

// What a browser can decode. Anything else in an audio track gets re-encoded to
// AAC. Kept in step with `hasBrowserAudio` in lib/streams.js.
const BROWSER_AUDIO = new Set(['aac', 'mp3']);

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

const args = process.argv.slice(2);
const write = args.includes('--write');
const replace = args.includes('--replace');
const outFlag = args.indexOf('--out');
const outRoot = outFlag === -1 ? null : args[outFlag + 1];
const roots = args.filter((a, i) => !a.startsWith('--') && !(outFlag !== -1 && i === outFlag + 1));

if (!roots.length) {
  console.error('usage: node scripts/remux.js <folder> [...] [--write] [--out <dir>]');
  process.exit(1);
}
for (const r of roots) {
  if (!fs.existsSync(r)) {
    console.error(`no such folder: ${r}`);
    process.exit(1);
  }
}

const ffprobe = tool('ffprobe');
const ffmpeg = tool('ffmpeg');

function probe(file) {
  const out = execFileSync(ffprobe, [
    '-v', 'error',
    '-show_entries', 'format=duration:stream=index,codec_type,codec_name,channels,width,height:stream_tags=title,language:stream_disposition=default',
    '-of', 'json', file,
  ], { encoding: 'utf8', maxBuffer: 1 << 24 });
  const j = JSON.parse(out);
  return {
    duration: Number(j.format.duration),
    video: j.streams.filter((s) => s.codec_type === 'video'),
    audio: j.streams.filter((s) => s.codec_type === 'audio'),
  };
}

// A track named "Commentary with ..." must never be the one that plays by
// default, and its name is worth keeping. Everything else gets a label built
// from its channel count, because most sources leave the title empty and
// "Track 2" tells a viewer nothing.
function isCommentary(s) {
  return /commentary|isolated score|audio description/i.test((s.tags && s.tags.title) || '');
}

function label(s) {
  const given = (s.tags && s.tags.title || '').trim();
  if (given) return given;
  const lang = (s.tags && s.tags.language || 'eng').toLowerCase();
  const name = lang === 'eng' ? 'English' : lang;
  const layout = { 1: 'mono', 2: '2.0', 6: '5.1', 8: '7.1' }[s.channels] || `${s.channels}ch`;
  return `${name} ${layout}`;
}

// Main audio first, then commentary, then whatever is left. Within each group
// the fuller mix wins, so a 5.1 track never ends up behind its own downmix.
function orderAudio(streams) {
  return streams.slice().sort((a, b) => {
    const ca = isCommentary(a) ? 1 : 0;
    const cb = isCommentary(b) ? 1 : 0;
    if (ca !== cb) return ca - cb;
    if (a.channels !== b.channels) return (b.channels || 0) - (a.channels || 0);
    return a.index - b.index;
  });
}

function bitrate(channels) {
  if (channels >= 8) return '512k';
  if (channels >= 6) return '384k';
  return '192k';
}

function plan(src, dest) {
  const info = probe(src);
  if (!info.video.length) throw new Error('no video stream');
  if (!info.audio.length) throw new Error('no audio stream');
  const v = info.video[0];
  const audio = orderAudio(info.audio);

  const a = ['-v', 'error', '-y', '-i', src, '-map', `0:${v.index}`];
  for (const s of audio) a.push('-map', `0:${s.index}`);
  a.push('-c:v', 'copy');
  // MP4 wants `hvc1` where MKV writes `hev1`. Without the swap Apple's decoders
  // and anything built on them refuse the file.
  if (v.codec_name === 'hevc') a.push('-tag:v', 'hvc1');

  const encoded = [];
  audio.forEach((s, i) => {
    if (BROWSER_AUDIO.has(s.codec_name)) {
      a.push(`-c:a:${i}`, 'copy');
    } else {
      a.push(`-c:a:${i}`, 'aac', `-b:a:${i}`, bitrate(s.channels), `-ac:a:${i}`, String(s.channels));
      encoded.push(`${s.codec_name}→aac`);
    }
  });

  a.push('-sn', '-dn', '-map_chapters', '-1');
  audio.forEach((s, i) => {
    a.push(`-metadata:s:a:${i}`, `handler_name=${label(s)}`);
    a.push(`-disposition:a:${i}`, i === 0 ? 'default' : '0');
  });
  a.push('-movflags', '+faststart', dest);

  return {
    args: a,
    info,
    audio,
    encoded,
    note: [
      `${v.codec_name} ${v.width}x${v.height}`,
      ...audio.map((s, i) => `${i === 0 ? '*' : ' '}${label(s)} (${s.codec_name})`),
      ...(encoded.length ? [`re-encode: ${encoded.join(', ')}`] : []),
    ].join(' | '),
  };
}

// `+faststart` moves the index in front of the media so playback can begin on
// the first bytes. Worth confirming rather than trusting: an interrupted second
// pass leaves a file that plays locally and stalls over HTTP.
function moovIsFirst(file) {
  const fd = fs.openSync(file, 'r');
  const buf = Buffer.alloc(64 * 1024);
  const n = fs.readSync(fd, buf, 0, buf.length, 0);
  fs.closeSync(fd);
  const head = buf.subarray(0, n);
  const moov = head.indexOf('moov');
  const mdat = head.indexOf('mdat');
  return moov !== -1 && (mdat === -1 || moov < mdat);
}

// A truncated MP4 written with `+faststart` still reports the full duration,
// because the index it lies with was written before the media was cut short.
// The only honest question is whether the last few seconds actually decode.
// `-sseof` belongs to ffmpeg, not ffprobe, so this decodes the tail rather than
// asking about it, and it counts the pixels that come out. Asking ffmpeg to
// decode and discard is not enough: on a truncated file it seeks past the end,
// produces nothing, and exits 0 without a word. Three seconds scaled to 32x32,
// so it costs a seek and little else.
function tailReads(file) {
  const r = spawnSync(ffmpeg, [
    '-v', 'error', '-sseof', '-3', '-i', file, '-map', '0:v:0',
    '-vf', 'scale=32:32', '-pix_fmt', 'gray', '-f', 'rawvideo', '-',
  ], { maxBuffer: 1 << 24 });
  return r.status === 0 && r.stdout && r.stdout.length > 0;
}

function verify(src, dest, want) {
  let got;
  try {
    got = probe(dest);
  } catch (e) {
    return [`unreadable: ${e.message.trim().split('\n').pop()}`];
  }
  const problems = [];
  const srcSize = fs.statSync(src).size;
  const destSize = fs.statSync(dest).size;
  // A copied stream lands within a percent or two of its source; the widest
  // real gap is Land and Sea, whose 640k Dolby becomes 384k AAC, at 0.94.
  if (destSize < srcSize * 0.85) problems.push(`${gb(destSize)} from a ${gb(srcSize)} source`);
  if (!tailReads(dest)) problems.push('the last seconds do not decode');
  if (Math.abs(got.duration - want.info.duration) > 1) {
    problems.push(`duration ${got.duration.toFixed(1)}s vs ${want.info.duration.toFixed(1)}s`);
  }
  if (got.video.length !== 1) problems.push(`${got.video.length} video streams`);
  else if (got.video[0].codec_name !== want.info.video[0].codec_name) problems.push('video codec changed');
  if (got.audio.length !== want.audio.length) {
    problems.push(`${got.audio.length} audio tracks, expected ${want.audio.length}`);
  } else {
    got.audio.forEach((s, i) => {
      if (s.channels !== want.audio[i].channels) problems.push(`track ${i} has ${s.channels} channels`);
    });
  }
  if (!moovIsFirst(dest)) problems.push('moov atom is not at the front');
  return problems;
}

const jobs = [];
for (const root of roots) {
  if (fs.statSync(root).isFile()) {
    if (path.extname(root).toLowerCase() !== '.mkv') continue;
    const dest = outRoot
      ? path.join(outRoot, path.basename(root).replace(/\.mkv$/i, '.mp4'))
      : root.replace(/\.mkv$/i, '.mp4');
    jobs.push({ src: root, dest });
    continue;
  }
  (function walk(d) {
    for (const f of fs.readdirSync(d).sort()) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (path.extname(f).toLowerCase() === '.mkv') {
        const dest = outRoot
          ? path.join(outRoot, path.relative(root, p).replace(/\.mkv$/i, '.mp4'))
          : p.replace(/\.mkv$/i, '.mp4');
        jobs.push({ src: p, dest });
      }
    }
  })(root);
}

if (!jobs.length) {
  console.log('no .mkv files found');
  process.exit(0);
}

const totalIn = jobs.reduce((n, j) => n + fs.statSync(j.src).size, 0);
const gb = (n) => `${(n / 1024 ** 3).toFixed(1)} GB`;

// Copying the picture means the MP4s are the size of the MKVs, and both sit on
// disk until the sources are deleted by hand. Say so before, not after.
const target = outRoot || path.dirname(jobs[0].dest);
let free = null;
try {
  const st = fs.statfsSync(target);
  free = st.bsize * st.bavail;
} catch { /* not every filesystem answers */ }

console.log(`${jobs.length} files, ${gb(totalIn)} in`);
if (free !== null) {
  const need = replace ? Math.max(...jobs.map((j) => fs.statSync(j.src).size)) * 2 : totalIn * 1.05;
  const short = free < need;
  console.log(`${gb(free)} free on the target volume, ${gb(need)} needed${short ? '  ** not enough **' : ''}`);
  if (short && write) {
    console.log(replace ? 'stopping.' : 'stopping. run one series at a time, or add --replace.');
    process.exit(1);
  }
}
console.log('');

const results = { done: 0, skipped: 0, replaced: 0, failed: [] };
const started = Date.now();

for (const [n, job] of jobs.entries()) {
  const name = path.basename(job.src);
  let p;
  try {
    p = plan(job.src, job.dest);
  } catch (e) {
    // execFileSync puts the whole command line in `message`; the last line of
    // ffprobe's own complaint is the part worth printing.
    const why = ((e.stderr || '').trim().split('\n').pop() || e.message).replace(/^.*\.mkv: /, '');
    console.log(`${String(n + 1).padStart(3)}/${jobs.length}  ${name}\n     cannot read: ${why}`);
    results.failed.push([name, why]);
    continue;
  }

  if (!write) {
    console.log(`${String(n + 1).padStart(3)}/${jobs.length}  ${name}\n     ${p.note}`);
    continue;
  }

  if (fs.existsSync(job.dest)) {
    const problems = verify(job.src, job.dest, p);
    if (!problems.length) {
      results.skipped += 1;
      console.log(`${String(n + 1).padStart(3)}/${jobs.length}  ${name}  already done`);
      continue;
    }
    console.log(`     redoing, the existing .mp4 is bad: ${problems.join('; ')}`);
  }

  fs.mkdirSync(path.dirname(job.dest), { recursive: true });
  const t = Date.now();
  const r = spawnSync(ffmpeg, p.args, { encoding: 'utf8', maxBuffer: 1 << 24 });
  if (r.status !== 0) {
    const why = (r.stderr || r.error?.message || 'ffmpeg failed').trim().split('\n').slice(-3).join(' ');
    console.log(`${String(n + 1).padStart(3)}/${jobs.length}  ${name}\n     FAILED: ${why}`);
    results.failed.push([name, why]);
    // A half-written file would be skipped as "already done" on the next run.
    if (fs.existsSync(job.dest)) fs.unlinkSync(job.dest);
    continue;
  }

  const problems = verify(job.src, job.dest, p);
  const secs = ((Date.now() - t) / 1000).toFixed(0);
  if (problems.length) {
    console.log(`${String(n + 1).padStart(3)}/${jobs.length}  ${name}\n     BAD: ${problems.join('; ')}`);
    results.failed.push([name, problems.join('; ')]);
    fs.unlinkSync(job.dest);
    continue;
  }
  results.done += 1;
  // The copies are the size of the originals, so on a full disk the run stops
  // halfway. `--replace` deletes each source the moment its MP4 has passed
  // every check above, which keeps the peak at one extra file.
  let freed = '';
  if (replace) {
    fs.unlinkSync(job.src);
    results.replaced += 1;
    freed = '  source deleted';
  }
  const suffix = p.encoded.length ? `  ${p.encoded.join(', ')}` : '';
  console.log(`${String(n + 1).padStart(3)}/${jobs.length}  ${name}  ${secs}s${suffix}${freed}`);
}

console.log('');
if (!write) {
  console.log('dry run. add --write to convert.');
} else {
  const mins = ((Date.now() - started) / 60000).toFixed(1);
  console.log(`${results.done} converted, ${results.skipped} already done, ${results.failed.length} failed, ${mins} min`);
  for (const [name, why] of results.failed) console.log(`  ${name}: ${why}`);
  console.log('');
  console.log(replace
    ? `${results.replaced} .mkv sources deleted after their MP4 verified.`
    : 'the .mkv sources are untouched. delete them yourself once you have watched a few.');
  if (results.failed.length) process.exitCode = 1;
}
