// Undo what the OCR misread, using the New Who subtitles as the dictionary.
//
//   node scripts/subs/ocr-fix.js <in> <out>            write the fixed files
//   node scripts/subs/ocr-fix.js <in> <out> --dry      report only
//
// PaddleOCR reads Blu-ray and DVD subtitle pictures well but has three habits,
// and each one is systematic enough to undo:
//
//   the dot on an i vanishes next to an l      lke, lfe, sltheen, talsman
//   a doubled letter collapses                 wil, kil, realy, we'l
//   a short word is read upside down           up as dn, no as ou, do as op
//
// Plus the usual I/l/1 confusion and the odd swallowed space. What makes this
// safe to automate is the dictionary: a word is only changed when it is absent
// from the reference list and exactly one of the transformations below lands on
// a word that is in it, and common in it. Everything ambiguous is printed for a
// person to look at instead. `serf` stays `serf` because nothing turns it into
// a known word; `Arn` stays `Arn` for the same reason.
//
// Build the reference list with build-vocab.js. Run mend.js first, or the files
// with GB18030 bytes in them will be read as replacement characters.
const fs = require('fs');
const path = require('path');

const [, , inRoot, outRoot] = process.argv;
const dry = process.argv.includes('--dry');
if (!inRoot || !outRoot) {
  console.error('usage: node scripts/subs/ocr-fix.js <in> <out> [--dry]');
  process.exit(1);
}

const VOCAB = new Map();
// How the reference writes each word in the middle of a sentence: with a
// capital, or without. That is the only reliable way to tell a name from a
// misread capital, and it has to come from evidence rather than a list.
const MID = new Map();
for (const line of fs.readFileSync(path.join(__dirname, 'vocab.txt'), 'utf8').split('\n')) {
  if (!line) continue;
  const [w, n, lower, title] = line.split('\t');
  VOCAB.set(w, Number(n));
  MID.set(w, { lower: Number(lower || 0), title: Number(title || 0) });
}

/**
 * A capital the reference would not have used. `was` appears mid-sentence 3,428
 * times there and never once with a capital, so `Was` is a misread; `Smith`
 * appears 127 times and never lower, so it stays. Below fifty occurrences there
 * is not enough evidence either way and the word is left alone.
 */
function overCapitalised(w) {
  if (!/^[A-Z][a-z]+$/.test(w)) return false;
  const m = MID.get(w.toLowerCase());
  return !!m && m.lower >= 50 && m.title <= m.lower * 0.05;
}
// How often a word must appear in the reference before a correction is allowed
// to land on it. Low enough to keep the show's own vocabulary, high enough that
// a survivor of the New Who read cannot pull a good word onto a bad one.
const FLOOR = 5;

// A general English word list as well, because the reference only knows the
// words New Who happens to use. Without it `posho`, `quinoa` and `nerd` look
// exactly like OCR damage, and `elminated` and `slmy` cannot be corrected
// because the right spelling is not in the reference either.
const ENGLISH = new Set(
  require('zlib').gunzipSync(fs.readFileSync(path.join(__dirname, 'english.txt.gz')))
    .toString('utf8').split('\n').filter(Boolean),
);

// Corrections read off a diff against an independent transcription of the same
// episodes, reviewed one by one. See cross-check.py and corrections.tsv. This
// catches what no dictionary can: a stray letter welded to a real word, where
// the result is not a word and the right answer is only knowable from the line.
const CORRECTIONS = new Map(
  fs.readFileSync(path.join(__dirname, 'corrections.tsv'), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split('\t'))
    .filter((c) => c.length === 2)
    .map(([bad, good]) => [bad.toLowerCase(), good]),
);

const common = (w) => (VOCAB.get(w.toLowerCase()) || 0) >= FLOOR;
const known = (w) => common(w) || ENGLISH.has(w.toLowerCase());
// A word either dictionary has heard of is a word. Only what neither knows is
// worth correcting or reporting.
const plausible = (w) => {
  const k = w.toLowerCase();
  if (VOCAB.has(k) || ENGLISH.has(k)) return true;
  const bare = k.replace(/'/g, '');
  if (ENGLISH.has(bare)) return true;
  return ["'s", "'ll", "'ve", "'d", "'re", "'m", "n't"].some(
    (suf) => k.endsWith(suf) && ENGLISH.has(k.slice(0, -suf.length)));
};

// What PaddleOCR reaches for when a glyph defeats it: a character from its CJK
// vocabulary. mend.js got these back onto the page; this decides what each one
// was standing in for, which took reading all 120 of them in context.
//
// Some are consistent. `く` is always I, `み` is always a music note, `」!` is
// always "if" (33 times), the fullwidth punctuation is itself. Others are noise
// the OCR invented and are simply removed. The handful that carry a word the
// deletion would lose are listed by hand underneath.
// Punctuation and letters the OCR wrote in their fullwidth or lookalike form.
// Mechanical, so these go first, before anything reads the words.
const GLYPH_PUNCT = [
  [/，/g, ','], [/。/g, '.'], [/、/g, ','], [/！/g, '!'], [/？/g, '?'],
  [/：/g, ':'], [/％/g, '%'], [/）/g, ')'], [/（/g, '('], [/～/g, 'I'],
  [/ａ/g, 'a'], [/Ａ/g, 'A'], [/ą/g, 'a'], [/ı/g, 'I'], [/…/g, '...'],
  [/√/g, ''], [/−/g, ''],
];

// The rest are guesses the model made at a glyph it could not read, and what
// each one stood for took reading all 140 of them in context. Some are
// consistent: `く`, `←`, `〈`, `Ⅰ` are always I, `み` is always a music note,
// `」!` is always "if" (33 times), `ρ` is always "a".
const GLYPH = [
  [/」!/g, 'if'], [/·[!']/g, 'if'],
  [/[くＩ←〈Ⅰ]/g, 'I'], [/み/g, '♪'], [/ρ/g, 'a'], [/比/g, 'it'],
  [/I[ⅡⅢ]I/g, "I'll"], [/Ⅱ/g, "'ll"], [/↑ (?=think|know)/g, 'I '],
  // A dialogue dash the OCR drew as a box or an em dash, and only at the start
  // of a line: in the middle of one the box is noise.
  [/^[□—](?=\s?[A-Z])/gm, '- '],
  // Everything left is noise, and the words it was swallowing have already been
  // put back by GLYPH_WORDS above.
  [/[」「』一广□↑·—小工厂πⅢ三]/g, ''],
];

// The places where a swallowed glyph was a word, not noise. Read one by one.
// These run after HAND, because HAND has already tidied the words around them.
const GLYPH_WORDS = [
  [/」 am Kate/g, 'I am Kate'], [/already tanking\. 」 we/g, 'already tanking. If we'],
  [/And 」 you mess up/g, 'And if you mess up'], [/and 」 you're liaising/g, "and if you're liaising"],
  [/Oh, 」 you could cross/g, 'Oh, if you could cross'], [/And 」 you do sign up/g, 'And if you do sign up'],
  [/Actually, 」 you don't mind/g, "Actually, if you don't mind"], [/What 」 the power failed/g, 'What if the power failed'],
  [/what am 一 supposed/g, 'what am I supposed'], [/Today 一 nearly got/g, 'Today I nearly got'],
  [/one thing へ do know/g, 'one thing I do know'], [/she said へ was running/g, 'she said he was running'],
  [/She said へ would meet/g, 'She said he would meet'],
  [/But I didn't\. □ didn't feel/g, "But I didn't. I didn't feel"],
  [/How am — supposed/g, 'How am I supposed'], [/へ/g, 'he'],
];

// Fixes no dictionary can derive, because the misreading is itself a word or a
// plausible fragment. Every one of these was read in context first.
const HAND = [
  // Read upside down. `do` as `op` is the common one, 259 times over.
  [/\bop\b/g, 'do'], [/\bdn\b/g, 'up'], [/\bou\b/g, 'no'], [/\bidn\b/g, 'up'],
  [/\bppo\b/g, 'odd'], [/\buo\b/g, 'on'], [/\bwn\b/g, 'um'],
  // A capital I taken for r, t, l or U.
  [/\b[rTt]'(m|ll|ve|d|s)\b/g, "I'$1"], [/\bl'(m|ll|ve|d)\b/g, "I'$1"],
  [/\br'l\b/g, "I'll"], [/\brll\b/g, "I'll"],
  [/\bI'Ut\b/g, "I'll"], [/\bI'UL?\b/g, "I'll"], [/\bI'tl\b/g, "I'll"],
  [/\bit'tl\b/g, "it'll"], [/\bIt'Il\b/g, "It'll"], [/\bAI[Il]\b/g, 'All'],
  [/\bAlIl\b/g, 'All'], [/\bAl[IL]\b/g, 'All'], [/\b[Ww]ilI\b/g, 'will'],
  [/\bWorld War Il\b/g, 'World War II'],
  [/\bIm\b/g, "I'm"], [/\bIam\b/g, 'I am'], [/\bDol\b/g, 'Do I'], [/\bdol\b/g, 'do I'],
  [/\bSol see\b/g, 'So I see'],
  // A swallowed space. Only the pairs that actually turn up.
  [/\bisa\b/g, 'is a'], [/\bofa\b/g, 'of a'], [/\bina\b/g, 'in a'], [/\bfora\b/g, 'for a'],
  [/\btoa\b/g, 'to a'], [/\bona\b/g, 'on a'], [/\bit'sa\b/g, "it's a"], [/\bIjust\b/g, 'I just'],
  [/\bgeta\b/g, 'get a'], [/\bgota\b/g, 'got a'], [/\basa\b/g, 'as a'],
  [/\bwasa\b/g, 'was a'], [/\bdoa\b/g, 'do a'], [/\bthe1 (\d)/g, 'the 1$1'],
  // Stray letters the OCR added, and one it swapped: an l after "of", a t after
  // "you", a u in the middle of kill, a k where like lost three letters.
  [/\bofl\b/g, 'of'], [/\byout\b/g, 'you'], [/\bkiul\b/g, 'kill'], [/\buke\b/g, 'like'],
  // Words the OCR ran together or split, each read against the picture.
  // A letter stuck to the end of a short word, listed rather than derived: see
  // the note above `candidates` for why the general rule had to go.
  [/\bof[iceylv]\b/g, 'of'], [/\bandl\b/g, 'and'], [/\byouj\b/g, 'you'],
  [/\buntilv\b/g, 'until'], [/\bthate\b/g, 'that'], [/\bajob\b/g, 'a job'],
  [/\bmye\b/g, 'my'], [/\bnowl\b/g, 'now'], [/\bGoti\b/g, 'Got'], [/\bRanil\b/g, 'Rani'],
  [/\bYouv\b/g, 'You'], [/\btak to\b/g, 'talk to'], [/\bfear ris\b/g, 'fear is'],
  [/\bofthe\b/g, 'of the'], [/\bItis\b/g, 'It is'], [/pr@ject/g, 'project'],
  [/\bVe must\b/g, 'We must'], [/\bVarriors\b/g, 'Warriors'], [/\baccepta ble\b/g, 'acceptable'],
  [/\bexis\b/g, 'ex is'], [/\bal lot\b/g, 'a lot'], [/\bSOI suggest\b/g, 'so I suggest'],
  [/\bdoldo\b/g, 'do I do'], [/\bAndi\b/g, 'And I'], [/\bItwas\b/g, 'It was'],
  [/\bat 0060 local\b/g, 'at 0600 local'],
  // Sarah Jane, whose surname keeps losing its capital or its J.
  [/\bSarah (jane|ane)\b/g, 'Sarah Jane'],
  // A zero read as the letter o, inside a number.
  [/(\d[\d,.:]*)[oO]{2,}/g, (m, d) => d + '0'.repeat(m.length - d.length)],
  // `us` shouted. The programme means the pronoun 361 times out of 362; the one
  // exception is the country, and it always has "the" in front of it.
  [/\buS\b/g, 'us'], [/(?<!\bthe )\bUS\b/g, 'us'],
  // A stray l dropped in front of a word, usually duplicating its first letter.
  // Where a verb follows it is a misread I instead; everywhere else it is noise.
  [/\bl (am|was|had|have|will|can|could|would|should|do|did|don't|didn't|know|think|need|want|said|saw|see|got|mean|guess|suppose|wish|hope|remember|thought|felt|feel)\b/g, 'I $1'],
  [/ l (?=[A-Za-z])/g, ' '], [/^l (?=[A-Za-z])/gm, ''],
  // A lone 1 or i behaves the same way: mostly noise dropped between two words
  // ("no trace of 1 them arriving"), occasionally a misread I, and once "if".
  [/\b[1i] (am|was|will|can|could|would|should|do|did|don't|didn't|know|think|need|want|said|saw|see|got|mean|guess|suppose|wish|hope|remember|thought|felt|feel|have|had)\b/g, 'I $1'],
  [/\bi!/g, 'if'], [/\bCategory i\b/g, 'Category 1'], [/\b1@o\b/g, '100'], [/\bGrid i(\d)/g, 'Grid 1$1'],
  [/ [1i] (?=[A-Za-z])/g, ' '], [/^[1i] (?=[A-Za-z])/gm, ''], [/ [1i](?=')/g, ''],
  // The same habit with other letters, and it always echoes a neighbour: the
  // last letter of the word before ("haven't t you", "present t day") or the
  // first letter of the word after ("CCTV f from", "a again", "A Athens").
  // `a` and `I` are words, so they get their own pattern rather than being
  // swept up by the general one, which would eat the article in "Rita a moment".
  [/\ba a\b/g, 'a'], [/\bA a\b/g, 'A'], [/\bI I\b/g, 'I'],
  [/\b(\w*([B-HJ-Zb-hj-z])) \2\b(?![-'])/g, '$1'],
  // A middle initial looks the same, so only a lowercase letter or a stray
  // article is removed here: "Sean H Harris" keeps its H. The lookbehind is
  // what stops it reading the t of "can't" as a stray before "touch": an
  // apostrophe is a word boundary, so \b alone is not enough.
  [/(?<![A-Za-z'])([a-zAI]) (?=\1[A-Za-z])/g, ''],
  // What is left is a single lowercase letter standing on its own, which no
  // English word is except a and I. Initials are capitals and survive.
  [/ (?![aAIO]\b)[b-hj-z] (?=[A-Za-z])/g, ' '],
  [/\b(\w*s) S\b(?![-'])/g, '$1'], [/\b(\w*t) T\b(?![-'])/g, '$1'],
  // A contraction with a stray letter stuck on the end: They'lI, You'llI.
  [/'l[lI][iI]?\b/g, "'ll"], [/'([sdm])[iI]\b/g, "'$1"],
  [/\bthel\b/g, 'the'], [/\b1I\b/g, 'I'], [/\b1I'/g, "I'"],
  // One-offs read against the picture: a digit for a letter, a letter for a
  // digit, and punctuation standing in for the rest of a word.
  [/\b4o\b/g, '40'], [/\bin 1 1 dimensions\b/g, 'in 11 dimensions'],
  [/\bI'no no\b/g, 'no'], [/\bb−\b/g, 'but'], [/What ;f\b/g, 'What if'],
  [/\bdoesn't r: remember\b/g, "doesn't remember"], [/\bGod,c\b/g, 'God,'],
  [/\bw\/ormwood\b/g, 'Wormwood'], [/\bthe u\.K\.\b/g, 'the UK'],
  [/\bAI orden\b/g, 'Al orden'], [/\butilty\b/g, 'utility'],
  [/\bI an (the|never)\b/g, 'I am $1'], [/\bgonna a make\b/g, 'gonna make'],
  [/\ba of bit rubbish\. Its\b/g, "a bit of rubbish. It's"],
  [/\bmaximize\b/g, 'maximise'], [/\bCategorizing\b/g, 'Categorising'],
  [/\bfertilized\b/g, 'fertilised'],
  // A slash where the OCR meant a letter, or meant nothing. "space/time" and
  // "1918/TB" are real and keep theirs.
  [/\bHow \/is\b/g, 'How is'], [/\bbaby \/is\b/g, 'baby is'], [/\bA\/[Iw]/g, 'Al'],
  [/\bW\/ell\b/g, 'Well'], [/\/(?=you|up|joy)/g, ''], [/\/oe\b/g, 'Joe'], [/\/S this\b/g, 'Is this'],
  // A capital S adrift: an apostrophe-s that lost its apostrophe, or an echo of
  // the next word's first letter.
  [/\b(mum|name|There|dad|Mum|Dad) S\b/g, "$1's"],
  [/\b(But|No|you|You|Just|got|to|Mary|and|had) S (?=[Ss])/g, '$1 '],
  // Read in context: the dictionary cannot arbitrate these because every one of
  // them is a real word in the wrong place.
  [/\bis faling into place\b/g, 'is falling into place'],
  [/\bIts fine, it's\b/g, "It's fine, it's"],
  [/\broaring it's head off\b/g, 'roaring its head off'],
  [/\byour right 1 hand\b/g, 'your right hand'],
  [/\bget after then, warn then\b/g, 'get after them, warn them'],
  // The one place the stray-letter rule guesses wrong: the letter was a misread
  // article, not an echo, so removing it loses a word.
  [/\bMount e campaign\b/g, 'Mount a campaign'],
  // A species, so a capital, wherever the OCR or the reference dropped it.
  [/\bslitheen\b/g, 'Slitheen'], [/\bsontaran\b/g, 'Sontaran'],
  // Neither dictionary can choose between these, so the choice is made here.
  [/\bTalsman\b/g, 'Talisman'], [/\btalsman\b/g, 'talisman'],
  // Found by diffing against an independent transcription of the same episodes.
  [/\bori\b/g, 'or'], [/\bius\b/g, 'us'], [/\briverv\b/g, 'river'],
  [/\bDrE\b/g, 'Dr'], [/\bYout\b/g, 'You'], [/\blnked\b/g, 'linked'],
  [/\bAml right\b/g, 'All right'], [/\bpower overy\b/g, 'power over'],
  // Capitals the OCR dropped to lowercase inside an acronym.
  [/\bUFo\b/g, 'UFO'], [/\bSoS\b/g, 'SOS'],
  // A zero read as the letter o inside a number. Skipped after a letter, so
  // H2O keeps its oxygen.
  [/(?<![A-Za-z])(\d+)[oO](?=(?:th|s)\b)/g, '$10'],
  [/(?<![A-Za-z])(\d+)[oO](?![A-Za-z])/g, '$10'],
  [/\bto9\b/g, 'to'], [/\bNo0+\b/g, 'Noooo'],
  // The sarcasm marker with its exclamation mark read as a one, and a PDF
  // artefact the OCR carried through from the source subtitle.
  [/\(1\)/g, '(!)'], [/\(cid:\) ?/g, ''],
  // Single digits standing in for letters, each read against the picture.
  [/\bo0r\b/g, 'or'], [/(\d), ?O0(\d)\b/g, '$1,00$2'], [/(\d), ?[Oo]o0\b/g, '$1,000'],
  [/\bI1\.I\b/g, "I'll"], [/\bI1\b/g, 'I'],
  [/\b5I-said\b/g, 'I said'], [/\b[Cc]o2\b/g, 'CO2'], [/\bdo6\b/g, 'do'], [/\bI0\b/g, 'I'],
  [/(\d)Ib\b/g, '$1lb'], [/\bChannel l(\d+)/g, 'Channel $1'], [/\bto100\b/g, 'to 100'],
  // "I'll" with the apostrophe lost and the l's read as capital i's. "World
  // War II" is the one place two of them are meant.
  [/\bII1I\b/g, "I'll"], [/\bIII\b/g, "I'll"], [/\bII\.I\b/g, "I'll"], [/'II\b/g, "I'll"],
  [/(?<!War )\bII\b(?= [a-z])/g, "I'll"], [/(?<!War )\bII\b(?![ ]?[A-Za-z])/g, 'I'],
  // Spellings from the wrong side of the Atlantic. The programme is British and
  // so is the rest of the catalogue.
  [/\b([Rr]e)?([Ss])ynchroniz/g, '$1$2ynchronis'], [/\btraveled\b/g, 'travelled'],
  [/\bToward\b/g, 'Towards'], [/\btoward\b/g, 'towards'],
  [/\bmust of\b/g, 'must have'], [/\bdifferent than\b/g, 'different from'],
  [/\bdouble math\b/g, 'double maths'],
];

// Capitals the OCR misreads one letter of: `iS`, `sO`, `HoW`, `AlL`, `ReX`,
// `losS`, `LoS`. The word is right, only its shape is wrong, so the dictionary
// cannot see anything amiss. These decide what the shape should have been.
const KEEP_CAPS = new Set([
  'unit', 'tardis', 'cia', 'fbi', 'dna', 'nasa', 'uk', 'usa', 'bbc', 'nhs', 'raf',
  'suv', 'cctv', 'mri', 'emf', 'usb', 'ufo', 'sos', 'ptsd', 'icu', 'hr', 'pr',
  'dc', 'la', 'un', 'tv', 'id', 'ok', 'mrsa', 'edta', 'soi', 'rspca', 'atm', 'it',
  'ii', 'iii', 'iv', 'aka', 'ceo', 'gps', 'dvd', 'cd', 'pc', 'mp', 'hq',
]);
const KEEP_SHAPE = new Set(['phicorp', 'ebay', 'iphone', 'ipad', 'macbook', 'itv']);
const looksMac = (w) => /^(Mc|Mac|O'|De|Van|Le)[A-Z]/.test(w);

/** How a token should be written, or null to leave it alone. */
function recase(w, atStart, plausible, count, next) {
  const lower = w.toLowerCase();
  if (KEEP_SHAPE.has(lower) || looksMac(w)) return null;
  // A digit straight after the letters means an acronym carrying a number:
  // CO2, H2O, MI5, K9. Lowercasing CO to "co" undid the fix that made it.
  if (/\d/.test(next || '')) return null;
  const damaged = /[a-z][A-Z]/.test(w);
  const shouted = /^[A-Z]{2,4}$/.test(w);
  if (!damaged && !shouted) return null;
  if (KEEP_CAPS.has(lower)) return w.toUpperCase() === w ? null : w.toUpperCase();
  // A shouted word is only lowered if it is an ordinary one; a name in capitals
  // is a name, and the reference has never heard of it.
  if (shouted && count(lower) < 20) return null;
  // Lowercase is only right for a word the programme uses often. `rex` and
  // `los` appear in the reference once or twice each, which is not evidence
  // that Rex Matheson and Los Angeles want small letters.
  const title = w[0].toUpperCase() + lower.slice(1);
  if (!plausible(lower) || count(lower) < 20) return title === w ? null : title;
  const want = atStart ? title : lower;
  return want === w ? null : want;
}

// Words that survive a transformation but should not: names, abbreviations and
// the odd bit of Italian. Without these the dictionary turns Los Angeles into
// Loss Angeles and Sal Maranzano into Sail.
const NEVER = new Set([
  'los', 'sal', 'sol', 'il', 'ops', 've', 'se', 'sen', 'dis', 'bef', 'ber', 'bol',
  'mil', 'bots', 'bled', 'swab', 'carer', 'wek', 'mot', 'asses', 'pots', 'filing',
  'eliot', 'mon', 'll', 'bail', 'thang', 'lp', 'lt', 'ie', 'iit', 'lon', 'arn', 'serf', 'ane',
]);

// Transformations tried against the dictionary, in no particular order: the
// rule is that exactly one of them may succeed.
function candidates(w) {
  const out = new Set();
  // The dot on an i lost next to an l. This is the big one, and the only place
  // a letter is inserted rather than swapped.
  for (let i = 0; i < w.length; i++) {
    if (w[i].toLowerCase() === 'l') {
      out.add(w.slice(0, i + 1) + 'i' + w.slice(i + 1));
      out.add(w.slice(0, i) + 'i' + w.slice(i));
    }
  }
  // A doubled letter collapsed to one, but only a doubled l. Allowing any
  // letter turns Los into Loss, swab into swabb and asses into assess: short
  // words have too many neighbours for the dictionary to arbitrate.
  for (let i = 0; i < w.length; i++) {
    if (w[i].toLowerCase() === 'l') out.add(w.slice(0, i + 1) + w[i] + w.slice(i + 1));
  }
  // An m read as an n, which happens at the end of a word and in the middle:
  // systen, fron, tine, hin. Three letters is enough here because the change is
  // so narrow.
  if (w.length >= 3) {
    for (let i = 0; i < w.length; i++) {
      if (w[i].toLowerCase() === 'n') out.add(w.slice(0, i) + (w[i] === 'N' ? 'M' : 'm') + w.slice(i + 1));
    }
  }
  // Glyphs that look alike. Only on words of four letters or more, for the same
  // reason: below that almost anything reaches a real word. `v` for `w` is the
  // Sarah Jane DVDs' own habit: pover, vest Coast, avay, Varriors.
  if (w.length >= 4) {
    // A lowercase l standing in for a capital I at the front of a word:
    // `ldentify` is `Identify`. Only accepted if the result is a real word.
    if (w[0] === 'l') out.add('I' + w.slice(1));
    for (const [from, to] of [['1', 'l'], ['1', 'i'], ['0', 'o'], ['5', 's'], ['I', 'l'], ['v', 'w'], ['V', 'W']]) {
      for (let i = 0; i < w.length; i++) {
        if (w[i] === from) out.add(w.slice(0, i) + to + w.slice(i + 1));
      }
    }
  }
  out.delete(w);
  return [...out];
}

// A letter stuck to the end or the front of a word was worth a general rule
// until it was tested: trimming turned MRSA into MRS, eBay into Bay, Yorke into
// York and Harders into Harder. A name is exactly a word no dictionary knows,
// which is the same thing the rule was keying on, so the two cannot be told
// apart that way. The real cases are in HAND instead, one line each.

// The stray-letter patterns above work a line at a time, so a duplicate that
// straddles the line break inside a cue slips past them: "go for a / a walk".
// Only a single letter or a short pronoun is treated as a duplicate here;
// "that that" and "never never" are English.
const DUP_OK = /^([A-Za-z]|you|we|it|he|she|they)$/i;
function joinDupes(lines) {
  if (!lines.length) return lines;
  const out = [lines[0]];
  for (let i = 1; i < lines.length; i++) {
    const prev = out[out.length - 1].split(' ');
    const next = lines[i].split(' ');
    const a = prev[prev.length - 1].replace(/[^A-Za-z']/g, '');
    const b = next[0].replace(/[^A-Za-z']/g, '');
    if (a && a.toLowerCase() === b.toLowerCase() && DUP_OK.test(a) && next.length > 1) {
      out.push(next.slice(1).join(' '));
    } else {
      out.push(lines[i]);
    }
  }
  return out;
}

const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d).sort()) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.srt')) files.push(p);
  }
})(inRoot);

const applied = new Map();
const ambiguous = new Map();
const leftover = new Map();
const context = new Map();
const bump = (map, key) => map.set(key, (map.get(key) || 0) + 1);

for (const file of files) {
  const rel = path.relative(inRoot, file).replace(/\\/g, '/');
  const raw = fs.readFileSync(file, 'utf8');
  const bom = raw.charCodeAt(0) === 0xfeff;
  let text = (bom ? raw.slice(1) : raw).replace(/\r\n/g, '\n');

  const out = text.split(/\n{2,}/).map((block) => {
    const lines = block.split('\n');
    const t = lines.findIndex((x) => x.includes('-->'));
    if (t < 0) return block;
    // Whether a word starts a sentence is a question about the cue, not the
    // line: a cue wrapped onto a second line usually breaks mid-sentence, and
    // treating that second line as a fresh start capitalised half of them.
    let said = '';
    const body = joinDupes(lines.slice(t + 1)).map((line) => {
      let l = line;
      for (const [re, to] of GLYPH_PUNCT) {
        l = l.replace(re, (...m) => { bump(applied, `${m[0]} -> ${to}`); return to; });
      }
      for (const [re, to] of HAND) {
        l = l.replace(re, (...m) => {
          bump(applied, `${m[0]} -> ${typeof to === 'string' ? to.replace(/\$(\d)/g, (_, d) => m[+d]) : to(...m)}`);
          return typeof to === 'string' ? to.replace(/\$(\d)/g, (_, d) => m[+d]) : to(...m);
        });
      }
      // Named glyphs before the sweep, or the sweep takes their word with them.
      for (const [re, to] of [...GLYPH_WORDS, ...GLYPH]) {
        l = l.replace(re, (...m) => { bump(applied, `${m[0]} -> ${to}`); return to; });
      }
      const done = l.replace(/[A-Za-z][A-Za-z']*/g, (w, at) => {
        const before = said + ' ' + l.slice(0, at);
        const atStart = !/[A-Za-z]/.test(before) || /[.!?]["']?[\s-]*$/.test(before);
        const shaped = recase(w, atStart, plausible, (x) => VOCAB.get(x) || 0, l[at + w.length]);
        if (shaped) { bump(applied, `${w} -> ${shaped}`); w = shaped; }
        // "Imean", "Ihope", "lask": the space after a lone I went missing, or
        // the I was read as an l. Only split when the whole thing is not itself
        // a word and what follows the I is a common one, so `lamp` and `Iceland`
        // survive and `lask` becomes "I ask".
        const corrected = CORRECTIONS.get(w.toLowerCase());
        if (corrected) {
          // Keep the shape: a correction at the start of a sentence stays
          // capitalised, and one in the middle does not gain a capital.
          const fixed = /^[A-Z]/.test(w) && /^[a-z]/.test(corrected)
            ? corrected[0].toUpperCase() + corrected.slice(1)
            : corrected;
          bump(applied, `${w} -> ${fixed}`);
          return fixed;
        }
        if (!atStart && overCapitalised(w)) {
          const lowered = w[0].toLowerCase() + w.slice(1);
          bump(applied, `${w} -> ${lowered}`);
          w = lowered;
        }
        const glued = w.match(/^[Il]([a-z]{2,})$/);
        if (glued && !plausible(w) && (VOCAB.get(glued[1].toLowerCase()) || 0) >= 20) {
          bump(applied, `${w} -> I ${glued[1]}`);
          return `I ${glued[1]}`;
        }
        const bare = w.replace(/^'+|'+$/g, '');
        // `plausible` rather than `known` here. A word the reference has seen
        // even three times is a word, and correcting it does harm: `worn` was
        // becoming `worm` because it fell under the FLOOR the target must clear.
        if (!bare || plausible(bare) || NEVER.has(bare.toLowerCase())) return w;
        let hits = candidates(bare).filter(known);
        // Several answers can be words. Take the one the programme actually
        // uses, but only when it is clearly ahead: `ofi` is `of` and not `fi`,
        // `Talsman` is `Talisman` and not `Tailsman`, while `thang` could be
        // `than` or `hang` and stays as it is.
        if (hits.length > 1) {
          const ranked = hits.slice().sort((a, b) => (VOCAB.get(b.toLowerCase()) || 0) - (VOCAB.get(a.toLowerCase()) || 0));
          const top = VOCAB.get(ranked[0].toLowerCase()) || 0;
          const next = VOCAB.get(ranked[1].toLowerCase()) || 0;
          if (top >= 20 && top >= next * 5) hits = [ranked[0]];
        }
        if (hits.length === 1) {
          // Keep the shape of the original: a capitalised misreading stays
          // capitalised, so `Sltheen` becomes `Slitheen` and not `slitheen`.
          const fixed = /^[A-Z]/.test(bare) ? hits[0][0].toUpperCase() + hits[0].slice(1) : hits[0];
          bump(applied, `${bare} -> ${fixed}`);
          return w.replace(bare, fixed);
        }
        if (hits.length > 1) { bump(ambiguous, `${bare} -> ${hits.join(' / ')}`); return w; }
        if (!plausible(bare)) {
          bump(leftover, bare);
          if (!context.has(bare)) context.set(bare, `${rel}: ${line.trim().slice(0, 66)}`);
        }
        return w;
      });
      said += ' ' + done;
      return done;
    });
    return [...lines.slice(0, t + 1), ...body].join('\n');
  }).join('\n\n');

  if (!dry) {
    const dest = path.join(outRoot, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, (bom ? '﻿' : '') + out.replace(/\n/g, '\r\n'));
  }
}

const show = (title, map, n, withContext) => {
  const rows = [...map].sort((a, b) => b[1] - a[1]);
  console.log(`\n== ${title}: ${rows.reduce((s, r) => s + r[1], 0)} in ${rows.length} forms`);
  for (const [k, c] of rows.slice(0, n)) {
    console.log(`  ${String(c).padStart(4)}  ${withContext ? `${k.padEnd(22)}${context.get(k) || ''}` : k}`);
  }
  if (rows.length > n) console.log(`  ... and ${rows.length - n} more`);
};

console.log(`${files.length} files`);
show("fixed", applied, 400);
show('ambiguous, left alone', ambiguous, 40);
show('unknown, left alone', leftover, 40, true);
// The full list is too long to read on screen and too useful to throw away:
// it is what a person has to go through after the dictionary has done its part.
if (!dry) {
  const review = [...leftover].sort((a, b) => b[1] - a[1])
    .map(([w, c]) => `${c}\t${w}\t${context.get(w) || ''}`).join('\n');
  fs.writeFileSync(path.join(outRoot, '..', 'ocr-review.txt'), review + '\n');
  console.log(`\nfull list written to ${path.join(outRoot, '..', 'ocr-review.txt')}`);
}
if (dry) console.log('\nreport only. drop --dry to write.');
