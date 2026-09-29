#!/usr/bin/env python3
"""Turn a BBC iPlayer subtitle track's speaker colours into speaker dashes.

    python bbc_colour.py in.srt out.srt

Two changes, the ones the Classic iPlayer tracks got in the 13 September 2026
conversion, and nothing more:

  colour   The BBC marks speakers with <font color=...>, which reads badly over
           the picture, so the colour goes and a dash takes its place: in a cue
           with two or more speakers, the first line of each speaker starts with
           "-", no space after it. A cue with one speaker gets no dash.
  length   A line longer than 42 characters is rewrapped at a word boundary into
           balanced lines of at most 42. A line within 42 keeps the BBC's break.

Everything else is the subtitler's work and stays exactly as it came: the words,
the timings, the cue numbering, and the sound-effect captions.
housestyle.py, which also strips captions, rewraps and retimes, is for Whisper
output only (settled with the user on 28 September 2026).

Two things mark a new speaker: a change of colour, and a line the BBC already
began with a dash. A fresh <font> tag in the same colour on the next line is the
same speaker, since the BBC reopens the tag on every line.
"""
import io
import re
import sys

FONT_OPEN = re.compile(r'<font[^>]*color="?(#?\w+)"?[^>]*>', re.I)
# Only real subtitle markup. The BBC sometimes types a stray "<" in the text
# ("<GUNFIRE" in The Caves of Androzani 4), which a looser pattern ate along with
# the closing </font>, deleting the word.
TAG = re.compile(r'</?(?:font|i|b|u)\b[^>]*>', re.I)


def runs_of(line, colour):
    """[(colour, text)] for one source line, and the colour it ends in."""
    pos, parts = 0, []
    for m in FONT_OPEN.finditer(line):
        if m.start() > pos:
            parts.append((colour, line[pos:m.start()]))
        colour = m.group(1).lower()
        pos = m.end()
    parts.append((colour, line[pos:]))
    return [(c, TAG.sub('', t).strip()) for c, t in parts if TAG.sub('', t).strip()], colour


def fix_cue(lines):
    rows, colour = [], None
    for line in lines:
        runs, colour = runs_of(line, colour)
        for i, (c, t) in enumerate(runs):
            rows.append([c, t, i > 0])     # i > 0: a second colour inside one line
    if not rows:
        return []
    starts, prev = [], object()
    for c, t, mid in rows:
        starts.append(c != prev or bool(re.match(r'^-\s*\S', t)))
        prev = c
    out = []
    speakers = sum(starts)
    for (c, t, mid), s in zip(rows, starts):
        if speakers > 1 and s:
            t = '-' + re.sub(r'^-\s*', '', t)
        if mid and out:
            out.append(t)                  # two colours on one line: the second speaker gets its own line
        else:
            out.append(t)
    return out


MAX = 42


def wrap(line):
    """A line of at most MAX characters, or balanced lines of at most MAX each."""
    if len(line) <= MAX:
        return [line]
    words = line.split()
    for n in range(2, len(words) + 1):          # fewest lines that fit, most even split
        best = None
        def split(ws, k):
            if k == 1:
                yield [' '.join(ws)]
                return
            for i in range(1, len(ws)):
                for rest in split(ws[i:], k - 1):
                    yield [' '.join(ws[:i])] + rest
        for parts in split(words, n) if len(words) <= 24 else []:
            if all(len(x) <= MAX for x in parts):
                score = max(len(x) for x in parts)
                if best is None or score < best[0]:
                    best = (score, parts)
        if best:
            return best[1]
    out, cur = [], ''                              # very long lines: greedy
    for w in words:
        if cur and len(cur) + 1 + len(w) > MAX:
            out.append(cur); cur = w
        else:
            cur = (cur + ' ' + w).strip()
    return out + [cur]


def main(src, dst):
    text = io.open(src, encoding='utf-8-sig').read().replace('\r\n', '\n')
    blocks = re.split(r'\n\s*\n', text.strip())
    out = []
    for b in blocks:
        ls = b.split('\n')
        i = next((k for k, l in enumerate(ls) if '-->' in l), None)
        if i is None:
            continue
        body = [w for line in fix_cue(ls[i + 1:]) for w in wrap(line)]
        if body:
            out.append('\n'.join(ls[:i + 1] + body))
    io.open(dst, 'w', encoding='utf-8', newline='\n').write('\n\n'.join(out) + '\n')
    print('%d cues in, %d out, %d with speaker dashes' % (
        len(blocks), len(out), sum(1 for b in out if re.search(r'^-\S', b, re.M))))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
