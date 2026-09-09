// Repair the bytes PaddleOCR got wrong before anything else reads the file.
//
//   node scripts/subs/mend.js <folder>            report
//   node scripts/subs/mend.js <folder> --write    rewrite in place as UTF-8
//
// PaddleOCR's model carries a CJK vocabulary, and when a glyph defeats it the
// engine sometimes emits the character it was most nearly sure of, encoded in
// GB18030 rather than UTF-8. The file that comes out is mostly UTF-8 with a
// handful of two- and four-byte GB18030 sequences in it, plus the odd cp1252
// byte from wherever the source subtitle had been before. Nothing downstream
// survives that: Node reads it as UTF-8, hits an invalid sequence and puts a
// replacement character in, and the real character is gone for good.
//
// So this decodes byte by byte. Valid UTF-8 wins. Then GB18030's four-byte
// form, which has a shape nothing else shares (lead 81-FE, digit, lead, digit).
// Then GB18030's two-byte form, but only for the punctuation and fullwidth
// blocks the engine actually reaches for: allow the whole range and it starts
// swallowing cp1252 bytes whose neighbour happens to be a valid trail byte,
// which is how "protégé" came out as "prot間é". Everything left is cp1252.
//
// What the recovered character should have been is a separate question, and a
// human one. This only gets it back on the page where it can be read.
const fs = require('fs');
const path = require('path');

const GB = new TextDecoder('gb18030');
const CP = new TextDecoder('windows-1252');
const UTF = new TextDecoder('utf8', { fatal: true });

function mend(b) {
  const out = [];
  let i = 0;
  let repaired = 0;
  while (i < b.length) {
    if (b[i] < 0x80) { out.push(String.fromCharCode(b[i])); i += 1; continue; }
    let done = false;
    for (const n of [2, 3, 4]) {
      if (i + n > b.length) continue;
      try { out.push(UTF.decode(b.subarray(i, i + n))); i += n; done = true; break; } catch { /* not utf8 */ }
    }
    if (done) continue;
    repaired += 1;
    if (i + 3 < b.length
        && b[i] >= 0x81 && b[i] <= 0xfe && b[i + 1] >= 0x30 && b[i + 1] <= 0x39
        && b[i + 2] >= 0x81 && b[i + 2] <= 0xfe && b[i + 3] >= 0x30 && b[i + 3] <= 0x39) {
      out.push(GB.decode(b.subarray(i, i + 4))); i += 4; continue;
    }
    if (i + 1 < b.length && b[i] >= 0xa1 && b[i] <= 0xa4 && b[i + 1] >= 0xa1 && b[i + 1] <= 0xfe) {
      out.push(GB.decode(b.subarray(i, i + 2))); i += 2; continue;
    }
    out.push(CP.decode(b.subarray(i, i + 1))); i += 1;
  }
  return { text: out.join(''), repaired };
}

if (require.main === module) {
  const root = process.argv[2];
  const write = process.argv.includes('--write');
  if (!root || !fs.existsSync(root)) {
    console.error('usage: node scripts/subs/mend.js <folder> [--write]');
    process.exit(1);
  }
  const files = [];
  (function walk(d) {
    for (const f of fs.readdirSync(d).sort()) {
      const p = path.join(d, f);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (f.endsWith('.srt')) files.push(p);
    }
  })(root);

  let touched = 0;
  let chars = 0;
  for (const file of files) {
    const b = fs.readFileSync(file);
    try { UTF.decode(b); continue; } catch { /* needs mending */ }
    const { text, repaired } = mend(b);
    touched += 1;
    chars += repaired;
    console.log(`${path.relative(root, file).replace(/\\/g, '/')}  ${repaired} characters`);
    for (const line of text.replace(/\r/g, '').split('\n')) {
      if (/[^\x00-\x7f]/.test(line)) console.log(`    ${line}`);
    }
    if (write) fs.writeFileSync(file, text, 'utf8');
  }
  console.log(`\n${files.length} files, ${touched} needed mending, ${chars} characters recovered`);
  if (!write) console.log('report only. add --write to rewrite them.');
}

module.exports = { mend };
