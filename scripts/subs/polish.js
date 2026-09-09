// Second pass over the stripped subtitles: OCR and spelling fixes, display
// re-wrap, timing hygiene. Reads <in>/, writes <out>/.
const fs = require('fs'), path = require('path');
const [,, inRoot, outRoot] = process.argv;
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : f.endsWith('.srt') && files.push(p); } })(inRoot);

// Typography, settled by counting the New Who files rather than by taste:
// 7,665 ellipses written as three dots against 81 written as two, no run of
// four anywhere, no doubled comma, no pipe. Runs of dots are levelled to three.
const TYPO = [
  // A speaker label that only became legible once ocr-fix repaired its capitals,
  // so strip-sdh could not have seen it: "Wormwood: They're only stunned!".
  // Both words after the dash must be capitalised and the line must carry on
  // with a capital, which is what keeps "Species identified: Bane" intact.
  [/(^|[.!?] )(- )?[A-Z][A-Za-z'-]{1,14}(?: [A-Z][A-Za-z'-]{1,14}){0,2}: (?=[A-Z])/g, '$1$2'],
  // A colon the OCR put in the middle of a sentence: "You must: never walk
  // home on your own". A real label is followed by a capital, not by this.
  [/: (?=[a-z])/g, ' '],
  [/[|\\†<>_]/g, ''],                      // debris the OCR invented
  [/[−√]/g, ''],                           // and the GB18030 characters it guessed at
  [/ \.(?=[a-z])/g, ' '],                  // "used to tell .me" — a dot that is not a full stop
  [/\.{2,}/g, '...'],                      // two dots or five, the house writes three
  [/,{2,}/g, ','],
  [/\s+([,.!?;:])(?!\.)/g, '$1'],          // no space in front of punctuation
  [/([,;])(?=[A-Za-z])/g, '$1 '],          // and one after it
  [/\.(?=[A-Z][a-z])/g, '. '],             // a sentence break with the space missing
  [/([a-z])-$/g, '$1...'],                 // an interrupted line: the house writes 5,489 of
                                           // these as an ellipsis and one as a hyphen
  [/ {2,}/g, ' '],
];

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

const S = { files: 0, tokens: 0, typo: 0, capitals: 0, sandman: 0, rewrapped: 0, leftLong: 0, leftTall: 0, overlaps: 0, extended: 0, dropped: 0 };
for (const file of files) {
  const rel = path.relative(inRoot, file);
  const raw = fs.readFileSync(file, 'utf8');
  const bom = raw.charCodeAt(0) === 0xfeff;
  let text = (bom ? raw.slice(1) : raw).replace(/\r\n/g, '\n');
  for (const [re, to] of TOKEN) text = text.replace(re, (...m) => { S.tokens++; return typeof to === 'string' ? to.replace('$1', m[1] ?? '') : to; });
  // Typography last, so it tidies after the token fixes rather than before.
  // Line by line, or the patterns reach across a cue's line break.
  text = text.split('\n').map((line) => {
    if (line.includes('-->') || /^\d+$/.test(line)) return line;
    let l = line;
    for (const [re, to] of TYPO) l = l.replace(re, (...m) => { S.typo++; return typeof to === 'string' ? to.replace('$1', m[1] ?? '') : to; });
    return l;
  }).join('\n');
  if (/S09[\\/]E11_/.test(rel)) text = text.replace(SANDMAN, (line) => { S.sandman++; return sandman(line); });

  const blocks = text.split(/\n{2,}/).filter((b) => b.trim());
  let cues = [];
  for (const b of blocks) {
    const l = b.split('\n'); const t = l.findIndex((x) => /-->/.test(x)); if (t < 0) continue;
    const [a, z] = l[t].split('-->').map((x) => ms(x.trim()));
    // A line with nothing readable on it is debris, not a pause: a lone colon,
    // a stray bracket, whatever the OCR left after the cue was taken out.
    let lines = l.slice(t + 1).map((x) => x.replace(/\s{2,}/g, ' ').trim()).filter((x) => x && x !== '-' && /[A-Za-z♪]/.test(x));
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

  // Re-wrapping joins lines, and a line ending in a full stop meeting one that
  // starts with an ellipsis makes a run of dots that no earlier pass could see.
  // Level them once more now the lines are final.
  for (const c of cues) c.lines = c.lines.map((l) => l.replace(/\.{2,}/g, '...').replace(/ {2,}/g, ' ').trim());

  // A sentence starts with a capital. The OCR drops it often enough to matter:
  // the New Who files, which have been read, put a lowercase letter after a full
  // stop 121 times in 46,959 (0.3%) and at the start of a cue that follows a
  // finished sentence 13 times in 131,163 (0.01%). The spin-offs manage 4.7% and
  // 2.6%, which is damage rather than house style. An ellipsis is left alone,
  // because "...and then" carries on rather than begins.
  const upper = (s, i) => s.slice(0, i) + s[i].toUpperCase() + s.slice(i + 1);
  let finished = false;
  for (const c of cues) {
    let body = c.lines.join('\n');
    body = body.replace(/(?<!\.)([.!?]["']?\s+)(- )?([a-z])/g,
      (m, stop, dash, ch) => { S.capitals++; return stop + (dash || '') + ch.toUpperCase(); });
    if (finished) {
      const i = body.search(/[A-Za-z]/);
      if (i >= 0 && /[a-z]/.test(body[i]) && !/^\s*(?:- |♪ )?\.\.\./.test(body)) {
        body = upper(body, i);
        S.capitals++;
      }
    }
    finished = /(?<!\.)[.!?]["']?$/.test(body.trim());
    c.lines = body.split('\n');
  }

  const out = cues.map((c, i) => `${i + 1}\n${fmt(c.start)} --> ${fmt(c.end)}\n${c.lines.join('\n')}`).join('\n\n');
  const dest = path.join(outRoot, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, (bom ? '﻿' : '') + out.replace(/\n/g, '\r\n') + '\r\n');
  S.files++;
}
console.log(JSON.stringify(S));
