// Audit every downloaded .srt: encoding, structure, casing, formatting habits.
const fs = require('fs');
const path = require('path');

const root = process.argv[2];
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p); else if (f.endsWith('.srt')) files.push(p);
  }
})(root);
files.sort();

const rows = [];
for (const file of files) {
  const raw = fs.readFileSync(file);
  const bom = raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf;
  let text = raw.toString('utf8');
  const utf8Bad = text.includes('�');
  const mojibake = /Ã[-¿]|â€/.test(text);
  if (bom) text = text.slice(1);
  const crlf = (text.match(/\r\n/g) || []).length;
  const lf = (text.match(/(^|[^\r])\n/g) || []).length;
  const norm = text.replace(/\r\n/g, '\n');
  const blocks = norm.split(/\n{2,}/).filter((b) => b.trim());
  const cues = [];
  let badTiming = 0, badIndex = 0;
  for (const b of blocks) {
    const lines = b.split('\n');
    const i = lines.findIndex((l) => /^\d{2}:\d{2}:\d{2}[,.]\d{3} --> \d{2}:\d{2}:\d{2}[,.]\d{3}/.test(l));
    if (i < 0) { badTiming++; continue; }
    if (i !== 1 || !/^\d+$/.test(lines[0].trim())) badIndex++;
    cues.push(lines.slice(i + 1).join('\n'));
  }
  const body = cues.join('\n');
  const letters = body.replace(/<[^>]+>/g, '').match(/[A-Za-z]/g) || [];
  const upper = letters.filter((c) => c >= 'A' && c <= 'Z').length;
  const capsRatio = letters.length ? upper / letters.length : 0;
  // Lines that are entirely upper case (excluding tags and bracketed sound cues).
  const cueLines = body.split('\n').filter((l) => l.trim());
  const allCapsLines = cueLines.filter((l) => {
    const t = l.replace(/<[^>]+>/g, '').replace(/[\[(][^\])]*[\])]/g, '').trim();
    const ls = t.match(/[A-Za-z]/g) || [];
    return ls.length >= 6 && ls.every((c) => c === c.toUpperCase());
  }).length;
  const tags = (body.match(/<\/?(i|b|u|font)[^>]*>/gi) || []).length;
  const sfx = (body.match(/[\[(][A-Z][A-Z .,'!?-]{2,}[\])]/g) || []).length;   // (DOCTOR WHO THEME), [GASPS]
  const notes = (body.match(/♪|#/g) || []).length;
  const speaker = (body.match(/^[A-Z][A-Z .'-]{1,20}:/gm) || []).length;       // DOCTOR: ...
  const lowerL = (body.match(/(^|\s)l(\s|['.,!?])/gm) || []).length;             // OCR "l" for "I"
  const pipes = (body.match(/\|/g) || []).length;
  const dblSpace = (body.match(/[^\s] {2,}[^\s]/g) || []).length;
  const leadDash = (body.match(/^- /gm) || []).length;
  const curly = (body.match(/[‘’“”]/g) || []).length;
  const rel = path.relative(root, file).replace(/\\/g, '/');
  rows.push({ rel, size: raw.length, bom, utf8Bad, mojibake, crlf, lf, cues: cues.length, badTiming, badIndex, capsRatio: +capsRatio.toFixed(2), allCapsLines, capsLinePct: cueLines.length ? +(allCapsLines / cueLines.length * 100).toFixed(0) : 0, tags, sfx, notes, speaker, lowerL, pipes, dblSpace, leadDash, curly });
}

const n = rows.length;
const cnt = (f) => rows.filter(f).length;
console.log(`files ${n}`);
console.log(`BOM ${cnt((r) => r.bom)} | invalid utf8 ${cnt((r) => r.utf8Bad)} | mojibake ${cnt((r) => r.mojibake)}`);
console.log(`CRLF-only ${cnt((r) => r.crlf && !r.lf)} | LF-only ${cnt((r) => r.lf && !r.crlf)} | mixed ${cnt((r) => r.lf && r.crlf)}`);
console.log(`bad timing blocks ${cnt((r) => r.badTiming)} files | bad index ${cnt((r) => r.badIndex)} files`);
console.log(`with <i>/<font> tags ${cnt((r) => r.tags)} | with (SFX) cues ${cnt((r) => r.sfx)} | with ♪/# ${cnt((r) => r.notes)} | with SPEAKER: ${cnt((r) => r.speaker)} | leading "- " ${cnt((r) => r.leadDash)} | curly quotes ${cnt((r) => r.curly)}`);
console.log(`caps ratio: >0.6 (all caps) ${cnt((r) => r.capsRatio > 0.6)} | 0.3-0.6 ${cnt((r) => r.capsRatio > 0.3 && r.capsRatio <= 0.6)} | <0.3 ${cnt((r) => r.capsRatio <= 0.3)}`);
console.log(`all-caps dialogue lines >30% ${cnt((r) => r.capsLinePct > 30)} | 10-30% ${cnt((r) => r.capsLinePct > 10 && r.capsLinePct <= 30)}`);
console.log(`OCR "l"-for-"I" hits: files ${cnt((r) => r.lowerL)} total ${rows.reduce((a, r) => a + r.lowerL, 0)} | pipes ${cnt((r) => r.pipes)} | double spaces ${cnt((r) => r.dblSpace)}`);
console.log(`cues: min ${Math.min(...rows.map((r) => r.cues))} median ${rows.map((r) => r.cues).sort((a, b) => a - b)[n >> 1]} max ${Math.max(...rows.map((r) => r.cues))}`);
console.log('\nOUTLIERS');
for (const r of rows) {
  const flags = [];
  if (r.utf8Bad) flags.push('utf8');
  if (r.mojibake) flags.push('mojibake');
  if (r.capsRatio > 0.6) flags.push(`ALLCAPS ${r.capsRatio}`);
  else if (r.capsLinePct > 30) flags.push(`capsLines ${r.capsLinePct}%`);
  if (r.badTiming) flags.push(`badTiming ${r.badTiming}`);
  if (r.badIndex > 2) flags.push(`badIndex ${r.badIndex}`);
  if (r.cues < 150) flags.push(`fewCues ${r.cues}`);
  if (r.lowerL > 5) flags.push(`ocr-l ${r.lowerL}`);
  if (r.pipes) flags.push(`pipes ${r.pipes}`);
  if (r.curly) flags.push(`curly ${r.curly}`);
  if (flags.length) console.log(`  ${r.rel.padEnd(58)} ${flags.join(', ')}`);
}
fs.writeFileSync(path.join(root, '..', 'subs-audit.json'), JSON.stringify(rows, null, 1));
