// Display-rule lint for the normalised subtitles: what a viewer sees, not
// whether it lines up with the audio (that needs the media; see ffsubsync).
// Rules are the common broadcast ones: at most 2 lines, at most 42 characters
// per line, 0.8s to 7s on screen, reading speed under 25 characters/second,
// no overlapping cues, cues in order.
const fs = require('fs'), path = require('path');
const root = process.argv[2];
const fix = process.argv.includes('--fix');   // trims overlaps and enforces a 40ms gap, nothing else
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : f.endsWith('.srt') && files.push(p); } })(root);

const ms = (t) => { const m = t.match(/(\d+):(\d+):(\d+)[,.](\d+)/); return ((+m[1] * 60 + +m[2]) * 60 + +m[3]) * 1000 + +m[4]; };
const fmt = (x) => { const h = Math.floor(x / 3600000), m = Math.floor(x / 60000) % 60, s = Math.floor(x / 1000) % 60, r = x % 1000; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(r).padStart(3, '0')}`; };

const totals = { cues: 0, lines3: 0, long: 0, short: 0, longDur: 0, fastCps: 0, overlap: 0, outOfOrder: 0, fixedOverlaps: 0 };
const perFile = [];
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const bom = raw.charCodeAt(0) === 0xfeff;
  const text = (bom ? raw.slice(1) : raw).replace(/\r\n/g, '\n');
  const blocks = text.split(/\n{2,}/).filter((b) => b.trim());
  const cues = blocks.map((b) => { const l = b.split('\n'); const t = l.findIndex((x) => /-->/.test(x)); const [a, z] = l[t].split('-->').map((x) => ms(x.trim())); return { start: a, end: z, lines: l.slice(t + 1) }; });
  const f = { rel: path.relative(root, file).replace(/\\/g, '/'), cues: cues.length, lines3: 0, long: 0, short: 0, longDur: 0, fastCps: 0, overlap: 0, outOfOrder: 0, worstCps: 0, longest: 0 };
  for (let i = 0; i < cues.length; i++) {
    const c = cues[i]; const dur = c.end - c.start; const chars = c.lines.join(' ').length;
    if (c.lines.length > 2) f.lines3++;
    for (const l of c.lines) { if (l.length > 42) f.long++; f.longest = Math.max(f.longest, l.length); }
    if (dur < 800) f.short++;
    if (dur > 7000) f.longDur++;
    const cps = chars / (dur / 1000); if (cps > 25 && dur > 0) f.fastCps++; f.worstCps = Math.max(f.worstCps, +cps.toFixed(0));
    if (i > 0) {
      if (c.start < cues[i - 1].start) f.outOfOrder++;
      if (c.start < cues[i - 1].end) { f.overlap++; if (fix) { cues[i - 1].end = Math.max(cues[i - 1].start + 300, c.start - 40); totals.fixedOverlaps++; } }
    }
  }
  for (const k of ['cues', 'lines3', 'long', 'short', 'longDur', 'fastCps', 'overlap', 'outOfOrder']) totals[k] += f[k];
  perFile.push(f);
  if (fix && f.overlap) {
    const out = cues.map((c, i) => `${i + 1}\n${fmt(c.start)} --> ${fmt(c.end)}\n${c.lines.join('\n')}`).join('\n\n');
    fs.writeFileSync(file, (bom ? '﻿' : '') + out.replace(/\n/g, '\r\n') + '\r\n');
  }
}
console.log(JSON.stringify(totals));
console.log('files with any 3+ line cue:', perFile.filter((f) => f.lines3).length, '| any >42-char line:', perFile.filter((f) => f.long).length, '| any overlap:', perFile.filter((f) => f.overlap).length, '| any out of order:', perFile.filter((f) => f.outOfOrder).length);
console.log('worst files by long lines:', perFile.sort((a, b) => b.long - a.long).slice(0, 6).map((f) => `${f.rel} (${f.long} lines, longest ${f.longest})`).join('; '));
console.log('worst files by fast cps:', perFile.sort((a, b) => b.fastCps - a.fastCps).slice(0, 6).map((f) => `${f.rel} (${f.fastCps} cues, peak ${f.worstCps} cps)`).join('; '));
console.log('worst files by overlaps:', perFile.sort((a, b) => b.overlap - a.overlap).slice(0, 6).map((f) => `${f.rel} (${f.overlap})`).join('; '));
