// Read what is actually in the bucket, without downloading it.
//
// An MP4 keeps its structure in a `moov` box: track dimensions, codec, sample
// rate, duration. That box is a few hundred KB at most, so a range request for
// the head of the file (or the tail, if the file was never prepared for
// streaming) is enough to report on a 1.5GB episode. Nothing here decodes a
// frame; it reads the container's own description of itself.
//
//   node scripts/probe-media.js new-who            all of a series
//   node scripts/probe-media.js new-who 1 2 3      only those seasons
//
// Where the moov box sits matters as much as what is in it. A player cannot
// start until it has read moov, so a file with moov at the end costs a second
// round trip to the far end of the file before the first frame.

const { series } = require('../lib/series');
const { episodesFor } = require('../lib/catalog');

// Vercel's functions cannot reach the CDN hostname, and neither can this while
// Cloudflare is in front of the bucket; B2's own host answers range requests.
const CDN = 'https://cdn.nubblyn.com/file/whoniverse/';
const ORIGIN = 'https://f003.backblazeb2.com/file/whoniverse/';

const HEAD_BYTES = 1024 * 1024; // enough for moov on every file seen so far
const CONCURRENCY = 8;

/** Walk the boxes in `buf` at `start`, calling back for each one found. */
function boxes(buf, start, end, fn) {
  let p = start;
  while (p + 8 <= end) {
    let size = buf.readUInt32BE(p);
    const type = buf.toString('latin1', p + 4, p + 8);
    let header = 8;
    if (size === 1) {
      if (p + 16 > end) break;
      size = Number(buf.readBigUInt64BE(p + 8));
      header = 16;
    } else if (size === 0) {
      size = end - p; // to end of file
    }
    if (size < header || p + size > end) {
      fn(type, p + header, Math.min(p + size, end), true);
      break;
    }
    fn(type, p + header, p + size, false);
    p += size;
  }
}

/** Depth-first search for one box type, returning [start, end] of its payload. */
function find(buf, start, end, path) {
  let hit = null;
  boxes(buf, start, end, (type, s, e) => {
    if (hit) return;
    if (type !== path[0]) return;
    if (path.length === 1) hit = [s, e];
    else hit = find(buf, s, e, path.slice(1));
  });
  return hit;
}

function each(buf, start, end, type, fn) {
  boxes(buf, start, end, (t, s, e) => { if (t === type) fn(s, e); });
}

const CODECS = {
  avc1: 'H.264', avc3: 'H.264', hev1: 'HEVC', hvc1: 'HEVC', av01: 'AV1',
  mp4a: 'AAC', 'ec-3': 'E-AC-3', 'ac-3': 'AC-3', Opus: 'Opus', alac: 'ALAC',
};

const H264_PROFILE = { 66: 'Baseline', 77: 'Main', 88: 'Extended', 100: 'High', 110: 'High 10', 122: 'High 4:2:2' };
const HEVC_PROFILE = { 1: 'Main', 2: 'Main 10', 3: 'Main Still', 4: 'Rext' };

function parseMoov(buf, s, e) {
  const out = { video: null, audio: null, duration: 0 };

  const mvhd = find(buf, s, e, ['mvhd']);
  if (mvhd) {
    const [ms] = mvhd;
    const version = buf[ms];
    if (version === 1) {
      out.duration = Number(buf.readBigUInt64BE(ms + 20)) / buf.readUInt32BE(ms + 16);
    } else {
      out.duration = buf.readUInt32BE(ms + 16) / buf.readUInt32BE(ms + 12);
    }
  }

  each(buf, s, e, 'trak', (ts, te) => {
    const stsd = find(buf, ts, te, ['mdia', 'minf', 'stbl', 'stsd']);
    if (!stsd) return;
    // stsd: 1 byte version, 3 flags, 4 entry count, then sample entries.
    boxes(buf, stsd[0] + 8, stsd[1], (type, es, ee) => {
      const name = CODECS[type] || type;
      if (type === 'avc1' || type === 'avc3' || type === 'hev1' || type === 'hvc1' || type === 'av01') {
        // Visual sample entry: 6 reserved, 2 data ref, 16 pre-defined,
        // then width and height as 16-bit each.
        const width = buf.readUInt16BE(es + 24);
        const height = buf.readUInt16BE(es + 26);
        let detail = '';
        let depth = 8;
        const avcC = find(buf, es + 78, ee, ['avcC']);
        const hvcC = find(buf, es + 78, ee, ['hvcC']);
        if (avcC) {
          const [as] = avcC;
          const profile = H264_PROFILE[buf[as + 1]] || `profile ${buf[as + 1]}`;
          detail = `${profile} @ L${(buf[as + 3] / 10).toFixed(1)}`;
        } else if (hvcC) {
          // ISO/IEC 14496-15: profile_idc is the low five bits of byte 1, the
          // level is byte 12 in units of 1/30, and the luma bit depth is the
          // low three bits of byte 17, plus eight.
          const [hs] = hvcC;
          depth = 8 + (buf[hs + 17] & 0x07);
          detail = `${HEVC_PROFILE[buf[hs + 1] & 0x1f] || `profile ${buf[hs + 1] & 0x1f}`} @ L${(buf[hs + 12] / 30).toFixed(1)}`;
        }
        out.video = { codec: name, tag: type, width, height, detail, depth };
      } else if (!out.audio && (CODECS[type] || type === 'mp4a')) {
        // Audio sample entry: 8 reserved, 2 channel count, 2 sample size,
        // 4 pre-defined/reserved, 4 sample rate as 16.16 fixed point.
        const channels = buf.readUInt16BE(es + 16);
        const rate = buf.readUInt32BE(es + 24) >>> 16;
        out.audio = { codec: name, channels, rate };
      }
    });
  });

  return out;
}

/**
 * Follow the top-level box chain to wherever moov begins, reading only the
 * 16-byte header of each box on the way. Returns its offset and size.
 */
async function locate(url, fileSize) {
  let at = 0;
  for (let hop = 0; hop < 16 && at + 8 < fileSize; hop += 1) {
    const head = await range(url, at, Math.min(at + 15, fileSize - 1));
    if (head.length < 8) return null;
    let size = head.readUInt32BE(0);
    const type = head.toString('latin1', 4, 8);
    if (size === 1) {
      if (head.length < 16) return null;
      size = Number(head.readBigUInt64BE(8));
    } else if (size === 0) {
      size = fileSize - at;
    }
    if (size < 8) return null;
    if (type === 'moov') return { start: at, size };
    at += size;
  }
  return null;
}

/**
 * Locate a moov box inside a buffer that starts mid-file. Every occurrence of
 * the four letters is checked against the size field that must precede it, so
 * the same bytes appearing inside the media do not match.
 */
function scan(buf) {
  let i = 4;
  for (;;) {
    i = buf.indexOf('moov', i, 'latin1');
    if (i < 0) return null;
    const size = buf.readUInt32BE(i - 4);
    if (size === 1 && i + 12 <= buf.length) {
      const big = Number(buf.readBigUInt64BE(i + 4));
      if (big >= 16 && i - 4 + big <= buf.length) return [i + 12, i - 4 + big];
    } else if (size >= 8 && i - 4 + size <= buf.length) {
      return [i + 4, i - 4 + size];
    }
    i += 4;
  }
}

async function range(url, from, to) {
  const res = await fetch(url, { headers: { Range: `bytes=${from}-${to}` } });
  if (!res.ok && res.status !== 206) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function probe(url) {
  const head = await fetch(url, { method: 'HEAD' });
  if (!head.ok) throw new Error(`HTTP ${head.status}`);
  const size = Number(head.headers.get('content-length') || 0);

  // Try the front of the file first: that is where a streamable MP4 keeps moov.
  let buf = await range(url, 0, Math.min(HEAD_BYTES, size) - 1);
  let at = find(buf, 0, buf.length, ['moov']);
  let faststart = true;

  if (!at) {
    // Not at the front, so the file opens with mdat and keeps moov behind it.
    // Rather than guess at a tail size, follow the top-level box sizes to where
    // moov actually starts and read exactly that box: on a 1.5GB episode it is
    // the difference between a 4MB read and a 2MB one, times however many
    // episodes are being checked.
    faststart = false;
    const found = await locate(url, size);
    if (found) {
      buf = await range(url, found.start, found.start + found.size - 1);
      at = find(buf, 0, buf.length, ['moov']);
    }
    if (!at) {
      // The chain did not lead anywhere: fall back to scanning the tail.
      for (const tail of [4, 16, 64]) {
        buf = await range(url, size - Math.min(tail * 1024 * 1024, size), size - 1);
        at = scan(buf);
        if (at) break;
      }
    }
    if (!at) throw new Error('no moov box at the front, behind mdat, or in the last 64MB');
  }

  const info = parseMoov(buf, at[0], at[1]);
  info.size = size;
  info.faststart = faststart;
  info.bitrate = info.duration ? (size * 8) / info.duration : 0;
  return info;
}

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length) {
      const k = i++;
      try { out[k] = await fn(items[k]); } catch (err) { out[k] = { error: err.message }; }
    }
  }));
  return out;
}

const mins = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
const mb = (b) => `${(b / 1024 / 1024).toFixed(0)}MB`;
const mbps = (b) => `${(b / 1e6).toFixed(2)}`;

(async () => {
  const key = process.argv[2] || 'new-who';
  const only = process.argv.slice(3).map(Number);
  const entry = series.find((s) => s.key === key);
  if (!entry) throw new Error(`unknown series: ${key}`);

  let eps = episodesFor(entry).filter((e) => e.streamUrl);
  if (only.length) eps = eps.filter((e) => only.includes(e.season));
  if (!eps.length) throw new Error('nothing with a streamUrl');

  console.error(`probing ${eps.length} files…`);
  const results = await pool(eps, CONCURRENCY, async (e) => {
    try {
      return { e, info: await probe(e.streamUrl.replace(CDN, ORIGIN)) };
    } catch (err) {
      return { e, info: { error: err.message } };
    }
  });

  const rows = [];
  for (const r of results) {
    const { e } = r;
    const id = `S${String(e.season).padStart(2, '0')}E${String(e.episode).padStart(2, '0')}`;
    if (r.info.error) { rows.push({ id, title: e.title, error: r.info.error }); continue; }
    const i = r.info;
    rows.push({
      id,
      title: e.title,
      season: e.season,
      w: i.video && i.video.width,
      h: i.video && i.video.height,
      vcodec: i.video ? i.video.codec : '?',
      tag: i.video ? i.video.tag : '',
      depth: i.video ? i.video.depth : 0,
      profile: i.video ? i.video.detail : '',
      acodec: i.audio ? i.audio.codec : '?',
      channels: i.audio ? i.audio.channels : 0,
      rate: i.audio ? i.audio.rate : 0,
      seconds: i.duration,
      size: i.size,
      bitrate: i.bitrate,
      faststart: i.faststart,
    });
  }

  require('node:fs').writeFileSync(
    require('node:path').join(__dirname, '..', 'data', 'media-probe.json'),
    `${JSON.stringify(rows, null, 1)}\n`,
  );

  for (const r of rows) {
    if (r.error) { console.log(`${r.id}  ERROR  ${r.error}  ${r.title}`); continue; }
    console.log(
      `${r.id}  ${String(r.w + 'x' + r.h).padEnd(10)} ${r.vcodec.padEnd(5)} ${String(r.tag).padEnd(5)} ${String(r.depth + 'bit').padEnd(6)} ${r.profile.padEnd(15)} ` +
      `${r.acodec.padEnd(7)} ${r.channels}ch ${String(r.rate).padEnd(6)} ` +
      `${mins(r.seconds).padStart(6)} ${mb(r.size).padStart(7)} ${mbps(r.bitrate).padStart(6)}Mbps ` +
      `${r.faststart ? '' : 'moov-at-end'}  ${r.title}`,
    );
  }
  console.error(`\nwrote data/media-probe.json`);
})().catch((e) => { console.error(e.message); process.exit(1); });
