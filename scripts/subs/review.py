#!/usr/bin/env python3
"""Flag the two things whisper gets wrong on these files.

    python review.py

Neither is rare enough to trust the output unread. It drops capitalisation and
end punctuation on trailing segments, and it repeats a phrase when the audio
tails off into silence or music. Both were visible in the first file
transcribed, so every file gets checked rather than spot-checked.
"""
import glob
import io
import json
import os
import re

SUBS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'subs')


def main():
    for p in sorted(glob.glob(os.path.join(SUBS, '*.whisper.json'))):
        name = os.path.basename(p)[:-len('.whisper.json')]
        data = json.load(io.open(p, encoding='utf8'))
        lower, repeats = [], []
        texts = [s['text'].strip() for s in data]
        for i, t in enumerate(texts):
            letters = [c for c in t if c.isalpha()]
            if letters and not any(c.isupper() for c in letters):
                lower.append(i)
            # a segment wholly contained in the one before it
            if i and t and t.lower().strip('.,!? ') in texts[i - 1].lower():
                repeats.append(i)
        print('%-52s %3d segs  lower=%s  repeat=%s'
              % (name[:52], len(data), lower or '-', repeats or '-'))
        for i in lower[:3]:
            print('      %2d  %s' % (i, texts[i][:72]))
        for i in repeats[:3]:
            print('    R %2d  %s' % (i, texts[i][:72]))


if __name__ == '__main__':
    main()
