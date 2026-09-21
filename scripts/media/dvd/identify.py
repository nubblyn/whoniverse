#!/usr/bin/env python3
"""Say which ripped DVD title is which episode, from the audio.

Durations could not settle it and MakeMKV's own title naming does not group
cleanly on every disc, so the test is the sound. Both the DVD and the copy in
the bucket descend from the same broadcast master, so their loudness envelopes
line up once the few seconds of offset between them is searched out.

For each candidate and each episode a 180 s window of mono 16 kHz audio is
reduced to an RMS envelope at 20 Hz, normalised, and cross-correlated over
+/- 40 s of lag. The best lag's correlation is the score. Assignment is greedy
best-first and one to one, and anything under THRESHOLD is left unassigned
rather than forced.

    python scripts/media/dvd/identify.py <serial> [more serials...]
"""
import io
import os
import re
import subprocess
import sys

import numpy as np

HELD = {}

RAW = os.path.expanduser('~/Downloads/content/classic_who/raw')
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
B2 = 'https://f003.backblazeb2.com/file/whoniverse/classic_who/season_1'
START, DUR, SR, HOP = 300.0, 180.0, 16000, 800     # 800 samples = 20 Hz
MAXLAG = int(40 * SR / HOP)
THRESHOLD = 0.55
CACHE = os.path.join(RAW, 'env')


def rows():
    out = []
    for i, l in enumerate(io.open(os.path.join(HERE, 's1map.tsv'), encoding='utf8')):
        if i == 0 or not l.strip():
            continue
        ep, serial, iso, title, secs = l.rstrip('\n').split('\t')
        out.append(dict(ep=int(ep), serial=int(serial), title=title, secs=float(secs)))
    return out


def held_ext():
    """stem -> extension as the bucket actually holds it. Marco Polo is .mp4
    while the rest of the season is .mkv, and assuming .mkv made ffmpeg return
    an empty stream rather than an error."""
    f = os.path.join(ROOT, 'ledger', 'out', 'bucket-index.txt')
    out = {}
    for l in io.open(f, encoding='utf8'):
        l = l.strip()
        if l.startswith('classic_who/season_1/'):
            n = l.split('/')[-1]
            stem, _, ext = n.rpartition('.')
            if ext in ('mkv', 'mp4', 'm4v'):
                out[stem] = ext
    return out


def stems():
    f = os.path.join(ROOT, 'ledger', 'out', 'file-names.tsv')
    rs = [l.rstrip('\n').split('\t') for l in io.open(f, encoding='utf8') if l.strip()]
    h = rs[0]
    out = {}
    for r in rs[1:]:
        d = dict(zip(h, r))
        if d['series'] == 'classic-who' and d['season'] == '1':
            out[int(d['episode'])] = d['file_name']
    return out


def envelope(src, key):
    """RMS envelope of a 180 s window, cached so a re-run costs nothing."""
    os.makedirs(CACHE, exist_ok=True)
    cp = os.path.join(CACHE, key + '.npy')
    if os.path.exists(cp):
        return np.load(cp)
    p = subprocess.run(
        ['ffmpeg', '-v', 'error', '-ss', str(START), '-t', str(DUR), '-i', src,
         '-map', '0:a:0', '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
        capture_output=True)
    a = np.frombuffer(p.stdout, dtype='<i2').astype(np.float32)
    if a.size < SR * 30:
        raise SystemExit('only %d samples from %s' % (a.size, src))
    n = a.size // HOP
    e = np.sqrt((a[:n * HOP].reshape(n, HOP) ** 2).mean(axis=1))
    e = e - e.mean()
    e = e / (np.linalg.norm(e) or 1.0)
    np.save(cp, e)
    return e


def score(a, b):
    """Best normalised correlation over the lag range, and the lag."""
    best, bl = -1.0, 0
    for lag in range(-MAXLAG, MAXLAG + 1):
        x, y = (a[lag:], b[:len(b) - lag]) if lag >= 0 else (a[:len(a) + lag], b[-lag:])
        n = min(len(x), len(y))
        if n < len(a) // 2:
            continue
        x, y = x[:n], y[:n]
        d = (np.linalg.norm(x) * np.linalg.norm(y)) or 1.0
        c = float(np.dot(x, y) / d)
        if c > best:
            best, bl = c, lag
    return best, bl * HOP / SR


def main():
    global HELD
    R, st = rows(), stems()
    HELD = held_ext()
    cands = [l.rstrip('\n').split('\t') for l in
             io.open(os.path.join(RAW, 'candidates.tsv'), encoding='utf8') if l.strip()]
    for arg in sys.argv[1:]:
        # "4:2" restricts serial 4 to disc 2; the Marco Polo reconstruction
        # ships as two discs of the same seven episodes and disc 2 is the one
        # worth having, so the choice is made here rather than by correlation,
        # which would only ever pick whichever disc the held copy came from.
        serial, _, disc = arg.partition(':')
        serial, disc = int(serial), int(disc) if disc else None
        eps = [r for r in R if r['serial'] == serial]
        cs = [c for c in cands if int(c[1]) == serial
              and (disc is None or int(c[2]) == disc)]
        print('=== serial %d%s: %d candidates, %d episodes'
              % (serial, ' disc %d' % disc if disc else '', len(cs), len(eps)))
        E = {}
        for r in eps:
            ext = HELD.get(st[r['ep']], 'mkv')
            E[r['ep']] = envelope('%s/%s.%s' % (B2, st[r['ep']], ext), 'held_%d' % r['ep'])
        C = {c[0]: envelope(os.path.join(RAW, c[0] + '.mkv'), c[0]) for c in cs}
        grid = []
        for ep in sorted(E):
            for tag in C:
                s, lag = score(E[ep], C[tag])
                grid.append((s, ep, tag, lag))
        grid.sort(reverse=True)
        taken_e, taken_t, out = set(), set(), []
        for s, ep, tag, lag in grid:
            if s < THRESHOLD or ep in taken_e or tag in taken_t:
                continue
            taken_e.add(ep)
            taken_t.add(tag)
            out.append((ep, tag, s, lag))
        for ep, tag, s, lag in sorted(out):
            r = [x for x in eps if x['ep'] == ep][0]
            print('  ep%-3d %-28s %-12s r=%.3f lag=%+.2fs' % (ep, r['title'][:28], tag, s, lag))
        for r in eps:
            if r['ep'] not in taken_e:
                best = max((g for g in grid if g[1] == r['ep']), default=None)
                print('  ep%-3d %-28s UNMATCHED best %s' % (r['ep'], r['title'][:28], best and (round(best[0], 3), best[2])))
        for tag in sorted(set(C) - taken_t):
            best = max((g for g in grid if g[2] == tag), default=None)
            print('  spare %-12s not an episode; closest %s' % (tag, best and (round(best[0], 3), 'ep%d' % best[1])))
        with io.open(os.path.join(RAW, 'identified.tsv'), 'a', encoding='utf8') as fh:
            for ep, tag, s, lag in sorted(out):
                fh.write('%d\t%s\t%s\t%.4f\t%.2f\n' % (ep, tag, st[ep], s, lag))


main()
