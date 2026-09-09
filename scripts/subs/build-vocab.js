// Build the reference word list from subtitles already known to be clean.
//
//   node scripts/subs/build-vocab.js <folder of .srt> [> scripts/subs/vocab.txt]
//
// Four columns: the word, how often it appears, and then how often it appears
// in the middle of a sentence in lower case and with a capital. Those last two
// are how a caller tells `Torchwood` from `was`: the reference writes `was`
// lower case 3,428 times mid-sentence and capitalised none, so a capitalised
// `Was` in the spin-offs is a misread rather than a name.
//
// The 239 New Who subtitles have been through the whole pipeline and a read,
// so they are the closest thing this project has to a dictionary: general
// English, British spelling, and every proper noun the programme uses, from
// Slitheen to Raxacoricofallapatorius. A general word list would flag all of
// those and miss the point.
//
// Every word is kept, with its count. Callers decide what to trust: a
// correction should only land on a word seen several times, because a single
// occurrence is as likely to be an error that survived the read, but a word
// seen once is still evidence that it is a word and not worth reporting.
const fs = require('fs');
const path = require('path');

const root = process.argv[2];
if (!root || !fs.existsSync(root)) {
  console.error('usage: node scripts/subs/build-vocab.js <folder of .srt>');
  process.exit(1);
}

const counts = new Map();
const midLower = new Map();
const midTitle = new Map();
(function walk(d) {
  for (const f of fs.readdirSync(d).sort()) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { walk(p); continue; }
    if (!f.endsWith('.srt')) continue;
    const text = fs.readFileSync(p, 'utf8').replace(/^﻿/, '').replace(/\r/g, '');
    for (const block of text.split(/\n{2,}/)) {
      const lines = block.split('\n');
      const t = lines.findIndex((x) => x.includes('-->'));
      if (t < 0) continue;
      const body = lines.slice(t + 1).join(' ');
      for (const w of body.match(/[A-Za-z][A-Za-z']*/g) || []) {
        const k = w.toLowerCase().replace(/^'+|'+$/g, '');
        if (k) counts.set(k, (counts.get(k) || 0) + 1);
      }
      // Mid-sentence means preceded by a lowercase letter, a comma or a
      // semicolon: anywhere a capital has to be earned rather than automatic.
      for (const m of body.matchAll(/(?<=[a-z,;] )([A-Za-z][A-Za-z']+)/g)) {
        const w = m[1];
        const k = w.toLowerCase().replace(/^'+|'+$/g, '');
        if (!k) continue;
        const map = /^[A-Z]/.test(w) ? midTitle : midLower;
        map.set(k, (map.get(k) || 0) + 1);
      }
    }
  }
})(root);

const kept = [...counts].sort((a, b) => a[0].localeCompare(b[0]));
for (const [w, n] of kept) {
  process.stdout.write(`${w}\t${n}\t${midLower.get(w) || 0}\t${midTitle.get(w) || 0}\n`);
}
process.stderr.write(`${counts.size} distinct, ${kept.length} written\n`);
