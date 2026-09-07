// Second pass over the stripped subtitles: OCR and spelling fixes, display
// re-wrap, timing hygiene. Reads <in>/, writes <out>/.
const fs = require('fs'), path = require('path');
const [,, inRoot, outRoot] = process.argv;
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : f.endsWith('.srt') && files.push(p); } })(inRoot);

// Exact-token fixes from the review (high confidence) and the OCR patterns.
const TOKEN = [
  [/(^|[^0-9A-Za-z])7(?!th\b)(?=[a-z]{2,})/g, '$1T'],        // 7he -> The  (italic T read as 7)
  [/\bT7(?=[a-z])/g, 'T'],                                    // T7ell -> Tell
  [/\bTitanicfalls\b/g, 'Titanic falls'],
  [/Apollo 71'syour/g, "Apollo 11's your"],
  [/\/nto\b/g, 'into'], [/ \/sdead\b/g, "'s dead"], [/ \/sreal\b/g, "'s real"],
  [/mars pas s\/ nous allons vers urn cauchermar/g, 'mais pas si nous allons vers un cauchemar'],
  [/\bandl'm\b/g, "and I'm"], [/\bcan'tl\b/g, "can't I"], [/\bwasl\b/g, 'was I'], [/\bllYeSll\b/g, '"Yes"'],
  [/\bHa ve\b/g, 'Have'], [/\bpiis\b/g, 'pi is'], [/\bjiro jams\b/g, 'jim-jams'],
  [/\bdisquised\b/g, 'disguised'], [/\beczeema\b/g, 'eczema'], [/\beqg\b/g, 'egg'], [/\blifequard\b/g, 'lifeguard'],
  [/\bquiding\b/g, 'guiding'], [/\bsupress\b/g, 'suppress'], [/\burwritten\b/g, 'unwritten'], [/\bsfeak\b/g, 'steak'],
  [/\bleq it\b/g, 'leg it'], [/\bgqui\b/g, 'qui'], [/\btilL\b/g, 'till'], [/\bwWhat\b/g, 'What'], [/\bystems\b/g, 'Systems'],
  [/\bmantashpid\b/g, 'mantasphid'], [/\bthermapolium\b/g, 'thermopolium'],
  // Bracket shapes that are OCR of "I" or stray italics markers.
  [/\.\.\.\](?=\s)/g, '...I'], [/^- \[ (?=[a-z])/gm, '- I '], [/^\[(?=[A-Z])/gm, ''], [/^\] /gm, ''],
  [/\[[^\]]{1,80}\]/g, ''],                                   // a bracketed cue that wrapped onto two lines
  [/[\[\]]/g, ''],                                            // anything left
  [/^_I+N[A-Z]*\?$/gm, ''],                                   // "_IINOII?" garbage
];
// One garbled lyric in S09/E11: a run of "Bom" with note markers read as digits
// and the word itself misread; every line carrying it is normalised.
const SANDMAN = /^.*\b[Bb]om\b.*$/gm;
const sandman = (line) => {
  let l = line.replace(/\bbor[mnr]\w*|\bbomn\b|\bboron\b/g, 'bom').replace(/^[-2~ ]+/, '♪ ').replace(/\s*[Z~]\s*$/, '').replace(/,\s*$/, '...');
  if (!/^♪/.test(l)) l = '♪ ' + l;
  if (!/♪$/.test(l)) l += ' ♪';
  return l;
};

const MAX = 42;
const ms = (t) => { const m = t.match(/(\d+):(\d+):(\d+)[,.](\d+)/); return ((+m[1] * 60 + +m[2]) * 60 + +m[3]) * 1000 + +m[4]; };
const fmt = (x) => { const h = Math.floor(x / 3600000), m = Math.floor(x / 60000) % 60, s = Math.floor(x / 1000) % 60, r = x % 1000; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(r).padStart(3, '0')}`; };

/** Split text into two lines of the most even length, breaking at spaces. */
function balance(text) {
  const words = text.split(' ');
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
    const score = Math.max(a.length, b.length);
    if (!best || score < best.score) best = { a, b, score };
  }
  return best;
}

const S = { files: 0, tokens: 0, sandman: 0, rewrapped: 0, leftLong: 0, leftTall: 0, overlaps: 0, extended: 0, dropped: 0 };
for (const file of files) {
  const rel = path.relative(inRoot, file);
  const raw = fs.readFileSync(file, 'utf8');
  const bom = raw.charCodeAt(0) === 0xfeff;
  let text = (bom ? raw.slice(1) : raw).replace(/\r\n/g, '\n');
  for (const [re, to] of TOKEN) text = text.replace(re, (...m) => { S.tokens++; return typeof to === 'string' ? to.replace('$1', m[1] ?? '') : to; });
  if (/S09[\\/]E11_/.test(rel)) text = text.replace(SANDMAN, (line) => { S.sandman++; return sandman(line); });

  const blocks = text.split(/\n{2,}/).filter((b) => b.trim());
  let cues = [];
  for (const b of blocks) {
    const l = b.split('\n'); const t = l.findIndex((x) => /-->/.test(x)); if (t < 0) continue;
    const [a, z] = l[t].split('-->').map((x) => ms(x.trim()));
    let lines = l.slice(t + 1).map((x) => x.replace(/\s{2,}/g, ' ').trim()).filter((x) => x && x !== '-');
    if (lines.length === 1 && /^- /.test(lines[0])) lines[0] = lines[0].slice(2);
    if (!lines.length) { S.dropped++; continue; }

    // Re-wrap: too many lines, or a line over the limit. Dialogue cues (each
    // line its own speaker) are left as they are.
    const dialogue = lines.some((x) => /^- /.test(x));
    if (!dialogue && (lines.length > 2 || lines.some((x) => x.length > MAX))) {
      const joined = lines.join(' ');
      if (joined.length <= MAX) { lines = [joined]; S.rewrapped++; }
      else if (joined.length <= 2 * MAX) { const { a: p, b: q } = balance(joined); lines = [p, q]; S.rewrapped++; }
      else if (lines.length > 2) { const { a: p, b: q } = balance(joined); lines = [p, q]; S.rewrapped++; S.leftLong++; }
      else S.leftLong++;
    } else if (dialogue) {
      if (lines.length > 2) S.leftTall++;
      if (lines.some((x) => x.length > MAX)) S.leftLong++;
    }
    cues.push({ start: a, end: z, lines });
  }

  // Timing: no overlaps; give fast or very short cues more time when the gap
  // to the next cue allows. Never move a start, never shorten below 300ms.
  for (let i = 0; i < cues.length; i++) {
    const c = cues[i], next = cues[i + 1];
    if (next && next.start < c.end) { c.end = Math.max(c.start + 300, next.start - 40); S.overlaps++; }
    const chars = c.lines.join(' ').length;
    const want = Math.max(1000, Math.ceil(chars / 20 * 1000));           // 20 characters per second
    const limit = Math.min(c.start + 7000, next ? next.start - 40 : c.end + 2000);
    if (c.end - c.start < want && limit > c.end) { c.end = Math.min(limit, c.start + want); S.extended++; }
  }

  const out = cues.map((c, i) => `${i + 1}\n${fmt(c.start)} --> ${fmt(c.end)}\n${c.lines.join('\n')}`).join('\n\n');
  const dest = path.join(outRoot, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, (bom ? '﻿' : '') + out.replace(/\n/g, '\r\n') + '\r\n');
  S.files++;
}
console.log(JSON.stringify(S));
