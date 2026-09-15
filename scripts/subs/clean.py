#!/usr/bin/env python3
"""The two repairs whisper's output needs, applied where they are safe.

Imported by srtify.py; run directly to see what it would change.

    python clean.py

Repetition. When the audio tails off into music or silence whisper sometimes
emits the line it just finished a second time. The safe signature is narrow: a
segment whose text is contained in the one before it AND which is under 0.8
seconds long. A real repeated line takes as long to say as the first one did,
which is how the echoed close of the Pompadour short survives this.

Casing. Whole segments come back lowercase with no end punctuation, usually the
last one or two in a file. Sentence case is restored, the show's proper nouns
are put back, a trailing vocative gets its comma and an opening interrogative
gets its question mark. Nothing is reworded: a garbled phrase stays garbled
rather than being replaced with a guess at what was said.
"""
import io
import json
import os
import re

NOUNS = {
    'doctor': 'Doctor', 'tardis': 'TARDIS', 'dalek': 'Dalek', 'daleks': 'Daleks',
    'cyberman': 'Cyberman', 'cybermen': 'Cybermen', 'zygon': 'Zygon',
    'zygons': 'Zygons', 'gallifrey': 'Gallifrey', 'sontaran': 'Sontaran',
    'unit': 'UNIT', 'osgood': 'Osgood', 'clara': 'Clara', 'amy': 'Amy',
    'rory': 'Rory', 'missy': 'Missy', 'versailles': 'Versailles',
}
REPEAT_MAX = 0.8

# Corrections that need a listener, not a rule. Whisper runs two sentences
# together where the delivery pauses but the grammar does not, and no heuristic
# can tell that from a genuine run-on. Keyed by file stem; each entry is checked
# against the transcript and reported if it stops matching, so a silent no-op
# cannot creep in.
OVERRIDES = {
    'S02_E05_pompadour_minisode': [
        ('on my skin where am I, Doctor?',
         'on my skin? Where am I, Doctor?'),
    ],
}
# A line opening with one of these and carrying no end mark is a question.
ASKS = ('why', 'what', 'where', 'when', 'who', 'how', 'which', 'can', 'could',
        'do', 'does', 'did', 'is', 'are', 'am', 'will', 'would', 'shall',
        'should', 'have', 'has', 'had')
ENDS = tuple('.!?…"\'')
# Before these, "Doctor" is the subject rather than someone being addressed.
DETS = ('the', 'a', 'an', 'my', 'your', 'our', 'their', 'his', 'her',
        'this', 'that', 'good', 'mad', 'war', 'first', 'last')


def fix_case(t):
    """Sentence case plus the show's proper nouns. Wording is left alone."""
    t = t.strip()
    if not t:
        return t
    out, cap = [], True
    for w in t.split():
        core = re.sub(r"[^a-z']", '', w.lower())
        if core in NOUNS:
            w = NOUNS[core] + w[len(core):]
        elif core == 'i' or core.startswith("i'"):
            w = 'I' + w[1:]
        if cap and w[:1].isalpha():
            w = w[0].upper() + w[1:]
        cap = bool(re.search(r'[.!?]$', w))
        out.append(w)
    s = ' '.join(out)
    # Direct address takes a comma: "Where am I, Doctor" not "Where am I
    # Doctor". Not after a determiner, where it is the subject and not an
    # address at all: "I am the Doctor" has to stay as it is.
    m = re.search(r"\b([A-Za-z']+)\s+(Doctor)\b([^a-zA-Z]*)$", s)
    if m and m.group(1).lower() not in DETS:
        s = s[:m.start()] + m.group(1) + ', ' + m.group(2) + m.group(3)
    if not s.endswith(ENDS):
        s += '?' if s.split()[0].lower().strip("',") in ASKS else '.'
    return s


def clean(data, log=None, stem=None):
    """Drop repetition artefacts, restore casing. Returns the kept segments."""
    kept = []
    for i, seg in enumerate(data):
        t = seg['text'].strip()
        dur = seg['end'] - seg['start']
        prev = kept[-1]['text'].strip().lower() if kept else ''
        bare = t.lower().strip('.,!?… ')
        if kept and bare and bare in prev and dur <= REPEAT_MAX:
            if log is not None:
                log.append(('drop', i, '%.2fs  %s' % (dur, t[:52])))
            continue
        letters = [c for c in t if c.isalpha()]
        if letters and not any(c.isupper() for c in letters):
            new = fix_case(t)
            if log is not None:
                log.append(('case', i, '%s  ->  %s' % (t[:34], new[:34])))
            seg = dict(seg, text=new)
        kept.append(seg)

    for old, new in OVERRIDES.get(stem or '', []):
        hit = False
        for seg in kept:
            if old in seg['text']:
                seg['text'] = seg['text'].replace(old, new)
                hit = True
        if log is not None:
            log.append(('fix' if hit else 'STALE', -1,
                        '%s  ->  %s' % (old[:34], new[:34])))
    return kept


if __name__ == '__main__':
    import glob
    SUBS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'subs')
    for p in sorted(glob.glob(os.path.join(SUBS, '*.whisper.json'))):
        data = json.load(io.open(p, encoding='utf8'))
        log = []
        name = os.path.basename(p)[:-len('.whisper.json')]
        kept = clean(data, log, stem=name)
        print('%-52s %3d -> %3d' % (name[:52], len(data), len(kept)))
        for kind, i, why in log:
            print('    %-5s %3d  %s' % (kind, i, why))
