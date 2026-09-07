// Is every URL in the New Who data still reachable?
//
// Requests one byte of each — video, subtitles, thumbnail — following
// archive.org's redirect to its datanode, so a 200 or 206 means the file is
// there and serving. Prints only the failures, then a count.
//
//   node scripts/check-links.js

const episodes = require('../data/new-who.js');

const urls = [];
for (const e of episodes) {
  for (const k of ['url', 'streamUrl', 'subtitleUrl', 'thumbnail']) {
    if (e[k]) urls.push({ url: e[k], ep: `${e.season}x${String(e.episode).padStart(2, '0')}`, kind: k });
  }
}

const CONCURRENCY = 8;
const ok = [];
const bad = [];

async function probe(item) {
  try {
    const res = await fetch(item.url, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
      redirect: 'follow',
      signal: AbortSignal.timeout(30000),
    });
    // Drain nothing — we asked for one byte. Cancel the body.
    await res.body?.cancel();
    if (res.status === 200 || res.status === 206) ok.push(item);
    else bad.push({ ...item, status: res.status });
  } catch (err) {
    bad.push({ ...item, status: err.name === 'TimeoutError' ? 'timeout' : err.message });
  }
}

async function main() {
  const queue = [...urls];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await probe(queue.shift());
  });
  const started = Date.now();
  await Promise.all(workers);

  const byKind = {};
  for (const u of urls) byKind[u.kind] = (byKind[u.kind] || 0) + 1;

  console.log(`checked ${urls.length} urls in ${((Date.now() - started) / 1000).toFixed(0)}s  ` +
    `(${Object.entries(byKind).map(([k, n]) => `${k}:${n}`).join(' ')})`);
  console.log(`reachable ${ok.length}   failed ${bad.length}`);
  if (bad.length) {
    console.log('\nFAILED:');
    for (const b of bad) console.log(`  ${b.ep}  ${b.kind.padEnd(11)} ${String(b.status).padEnd(8)} ${b.url}`);
    process.exitCode = 1;
  }
}

main();
