// Words in the subtitles that are not in the dictionary, are lowercase (so not
// names), and appear rarely across the whole corpus. Each with one context.
const fs = require('fs'), path = require('path');
const [,, root, dictFile] = process.argv;
const dict = new Set(fs.readFileSync(dictFile, 'utf8').split(/\r?\n/));
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : f.endsWith('.srt') && files.push(p); } })(root);
const counts = new Map(), ctx = new Map();
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8').replace(/^﻿/, '').replace(/\r/g, '');
  const cues = text.split(/\n\n+/).map((b) => b.split('\n').slice(2).join(' ')).filter(Boolean);
  const rel = path.relative(root, file).split(path.sep).join('/');
  for (const cue of cues) {
    const clean = cue.replace(/<[^>]+>/g, '').replace(/[\[(][^\])]*[\])]/g, '');
    for (const w of clean.match(/[A-Za-z][A-Za-z']*[A-Za-z]|[A-Za-z]/g) || []) {
      if (/^[A-Z]/.test(w)) continue;                 // names, sentence starts, caps cues
      const base = w.replace(/'(s|ll|re|ve|d|m|t)$/i, '').replace(/'/g, '');
      if (!base || dict.has(base) || dict.has(base.replace(/in$/, 'ing'))) continue;
      counts.set(base, (counts.get(base) || 0) + 1);
      if (!ctx.has(base)) ctx.set(base, `${rel}: ${clean.trim().slice(0, 90)}`);
    }
  }
}
const rare = [...counts].filter(([, n]) => n <= 3).sort((a, b) => a[0].localeCompare(b[0]));
console.log(`unknown lowercase words: ${counts.size}; rare (<=3): ${rare.length}`);
fs.writeFileSync(path.join(root, '..', 'spell-candidates.txt'), rare.map(([w, n]) => `${w}\t${n}\t${ctx.get(w)}`).join('\n'));
