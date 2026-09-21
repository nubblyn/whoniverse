#!/usr/bin/env python3
"""Turn the whisper transcripts into subtitles in the catalogue's house style.

    python srtify.py            check, print what each file would become
    python srtify.py --write    write the .srt beside each video

House style, from what the discs do and what the Classic conversion matched:
at most two lines a cue, at most 42 characters a line, no markup. Speaker dashes
are not emitted: whisper gives no speaker labels, and the style only dashes two
speakers sharing one cue, so a missing dash here is never wrong.

Cues are cut at sentence ends where the length allows, then at clause
boundaries, and only then mid-clause. Timing comes from whisper's per-word
timestamps, so a cue starts on its first word and ends on its last rather than
being stretched to fill the gap to the next one.
"""
import glob
import io
import json
import os
import re
import sys

import clean

SP = os.path.dirname(os.path.abspath(__file__))
SUBS = os.path.join(SP, 'subs')
# Which series' staging tree to write beside. New Who by default because
# that is what this was written for; SUBS_CONTENT points it elsewhere,
# e.g. SUBS_CONTENT=~/Downloads/content/classic_who for a Classic season.
CONTENT = os.path.expanduser(os.environ.get(
    'SUBS_CONTENT', os.path.join('~', 'Downloads', 'content', 'new_who')))

MAX_LINE = 42
MIN_CUE = 16          # below this, hold a sentence back and join the next
MIN_DUR = 1.2
MAX_DUR = 7.0
TAIL = 0.35           # let a cue linger a little past its last word
SENT = re.compile(r'[.!?]["\')\]]?$')
CLAUSE = re.compile(r'[,;:]["\')\]]?$')


def stamp(t):
    t = max(t, 0.0)
    h, m = int(t // 3600), int(t % 3600 // 60)
    s = t % 60
    return '%02d:%02d:%02d,%03d' % (h, m, int(s), round((s - int(s)) * 1000))


def wrap(text):
    """One or two lines, each within MAX_LINE, split as evenly as it can."""
    if len(text) <= MAX_LINE:
        return [text]
    words = text.split()
    best = None
    for i in range(1, len(words)):
        a, b = ' '.join(words[:i]), ' '.join(words[i:])
        if len(a) <= MAX_LINE and len(b) <= MAX_LINE:
            score = abs(len(a) - len(b))
            if best is None or score < best[0]:
                best = (score, a, b)
    return [best[1], best[2]] if best else [text]


def fits(text):
    """Can this be shown in at most two lines of MAX_LINE characters?

    Length alone is not the test. A 78-character cue is under two full lines
    and still fails when no word boundary falls in the narrow window where both
    halves come in under the limit, so ask wrap() rather than guessing.
    """
    lines = wrap(text)
    return len(lines) <= 2 and all(len(l) <= MAX_LINE for l in lines)


def cues_from(words):
    """Group timed words into cues that fit, preferring sentence breaks."""
    out, cur = [], []
    for w in words:
        cur.append(w)
        if not fits(' '.join(x['w'].strip() for x in cur).strip()):
            # back off to the last sentence or clause end inside the cue
            cut = None
            for i in range(len(cur) - 2, 0, -1):
                t = cur[i]['w'].strip()
                if SENT.search(t):
                    cut = i + 1
                    break
            if cut is None:
                for i in range(len(cur) - 2, 0, -1):
                    if CLAUSE.search(cur[i]['w'].strip()):
                        cut = i + 1
                        break
            if cut is None or cut < 2:
                cut = len(cur) - 1
            out.append(cur[:cut])
            cur = cur[cut:]
        # Checked after the split as well as instead of it: backing off to a
        # clause can leave a remainder that already ends a sentence, and an
        # elif here let that run on into the next one.
        if cur:
            text = ' '.join(x['w'].strip() for x in cur).strip()
            if SENT.search(cur[-1]['w'].strip()) and len(text) >= MIN_CUE:
                out.append(cur)
                cur = []
    if cur:
        out.append(cur)
    return [c for c in out if c]


def build(path):
    stem = os.path.basename(path)[:-len('.whisper.json')]
    data = clean.clean(json.load(io.open(path, encoding='utf8')), stem=stem)
    # clean() rewrites segment text but the per-word entries still carry the
    # old casing, and the cue text is built from those. Push the corrected
    # tokens back onto the words, which is safe because the repairs never
    # change how many there are.
    for seg in data:
        toks = seg['text'].split()
        ws = [w for w in seg['words'] if w['w'].strip()]
        if len(toks) == len(ws):
            for w, t in zip(ws, toks):
                w['w'] = t
        seg['words'] = ws
    words = [w for seg in data for w in seg['words'] if w['w'].strip()]
    if not words:
        return None, 'no word timings'
    groups = cues_from(words)
    blocks, problems = [], []
    for i, g in enumerate(groups):
        text = ' '.join(x['w'].strip() for x in g).strip()
        text = re.sub(r'\s+', ' ', text)
        lines = wrap(text)
        if len(lines) > 2 or any(len(l) > MAX_LINE for l in lines):
            problems.append(text)
        st = g[0]['s']
        en = g[-1]['e'] + TAIL
        nxt = groups[i + 1][0]['s'] if i + 1 < len(groups) else None
        if nxt is not None:
            en = min(en, nxt - 0.04)
        en = max(en, st + MIN_DUR)
        en = min(en, st + MAX_DUR)
        if nxt is not None and en > nxt - 0.04:
            en = max(st + 0.4, nxt - 0.04)
        blocks.append('%d\n%s --> %s\n%s\n' % (len(blocks) + 1, stamp(st),
                                               stamp(en), '\n'.join(lines)))
    return '\n'.join(blocks), problems


def target_for(name):
    """Where the .srt goes: beside the video it was transcribed from.

    Matches any container, not only .mp4. A Classic season ships .mkv off the
    disc, and looking for .mp4 alone reported "no video to sit beside" for a
    file that was sitting right there.
    """
    for d in sorted(os.listdir(CONTENT)):
        sub = os.path.join(CONTENT, d)
        if not os.path.isdir(sub):
            continue
        for ext in (".mp4", ".mkv", ".m4v"):
            if os.path.exists(os.path.join(sub, name + ext)):
                return os.path.join(sub, name + ".srt")
    return None


def main():
    do = '--write' in sys.argv
    for p in sorted(glob.glob(os.path.join(SUBS, '*.whisper.json'))):
        name = os.path.basename(p)[:-len('.whisper.json')]
        srt, problems = build(p)
        if srt is None:
            print('  ! %-52s %s' % (name[:52], problems))
            continue
        n = srt.count(' --> ')
        flag = '  %d over-long' % len(problems) if problems else ''
        print('  %-52s %3d cues%s' % (name[:52], n, flag))
        for t in (problems or [])[:2]:
            print('        %s' % t[:76])
        if do:
            t = target_for(name)
            if not t:
                print('        ! no video to sit beside')
                continue
            io.open(t, 'w', encoding='utf8', newline='\n').write(srt)


if __name__ == '__main__':
    main()
