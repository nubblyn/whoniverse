// Which episodes actually have subtitles, asked of the files themselves.
//
//   node scripts/probe-subtitles.js              every series in the bucket
//   node scripts/probe-subtitles.js torchwood    one series
//
// Writes data/subtitles.json.
//
// The ledger used to answer this by looking for a sidecar .srt next to the
// video, and reported "subtitles 0/42" for Torchwood, Class, Sarah Jane, Land
// and Sea and the TV Movie. Those series are not missing subtitles: they carry
// them inside the video as a PGS track, which is what the Blu-rays ship. The
// count was measuring the wrong thing.
//
// ffprobe reads a container's stream list over a range request, so a 1.5GB
// episode costs a second or two and a few hundred KB. Nothing is downloaded.
//
// Note the host: Cloudflare refuses tools and Vercel alike, so this reads B2's own
// origin.

const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');


const ORIGIN = process.env.WHONIVERSE_B2_ORIGIN
  || 'https://f003.backblazeb2.com/file/whoniverse';
const OUT = path.join(__dirname, '..', 'data', 'subtitles.json');
const INDEX = path.join(__dirname, '..', 'ledger', 'out', 'bucket-index.txt');
const CONCURRENCY = 8;

function ffprobe(url) {
  return new Promise((resolve) => {
    execFile('ffprobe', [
      '-v', 'error',
      '-select_streams', 's',
      '-show_entries', 'stream=codec_name:stream_tags=language',
      '-of', 'csv=p=0',
      url,
    ], { timeout: 45000, maxBuffer: 1 << 20 }, (err, stdout) => {
      if (err) return resolve(null);          // null = could not tell
      const rows = stdout.split('\n').map((s) => s.trim()).filter(Boolean);
      resolve(rows.map((r) => {
        const [codec, lang] = r.split(',');
        return { codec, lang: lang || null };
      }));
    });
  });
}

async function main() {
  if (!fs.existsSync(INDEX)) {
    console.error('no bucket index — run scripts/bucket-index.sh first');
    process.exit(1);
  }
  const inBucket = new Set(
    fs.readFileSync(INDEX, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean),
  );

  // Filter by bucket folder name, which is what the paths carry. The series
  // registry keeps its folder map private, and the bucket is the thing being
  // described here anyway.
  const only = process.argv.slice(2);
  const videos = [...inBucket].filter((p) => {
    if (!/\.(mp4|mkv|m4v)$/i.test(p)) return false;
    return !only.length || only.includes(p.split('/')[0]);
  }).sort();

  console.log(`probing ${videos.length} files`);
  const out = {};
  let done = 0;

  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    for (;;) {
      const p = videos.pop();
      if (!p) return;
      const stem = p.replace(/\.[^.]+$/, '');
      const streams = await ffprobe(`${ORIGIN}/${encodeURI(p)}`);
      out[stem] = {
        // A sidecar file and an embedded track both count as "has subtitles";
        // they are different delivery, not different presence.
        sidecar: inBucket.has(`${stem}.srt`),
        embedded: streams ? streams.length : null,
        codecs: streams ? [...new Set(streams.map((s) => s.codec))] : null,
      };
      done += 1;
      if (done % 25 === 0) console.log(`  ${done}/${videos.length + done - videos.length}`);
    }
  }));

  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
  const merged = { ...prev, ...out };
  fs.writeFileSync(OUT, JSON.stringify(merged, null, 1));

  const withSubs = Object.values(merged).filter((v) => v.sidecar || v.embedded > 0).length;
  const unknown = Object.values(merged).filter((v) => v.embedded === null && !v.sidecar).length;
  console.log(`wrote ${path.relative(path.join(__dirname, '..'), OUT)}`);
  console.log(`  ${Object.keys(merged).length} episodes, ${withSubs} with subtitles, ${unknown} could not be read`);
}

main().catch((e) => { console.error(e); process.exit(1); });
