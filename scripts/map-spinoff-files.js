// Match the spin-off video files on disk to the episodes in data/, and say
// where each one belongs on the CDN.
//
//   node scripts/map-spinoff-files.js            print the plan
//   node scripts/map-spinoff-files.js --json     write scratch/spinoff-map.json
//
// Nothing is copied, renamed or uploaded here. The point is to find the
// mismatches before 109 GB moves anywhere: an episode with no file, a file with
// no episode, or two episodes claiming the same file.
//
// The naming follows New Who, the only series already playable:
//   <series>/S01/E01_rose.mp4
// The spin-offs keep .mkv, because MP4 carries neither PGS nor VobSub and the
// disc subtitles are worth more than Stremio Web is.
//
// This one reads the local content folder and will not run without it. That is
// fine: it is only used to port a new series in, when the files are on the disk
// by definition. Once a series is in the bucket the copies here are deleted,
// and everything that runs afterwards asks the bucket instead.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CONTENT = 'C:/Users/hello/Downloads/content';
const CDN = 'https://cdn.nubblyn.com/file/whoniverse';

// data file -> the folder under content/ and the key used in CDN paths
const SERIES = [
  { data: 'torchwood', folder: 'torchwood', key: 'torchwood' },
  { data: 'sarah-jane', folder: 'the_sarah_jane_adventures', key: 'sarah-jane' },
  { data: 'class', folder: 'class', key: 'class' },
  { data: 'land-and-sea', folder: 'the_war_between_the_land_and_the_sea', key: 'land-and-sea' },
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const pad = (n) => String(n).padStart(2, '0');

/** S01_E02_day_one.mkv -> {season:1, episode:2} */
function fromName(base) {
  const m = /^S(\d+)_E(\d+)_/i.exec(base);
  return m ? { season: +m[1], episode: +m[2] } : null;
}

let totalMatched = 0, totalMissing = 0, totalOrphan = 0;
const plan = [];

for (const s of SERIES) {
  const episodes = require(path.join(ROOT, 'data', `${s.data}.js`));
  const files = walk(path.join(CONTENT, s.folder));
  const byKey = new Map();
  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (!['.mkv', '.mp4', '.m4v'].includes(ext)) continue;
    const base = path.basename(f, ext);
    const k = fromName(base);
    if (!k) continue;
    const id = `${k.season}x${k.episode}`;
    if (!byKey.has(id)) byKey.set(id, []);
    byKey.get(id).push(f);
  }

  const used = new Set();
  const rows = [];
  for (const ep of episodes) {
    const id = `${ep.season}x${ep.episode}`;
    const hits = byKey.get(id) || [];
    // Prefer the mkv: it is the one carrying the disc subtitles.
    const file = hits.find((h) => h.toLowerCase().endsWith('.mkv')) || hits[0];
    if (!file) {
      rows.push({ id, title: ep.title, file: null });
      continue;
    }
    used.add(id);
    const ext = path.extname(file).toLowerCase();
    const slug = path.basename(file, ext).replace(/^S\d+_E\d+_/i, '');
    rows.push({
      id,
      title: ep.title,
      file,
      dest: `${s.key}/S${pad(ep.season)}/E${pad(ep.episode)}_${slug}${ext}`,
      sizeGB: +(fs.statSync(file).size / 1073741824).toFixed(2),
    });
  }

  const orphans = [...byKey.keys()].filter((k) => !used.has(k));
  const matched = rows.filter((r) => r.file);
  const missing = rows.filter((r) => !r.file);
  totalMatched += matched.length;
  totalMissing += missing.length;
  totalOrphan += orphans.length;

  const gb = matched.reduce((a, r) => a + r.sizeGB, 0);
  console.log(`\n=== ${s.key} ===`);
  console.log(`  episodes in data : ${episodes.length}`);
  console.log(`  matched to a file: ${matched.length}  (${gb.toFixed(1)} GB)`);
  console.log(`  no file          : ${missing.length}`);
  console.log(`  file, no episode : ${orphans.length}`);
  if (missing.length) {
    console.log('  --- episodes with no file ---');
    for (const m of missing) console.log(`      ${m.id.padEnd(7)} ${m.title}`);
  }
  if (orphans.length) {
    console.log('  --- files with no episode ---');
    for (const o of orphans) console.log(`      ${o.padEnd(7)} ${byKey.get(o).map((f) => path.basename(f)).join(', ')}`);
  }
  plan.push({ series: s.key, rows: matched });
}

console.log(`\nmatched ${totalMatched}, missing ${totalMissing}, orphaned ${totalOrphan}`);
const gb = plan.reduce((a, p) => a + p.rows.reduce((b, r) => b + r.sizeGB, 0), 0);
console.log(`total to upload: ${gb.toFixed(1)} GB`);
console.log(`\nexample: ${plan[0].rows[0].dest}\n  -> ${CDN}/${plan[0].rows[0].dest}`);

if (process.argv.includes('--json')) {
  const out = path.join(ROOT, 'scratch');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'spinoff-map.json'), JSON.stringify(plan, null, 1));
  console.log(`\nwrote scratch/spinoff-map.json`);
}
