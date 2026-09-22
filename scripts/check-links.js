// Is every URL the addon serves still reachable?
//
// Requests one byte of each — video, subtitles, thumbnail — following any
// redirect, so a 200 or 206 means the file is there and serving. Prints only
// the failures, then a count per series.
//
//   node scripts/check-links.js                 every series
//   node scripts/check-links.js classic-who     one, by its key in lib/series.js
//
// It used to read data/new-who.js and nothing else, while its output named no
// series, so a Classic Who season could be uploaded, "checked", and reported
// as 547 of 547 reachable when not one of its files had been looked at. Every
// series is checked now, and each URL once: the Complete Chronology reuses the
// other series' files, so it adds no URLs of its own.
//
// A failure is tried a second time before it counts. Against Cloudflare and
// B2, at eight requests at once, a handful of requests on a full run come back
// empty or 502 and answer normally a moment later, and a checker that reports
// those sends someone chasing a file that is fine.

const path = require('node:path');
const { series } = require('../lib/series');

const only = process.argv[2];
const picked = series.filter((s) => !only || s.key === only);
if (only && !picked.length) {
  console.error(`no series with key "${only}"; keys: ${series.map((s) => s.key).join(', ')}`);
  process.exit(2);
}

const seen = new Set();
const urls = [];
for (const s of picked) {
  const d = require(path.join('..', 'data', s.data));
  const episodes = Array.isArray(d) ? d : d.episodes;
  for (const e of episodes) {
    for (const k of ['url', 'streamUrl', 'subtitleUrl', 'thumbnail']) {
      if (!e[k] || seen.has(e[k])) continue;
      seen.add(e[k]);
      urls.push({ url: e[k], series: s.key, ep: `${e.season}x${String(e.episode).padStart(2, '0')}`, kind: k });
    }
  }
}

// Four at once, not eight. The first all-series run, 2,400 URLs at eight at a
// time, had Cloudflare answer "429 Too Many Requests" for dozens of files that
// were perfectly fine. A 429 is the CDN saying slow down, never a verdict on
// the file, so it is waited out and asked again rather than reported.
const CONCURRENCY = 4;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function probe(item) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      const res = await fetch(item.url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        redirect: 'follow',
        signal: AbortSignal.timeout(30000),
      });
      // Drain nothing — we asked for one byte. Cancel the body.
      await res.body?.cancel();
      if (res.status === 429) {
        const after = Number(res.headers.get('retry-after')) || 2 ** attempt;
        await sleep(Math.min(after, 30) * 1000);
        continue;
      }
      return res.status === 200 || res.status === 206 ? null : res.status;
    } catch (err) {
      return err.name === 'TimeoutError' ? 'timeout' : err.message;
    }
  }
  return 'rate-limited';
}

async function run(items) {
  const failed = [];
  const queue = [...items];
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const item = queue.shift();
      const status = await probe(item);
      if (status !== null) failed.push({ ...item, status });
    }
  }));
  return failed;
}

async function main() {
  const started = Date.now();
  const first = await run(urls);
  await new Promise((r) => setTimeout(r, 3000));
  const bad = first.length ? await run(first) : [];

  const count = (xs, key) => xs.reduce((a, x) => ((a[x[key]] = (a[x[key]] || 0) + 1), a), {});
  const bySeries = count(urls, 'series');
  const badBySeries = count(bad, 'series');
  console.log(`checked ${urls.length} urls in ${((Date.now() - started) / 1000).toFixed(0)}s  ` +
    `(${Object.entries(count(urls, 'kind')).map(([k, n]) => `${k}:${n}`).join(' ')})`);
  for (const [s, n] of Object.entries(bySeries)) {
    console.log(`  ${s.padEnd(20)} ${String(n).padStart(5)} urls  ${badBySeries[s] ? `${badBySeries[s]} FAILED` : 'all reachable'}`);
  }
  console.log(`reachable ${urls.length - bad.length}   failed ${bad.length}` +
    (first.length ? `   (${first.length - bad.length} answered on the retry)` : ''));
  if (bad.length) {
    console.log('\nFAILED:');
    for (const b of bad) console.log(`  ${b.series} ${b.ep}  ${b.kind.padEnd(11)} ${String(b.status).padEnd(8)} ${b.url}`);
    process.exitCode = 1;
  }
}

main();
