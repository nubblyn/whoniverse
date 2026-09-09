// Make every subtitle file a plain dialogue track.
//
// Two eras, two hearing-impaired styles: S1-S12 have "DOCTOR:" labels and
// "(DOOR SLAMS)" cues in caps, S13-S16 have "[chuckles]" in lowercase square
// brackets. Both go. Typography is normalised too: curly quotes -> straight,
// stray pipes, "#" lyric markers -> "♪", and two-speaker dashes as "- Text".
// Cues left empty are dropped and the rest renumbered. BOM and CRLF are kept.
// Writes every file to <root>-fixed/.
const fs = require('fs'), path = require('path');
const root = process.argv[2];
const out = root.replace(/[\\/]+$/, '') + '-fixed';

// Labels and bracketed cues are written in capitals, but OCR reads the odd
// letter in the wrong case: LuKE:, SARAH jANE:, (CHUcKLING), (KNOcKING ON DooR).
// So the shape allows any letter and `mostlyCaps` decides, which keeps a line of
// ordinary dialogue ending in a colon out of it.
const LABEL = /^(-\s*)?[A-Za-z][A-Za-z0-9 .,'\/-]{0,30}:\s*/;      // DOCTOR:  - MAN 2:  DOCTOR'S VOICE:
const CAPS_CUE = /[\[(][A-Za-z0-9][A-Za-z0-9 .,'!?&\/\n-]*[\])]/g; // (DOOR SLAMS) — may span a line break

/** At least two thirds of the letters are capitals, and there are some. */
function mostlyCaps(s) {
  const letters = s.replace(/[^A-Za-z]/g, '');
  if (letters.length < 2) return false;
  return letters.replace(/[^A-Z]/g, '').length / letters.length >= 0.67;
}
const SQUARE_CUE = /\[[^\]\n]{1,60}\]/g;                            // [chuckles] [system voice] — never dialogue
// A parenthetical of one to five plain words is a sound cue whatever case the
// OCR read it in: (sighs), (GAsPs), (DooR LocK cLIcKINg). Letters only, so the
// sarcasm marker survives — the reference keeps 26 of those and the house does
// too — and so does the upside-down joke in Whatever Happened to Sarah Jane,
// which has digits in it.
const LOWER_PAREN = /\((?:[A-Za-z][A-Za-z'-]*)(?: [A-Za-z][A-Za-z'-]*){0,4}\)/g;
const MUSIC_CUE = /\(#[^)]{0,60}\)/g;                               // (# STRAUSS: Emperor Waltz)

/**
 * A speaker label the OCR left in title case: "Mistress:", "Professor Rivers:".
 * One to three capitalised words and then a capital, which is what a name in
 * front of a line of dialogue looks like and what a sentence does not:
 * "Species identified: Bane" and "Mr: and Mrs Pond" both have a lowercase word
 * where a label would have a capital.
 */
function titleLabel(line) {
  const m = line.match(/^(-\s*)?((?:[A-Z][A-Za-z'-]{1,14})(?: [A-Z][A-Za-z'-]{1,14}){0,2}):\s+(?=[A-Z])/);
  return m && m[0].length <= 26 ? m : null;
}
const BARE_CAPS = /^[^a-z♪]*[A-Z]{2,}[^a-z♪]*$/;                    // TARDIS THRUMS — a cue with no brackets

const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : f.endsWith('.srt') && files.push(p); } })(root);

const S = { files: 0, labels: 0, capsCues: 0, squareCues: 0, lowerParen: 0, bareCaps: 0, cuesDropped: 0, strayBrackets: 0, hashLyrics: 0, quotes: 0, pipes: 0, dashes: 0 };
const samples = { bare: new Map(), lowerParen: new Map(), label: new Map() };
const sample = (map, key) => { if (map.size < 500) map.set(key, (map.get(key) || 0) + 1); };

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const bom = raw.charCodeAt(0) === 0xfeff;
  const text = (bom ? raw.slice(1) : raw).replace(/\r\n/g, '\n');
  const blocks = text.split(/\n{2,}/).filter((b) => b.trim());
  const kept = [];
  for (const block of blocks) {
    const lines = block.split('\n');
    const t = lines.findIndex((l) => /-->/.test(l));
    if (t < 0) continue;
    const timing = lines[t];

    // Whole-body passes first, so a cue that wraps onto a second line goes as one.
    let body = lines.slice(t + 1).join('\n');
    body = body.replace(/[‘’]/g, () => { S.quotes++; return "'"; }).replace(/[“”]/g, () => { S.quotes++; return '"'; });
    body = body.replace(CAPS_CUE, (m) => {
      if (!mostlyCaps(m)) return m;
      S.capsCues++;
      return '';
    });
    body = body.replace(SQUARE_CUE, () => { S.squareCues++; return ''; });
    body = body.replace(MUSIC_CUE, () => { S.capsCues++; return ''; });
    body = body.replace(LOWER_PAREN, (m) => { S.lowerParen++; sample(samples.lowerParen, m); return ''; });
    // A bracket whose partner the OCR lost, or that landed in the middle of a
    // word: "he( doesn't have to think", ") I'm okay". Nothing in these files
    // uses parentheses for anything but a cue, so once the pairs are gone the
    // odd ones left are debris.
    const opens = (body.match(/\(/g) || []).length;
    const closes = (body.match(/\)/g) || []).length;
    if (opens !== closes) {
      body = body.replace(/[()]/g, () => { S.strayBrackets++; return ''; });
    }

    let out = body.split('\n').map((line) => {
      let l = line;
      l = l.replace(/ ?\|$/g, () => { S.pipes++; return ''; }).replace(/\|(?=[A-Za-z])/g, () => { S.pipes++; return ''; });
      const lab = (() => {
        const m = l.match(LABEL);
        if (m && mostlyCaps(m[0])) return m;
        return titleLabel(l);
      })();
      if (lab) { S.labels++; sample(samples.label, lab[0].trim()); l = (lab[1] ? '- ' : '') + l.slice(lab[0].length); }
      if (/^#\s|\s#$|^#$/.test(l)) { S.hashLyrics++; l = l.replace(/^#\s*/, '♪ ').replace(/\s*#$/, ' ♪'); }
      l = l.replace(/\s{2,}/g, ' ').trim();
      // A line that is only capitals and no sentence punctuation is a sound
      // description without brackets, not a shouted line.
      // Short shouted words are dialogue even without a full stop: "OK," "NO".
      const word = l.replace(/^-\s*/, '').replace(/[^A-Za-z]/g, '');
      const dialogue = /^(OK|NO|YES|GO|RUN|STOP|HELP|FIRE|WAIT|WHAT|WHY|NOW|TARDIS|UNIT|CAL)$/.test(word);
      if ((BARE_CAPS.test(l) || (mostlyCaps(l) && !/[a-z]{4}/.test(l))) && !dialogue && !/[.!?]$/.test(l.replace(/^-\s*/, ''))) { S.bareCaps++; sample(samples.bare, l); return ''; }
      if (/^-\s*/.test(l)) { const fixed = l.replace(/^-\s*/, '- '); if (fixed !== l) S.dashes++; l = fixed; }
      return l;
    }).filter((l) => l && l !== '-' && l !== '♪');

    // One speaker left after the other's line went: no need for a dash.
    if (out.length === 1 && /^- /.test(out[0])) out[0] = out[0].slice(2);

    if (!out.length) { S.cuesDropped++; continue; }
    kept.push(`${kept.length + 1}\n${timing}\n${out.join('\n')}`);
  }
  const result = (bom ? '﻿' : '') + kept.join('\n\n').replace(/\n/g, '\r\n') + '\r\n';
  const dest = path.join(out, path.relative(root, file));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, result);
  S.files++;
}

const top = (map, n) => [...map].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} x${v}`).join(' | ');
console.log(JSON.stringify(S));
console.log('bare caps removed, top:', top(samples.bare, 20));
console.log('lowercase parentheticals removed, top:', top(samples.lowerParen, 12));
console.log('labels, top:', top(samples.label, 8));
