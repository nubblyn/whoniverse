#!/usr/bin/env python3
"""Pull the word stream out of YouTube's rolling auto-captions.

    python words.py            writes subs/<id>.words.json and subs/<id>.txt

YouTube serves automatic captions as a scrolling two-line display: each cue
repeats the previous line and adds a new one, with a 10ms filler cue between
every pair. Converting that to SRT keeps the duplication, which is why the
first attempt produced subtitles that say everything twice.

The useful content is underneath: each new line carries a per-word timestamp as
`word<00:00:03.759><c> next</c>`. Reading those gives one word stream with a
time on every word, which is what lets the text be re-punctuated and then cut
into cues at sentence boundaries rather than at YouTube's arbitrary line wraps.
"""
import glob
import io
import json
import os
import re

SUBS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'subs')
CUE = re.compile(r'^(\d\d:\d\d:\d\d\.\d\d\d) --> (\d\d:\d\d:\d\d\.\d\d\d)')
TAG = re.compile(r'<(\d\d:\d\d:\d\d\.\d\d\d)><c>(.*?)</c>')


def secs(t):
    h, m, s = t.split(':')
    return int(h) * 3600 + int(m) * 60 + float(s)


def parse(path):
    """[(word, start)] in order, duplicates from the scroll removed."""
    text = io.open(path, encoding='utf8').read().splitlines()
    words, i, prev = [], 0, None
    while i < len(text):
        m = CUE.match(text[i])
        if not m:
            i += 1
            continue
        start = secs(m.group(1))
        body = []
        i += 1
        while i < len(text) and not CUE.match(text[i]) and text[i].strip() != 'WEBVTT':
            body.append(text[i])
            i += 1
        # In the scroll, the last body line is the new one and everything
        # above it is the previous line repeated. Usually the new line carries
        # inline <time><c> tags, but a line holding a single word carries none
        # at all, so keying off the tags alone silently drops those words.
        body = [ln for ln in body if ln.strip()]
        if not body:
            continue
        line = body[-1]
        # The 10ms filler cues between every pair hold nothing but the previous
        # line, so "last line" alone would emit every line twice. Compare
        # against what was emitted last and skip the repeat.
        plain = re.sub(r'<[^>]*>', '', line).strip()
        if not plain or plain == prev:
            continue
        prev = plain
        if '<c>' in line:
            first = line.split('<', 1)[0].strip()
            if first:
                words.append((first, start))
            for t, w in TAG.findall(line):
                w = w.strip()
                if w:
                    words.append((w, secs(t)))
        else:
            # untagged: one timestamp for the whole line, which for the
            # one-word case it is exactly right for
            for w in line.split():
                words.append((w, start))
    return words


def main():
    for p in sorted(glob.glob(os.path.join(SUBS, '*.en-orig.vtt'))):
        vid = os.path.basename(p).split('.')[0]
        words = parse(p)
        if not words:
            print('  ! %s no word timings' % vid)
            continue
        json.dump(words, io.open(os.path.join(SUBS, vid + '.words.json'), 'w',
                                 encoding='utf8'))
        io.open(os.path.join(SUBS, vid + '.txt'), 'w', encoding='utf8',
                newline='\n').write(' '.join(w for w, _ in words) + '\n')
        print('  %-14s %4d words, %5.1fs to %5.1fs' %
              (vid, len(words), words[0][1], words[-1][1]))


if __name__ == '__main__':
    main()
