// What was the source of these files? The other probes measure the picture;
// this looks for the fingerprints a source leaves behind.
//
// Three things separate a disc rip from a stream capture without ever seeing a
// frame:
//
//   Frame rate    UK television finishes at 25fps and a Blu-ray of it carries
//                 1080i50 or 1080p25. A US-facing stream is often 23.976.
//   Audio         a disc carries lossless 5.1, which a re-encode turns into
//                 AAC 5.1. A stream carries E-AC-3 or AAC straight through, and
//                 the codec usually survives a remux untouched.
//   Tags          muxers sign their work. ilst `©too`, the handler names and
//                 any title or comment left in udta name the tool, and
//                 sometimes the release.
//
//   node scripts/probe-origin.js new-who 1 5 14

const { series } = require('../lib/series');
const { episodesFor } = require('../lib/catalog');

const CDN = 'https://cdn.nubblyn.com/file/whoniverse/';
const ORIGIN = 'https://f003.backblazeb2.com/file/whoniverse/';

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
    } else if (size === 0) size = end - p;
    if (size < header || p + size > end) break;
    fn(type, p + header, p + size);
    p += size;
  }
}

function find(buf, start, end, path) {
  let hit = null;
  boxes(buf, start, end, (type, s, e) => {
    if (hit || type !== path[0]) return;
    hit = path.length === 1 ? [s, e] : find(buf, s, e, path.slice(1));
  });
  return hit;
}

function each(buf, start, end, type, fn) {
  boxes(buf, start, end, (t, s, e) => { if (t === type) fn(s, e); });
}

async function range(url, from, to) {
  const res = await fetch(url, { headers: { Range: `bytes=${from}-${to}` } });
  if (!res.ok && res.status !== 206) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function moovOf(url) {
  const head = await fetch(url, { method: 'HEAD' });
  const size = Number(head.headers.get('content-length') || 0);
  let at = 0;
  for (let hop = 0; hop < 16 && at + 8 < size; hop += 1) {
    const h = await range(url, at, at + 15);
    let len = h.readUInt32BE(0);
    const type = h.toString('latin1', 4, 8);
    if (len === 1) len = Number(h.readBigUInt64BE(8));
    else if (len === 0) len = size - at;
    if (type === 'moov') return { buf: await range(url, at, at + len - 1), size };
    if (len < 8) break;
    at += len;
  }
  throw new Error('no moov');
}

/** Printable strings inside a box, for tags whose layout varies by muxer. */
function strings(buf, s, e, min = 4) {
  const out = [];
  let run = '';
  for (let i = s; i < e; i += 1) {
    const c = buf[i];
    if (c >= 0x20 && c <= 0x7e) run += String.fromCharCode(c);
    else { if (run.length >= min) out.push(run); run = ''; }
  }
  if (run.length >= min) out.push(run);
  return out;
}

function inspect(buf, fileSize) {
  const moov = find(buf, 0, buf.length, ['moov']) || [0, buf.length];
  const [ms, me] = moov;
  const info = { tags: [], handlers: [], tracks: [] };

  // Muxer signatures and any free-text left behind.
  const udta = find(buf, ms, me, ['udta']);
  if (udta) {
    info.tags = strings(buf, udta[0], udta[1], 5)
      .filter((s) => !/^[)(\-\s]*$/.test(s))
      .slice(0, 12);
  }

  each(buf, ms, me, 'trak', (ts, te) => {
    const hdlr = find(buf, ts, te, ['mdia', 'hdlr']);
    if (hdlr) {
      const name = strings(buf, hdlr[0] + 24, hdlr[1], 3)[0];
      if (name) info.handlers.push(name);
    }

    const mdhd = find(buf, ts, te, ['mdia', 'mdhd']);
    const stsd = find(buf, ts, te, ['mdia', 'minf', 'stbl', 'stsd']);
    const stts = find(buf, ts, te, ['mdia', 'minf', 'stbl', 'stts']);
    if (!mdhd || !stsd) return;

    const version = buf[mdhd[0]];
    const timescale = version === 1 ? buf.readUInt32BE(mdhd[0] + 20) : buf.readUInt32BE(mdhd[0] + 12);
    const duration = version === 1
      ? Number(buf.readBigUInt64BE(mdhd[0] + 24))
      : buf.readUInt32BE(mdhd[0] + 16);

    let kind = '?';
    let codec = '?';
    boxes(buf, stsd[0] + 8, stsd[1], (type) => {
      codec = type;
      if (/avc|hev|hvc|av01/.test(type)) kind = 'video';
      else if (/mp4a|ec-3|ac-3|Opus|alac/.test(type)) kind = 'audio';
    });

    // The sample-time table gives the real frame rate: total samples over the
    // track's own duration. A constant-rate track has one entry.
    let samples = 0;
    let entries = 0;
    let firstDelta = 0;
    if (stts) {
      entries = buf.readUInt32BE(stts[0] + 4);
      for (let i = 0; i < entries && stts[0] + 8 + i * 8 + 8 <= stts[1]; i += 1) {
        const count = buf.readUInt32BE(stts[0] + 8 + i * 8);
        const delta = buf.readUInt32BE(stts[0] + 12 + i * 8);
        if (i === 0) firstDelta = delta;
        samples += count;
      }
    }

    const seconds = duration / timescale;
    info.tracks.push({
      kind,
      codec,
      timescale,
      seconds,
      samples,
      entries,
      rate: seconds ? samples / seconds : 0,
      nominal: firstDelta ? timescale / firstDelta : 0,
    });
  });

  info.size = fileSize;
  return info;
}

const fps = (n) => (n ? n.toFixed(3) : '?');

(async () => {
  const key = process.argv[2] || 'new-who';
  const only = process.argv.slice(3).map(Number);
  const entry = series.find((s) => s.key === key);
  let eps = episodesFor(entry).filter((e) => e.streamUrl);
  if (only.length) eps = eps.filter((e) => only.includes(e.season));

  for (const e of eps) {
    const id = `S${String(e.season).padStart(2, '0')}E${String(e.episode).padStart(2, '0')}`;
    try {
      const { buf, size } = await moovOf(e.streamUrl.replace(CDN, ORIGIN));
      const i = inspect(buf, size);
      const v = i.tracks.find((t) => t.kind === 'video') || {};
      const a = i.tracks.find((t) => t.kind === 'audio') || {};
      console.log(
        `${id}  ${fps(v.rate).padStart(7)}fps (nominal ${fps(v.nominal)})  ` +
        `vid ${String(v.codec).padEnd(5)} ${String(v.entries).padStart(3)} stts entr  ` +
        `aud ${String(a.codec).padEnd(5)} @${a.timescale}  ${e.title}`,
      );
      if (i.handlers.length) console.log(`         handlers: ${i.handlers.join(' | ')}`);
      if (i.tags.length) console.log(`         tags: ${i.tags.join(' | ')}`);
    } catch (err) {
      console.log(`${id}  ERROR ${err.message}  ${e.title}`);
    }
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
