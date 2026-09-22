#!/usr/bin/env python3
"""Stage a Collection season's chosen files under their ledger stems, then
prove each one is the episode it claims to be.

    python scripts/media/dvd/collstage.py <season>            link and probe
    python scripts/media/dvd/collstage.py <season> --verify   and check the audio

Staging is hard links, so nothing is copied and the torrent can keep seeding.

The verify step exists because **the episode numbers in these filenames cannot
be trusted**. Season 7's Spearhead from Space is rotated by one - the file
called S7E01 is part 4 - and nothing inside the file says so, since every
container title is just the disc name. Correlating a 180 s loudness envelope
against the copy already in the bucket puts a right answer at 0.7 to 0.99 and
a wrong one near 0.1, which is not a close call. Anything that fails is listed
with its best matches so the real mapping can be read off.

Where a season has no held copy to compare against, fall back to checking the
file durations against a published per-episode runtime list; that is what
confirmed Spearhead independently.
"""
import io
import os
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
PROBE = os.path.expanduser('~/Downloads/content/classic_who/probe')
CACHE_ROOT = os.path.expanduser('~/Downloads/content/classic_who/.envcache')
B2 = 'https://f003.backblazeb2.com/file/whoniverse/classic_who'
SR, HOP = 16000, 800
START, DUR = 300.0, 180.0
MAXLAG = int(45 * SR / HOP)
# Season 8's Claws of Axos part 1 scored 0.213 at +-45 s and matched nothing
# else either, which looks exactly like a mis-mapping and is not one: the held
# copy was a longer cut and the true offset was 47.45 s, just outside the
# window. So a failure is retried this wide before it is called a mismatch.
WIDELAG = int(150 * SR / HOP)
THRESHOLD = 0.5


def ledger(season):
    f = os.path.join(ROOT, 'ledger', 'out', 'file-names.tsv')
    rs = [l.rstrip('\n').split('\t') for l in io.open(f, encoding='utf8') if l.strip()]
    h = rs[0]
    out = {}
    for r in rs[1:]:
        d = dict(zip(h, r))
        if d['series'] == 'classic-who' and d['season'] == str(season):
            out[int(d['episode'])] = d
    return out


def held_ext(season):
    f = os.path.join(ROOT, 'ledger', 'out', 'bucket-index.txt')
    out = {}
    for l in io.open(f, encoding='utf8'):
        l = l.strip()
        if l.startswith('classic_who/season_%d/' % season):
            n = l.split('/')[-1]
            s, _, e = n.rpartition('.')
            if e in ('mkv', 'mp4', 'm4v'):
                out[s] = e
    return out


def dur(src):
    p = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
                        '-of', 'default=nw=1:nk=1', src], capture_output=True, text=True)
    return float(p.stdout.strip() or 0)


def env(src, cache=None):
    if cache and os.path.exists(cache):
        return np.load(cache)
    p = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(START), '-t', str(DUR), '-i', src,
                        '-map', '0:a:0', '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
                       capture_output=True)
    a = np.frombuffer(p.stdout, dtype='<i2').astype(np.float32)
    n = a.size // HOP
    if n == 0:
        return None
    e = np.sqrt((a[:n * HOP].reshape(n, HOP) ** 2).mean(axis=1))
    e = e - e.mean()
    e = e / (np.linalg.norm(e) or 1.0)
    if cache:
        os.makedirs(os.path.dirname(cache), exist_ok=True)
        np.save(cache, e)
    return e


def score(a, b, maxlag=MAXLAG):
    best, bl = -1.0, 0
    for lag in range(-maxlag, maxlag + 1):
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
    season = int(sys.argv[1])
    do_verify = '--verify' in sys.argv
    led = ledger(season)
    dst_dir = os.path.expanduser('~/Downloads/content/classic_who/season_%d' % season)
    os.makedirs(dst_dir, exist_ok=True)
    chosen = os.path.join(HERE, 'chosen_s%d.tsv' % season)
    linked, missing = 0, []
    staged = {}
    for l in io.open(chosen, encoding='utf8'):
        if not l.strip():
            continue
        ep, title, rel = l.rstrip('\n').split('\t')
        ep = int(ep)
        src = os.path.join(PROBE, rel.replace('/', os.sep))
        dst = os.path.join(dst_dir, led[ep]['file_name'] + '.mkv')
        staged[ep] = dst
        if not os.path.exists(src):
            missing.append((ep, rel))
            continue
        if not os.path.exists(dst):
            os.link(src, dst)
            linked += 1
    print('season %d: %d linked, %d already there' % (season, linked, len(staged) - linked - len(missing)))
    if missing:
        print('NOT ON DISK:')
        for ep, rel in missing:
            print('  ep%-3d %s' % (ep, rel))
        return
    if not do_verify:
        return
    ext = held_ext(season)
    # Not inside dst_dir. That folder is what gets uploaded, and a cache left
    # there rides along: season 9's 52 .npy files landed in the bucket as
    # classic_who/season_9/.env/ before this moved out.
    cache = os.path.join(CACHE_ROOT, 'season_%d' % season)
    H, N, H_SRC = {}, {}, {}
    for ep in sorted(staged):
        stem = led[ep]['file_name']
        if stem in ext:
            H_SRC[ep] = '%s/season_%d/%s.%s' % (B2, season, stem, ext[stem])
            H[ep] = env(H_SRC[ep], os.path.join(cache, 'held_%d.npy' % ep))
        N[ep] = env(staged[ep], os.path.join(cache, 'new_%d.npy' % ep))
    print('comparing %d of %d against the copy already held' % (len(H), len(staged)))
    bad = []
    for ep in sorted(N):
        if ep not in H or H[ep] is None or N[ep] is None:
            print('  ep%-3d %-40s no held copy to compare' % (ep, led[ep]['title'][:40]))
            continue
        s, lag = score(H[ep], N[ep])
        note = ''
        if s < THRESHOLD:
            s, lag = score(H[ep], N[ep], WIDELAG)
            note = '  (wide)'
        flag = '' if s >= THRESHOLD else '   <-- MISMATCH'
        print('  ep%-3d %-40s r=%.3f lag=%+7.2fs%s%s'
              % (ep, led[ep]['title'][:40], s, lag, note, flag))
        if s < THRESHOLD:
            bad.append(ep)
        elif abs(lag) > 2.0:
            # Same episode, different cut. Worth saying out loud: it means the
            # copy being replaced was not the broadcast length, so the runtime
            # is worth checking against a published list before shipping.
            print('        held copy %.1fs, new %.1fs - different cut, check the runtime'
                  % (dur(H_SRC[ep]), dur(staged[ep])))
    for ep in bad:
        row = sorted(((score(H[ep], N[o], WIDELAG)[0], o) for o in N), reverse=True)[:3]
        print('    held ep%d actually matches: %s' % (ep, [(o, round(v, 3)) for v, o in row]))
    print('\n%d mismatched' % len(bad))


main()
