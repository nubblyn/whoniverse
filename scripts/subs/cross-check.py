#!/usr/bin/env python3
"""Compare our subtitles against a second transcription of the same episodes.

    python scripts/subs/cross-check.py <ours> <theirs> [--all]

Fetch the other set with fetch-external.js. It is somebody else's work on the
same programme, so most differences are simply two people writing the same
speech differently: "OK" against "Okay", a line broken in another place, a
"Yeah" nobody bothered to type. Reporting all of that would bury the point.

So this only reports a difference where ours looks like the mistake. The words
are lined up with a sequence match, and a substitution is worth showing when
the two words are close enough to be the same word read two ways, and ours is
the one no dictionary recognises. `lke` against `like` is reported; `OK`
against `Okay` is not. `--all` drops the filter, for when you want to read
everything.
"""
import collections
import difflib
import gzip
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
ENGLISH = set(gzip.decompress((HERE / 'english.txt.gz').read_bytes()).decode().split())
VOCAB = {}
for line in (HERE / 'vocab.txt').read_text(encoding='utf8').splitlines():
    if not line:
        continue
    parts = line.split('\t')
    VOCAB[parts[0]] = int(parts[1])

SUFFIX = ("'s", "'ll", "'ve", "'d", "'re", "'m", "n't")


def real_word(w):
    if w in VOCAB or w in ENGLISH or w.replace("'", '') in ENGLISH:
        return True
    return any(w.endswith(s) and w[:-len(s)] in ENGLISH for s in SUFFIX)


def words(path):
    """Every spoken word in the file, lower case, in order."""
    out = []
    text = path.read_text('utf8', errors='replace').replace('﻿', '').replace('\r', '')
    for block in text.split('\n\n'):
        lines = block.split('\n')
        i = next((i for i, x in enumerate(lines) if '-->' in x), None)
        if i is None:
            continue
        body = ' '.join(lines[i + 1:])
        body = re.sub(r'<[^>]+>', '', body)
        body = re.sub(r'[\[(][^\])]*[\])]', '', body)
        for w in re.findall(r"[A-Za-z][A-Za-z']*", body):
            out.append(w.lower().strip("'"))
    return [w for w in out if w]


def close(a, b):
    """Two spellings of one word, rather than two different words."""
    if abs(len(a) - len(b)) > 3:
        return False
    return difflib.SequenceMatcher(None, a, b).ratio() >= 0.6


def main():
    ours_root = pathlib.Path(sys.argv[1])
    theirs_root = pathlib.Path(sys.argv[2])
    show_all = '--all' in sys.argv

    pairs = []
    for p in sorted(ours_root.rglob('*.srt')):
        rel = p.relative_to(ours_root)
        other = theirs_root / rel
        if not other.exists():
            other = next((q for q in theirs_root.rglob(p.name)), None)
        if other:
            pairs.append((rel, p, other))
    if not pairs:
        sys.exit('no episode has both a subtitle here and one there')

    # How often each word appears across everything we have. A name the
    # programme uses recurs; a misreading usually does not. Whisper mishears
    # Kaagh and Androvax every time, and this is how those get told apart from
    # a real mistake without reading all of them.
    ours_count = collections.Counter()
    for _, mine, _ in pairs:
        ours_count.update(words(mine))

    total = 0
    checked = 0
    for rel, mine, other in pairs:
        a, b = words(mine), words(other)
        if len(a) < 50 or len(b) < 50:
            continue
        checked += 1
        found = []
        for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
            if tag != 'replace' or i2 - i1 != 1 or j2 - j1 != 1:
                continue
            ours, theirs = a[i1], b[j1]
            if not show_all:
                if real_word(ours) or not real_word(theirs) or not close(ours, theirs):
                    continue
            found.append((ours, theirs, ours_count[ours], ' '.join(a[max(0, i1 - 5):i1 + 6])))
        if found:
            print(f'\n== {str(rel).replace(chr(92), "/")}  ({len(found)})')
            for ours, theirs, seen, ctx in found[:40]:
                mark = f'x{seen}' if seen > 2 else '  '
                print(f'  {ours:18} -> {theirs:18} {mark:5} {ctx}')
            if len(found) > 40:
                print(f'  ... and {len(found) - 40} more')
        total += len(found)

    print(f'\n{checked} episodes compared, {total} differences worth a look')
    if not show_all:
        print('add --all to see every difference, including the two-transcriptions ones')


if __name__ == '__main__':
    main()
