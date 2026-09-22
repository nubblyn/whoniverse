#!/usr/bin/env python3
"""Rip a Classic season's retail DVDs and say which title is which episode.

    python scripts/media/dvd/dvdrip.py rip <season> <folder of ISOs>
    python scripts/media/dvd/dvdrip.py match <season>
    python scripts/media/dvd/collstage.py <season> --verify

For seasons with no Collection Blu-ray. MakeMKV copies the MPEG-2 video, every
AC-3 track and the disc's own VobSub into an MKV, with nothing re-encoded and
nothing OCR'd: Part D exception 2, container only.

`rip` takes every title between MINLEN and MAXLEN from every ISO. It is
over-inclusive on purpose. Neither disc order nor duration can be trusted to
say which title is which episode: on season 1, The Daleks offered eight
candidates for seven episodes, An Unearthly Child's disc carries both unaired
pilot cuts inside any sane duration window, and inside one serial the
episodes are seconds apart.

`match` settles it by sound. Each ripped title's loudness envelope is
correlated against every episode of the season already in the bucket, using
collstage.py's envelope and score, and titles are assigned greedily, best
first, one to one. Anything under collstage's threshold is left unmatched
rather than forced. The result is written as chosen_s<season>.tsv, the same
file collsel.py writes for a Collection set, so collstage.py stages and
verifies a DVD season exactly as it does a Blu-ray one.

Where one story ships twice (season 1's Marco Polo reconstruction came as two
discs of the same seven episodes), both copies match and the better score
wins; check the list and swap by hand if the other disc is the one wanted.
"""
import io
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import collstage  # noqa: E402

MKV = r'C:\Program Files (x86)\MakeMKV\makemkvcon64.exe'
MINLEN, MAXLEN = 15 * 60, 60 * 60


def titles(iso):
    """(title index, seconds) for every title MakeMKV sees over MINLEN."""
    p = subprocess.run([MKV, '-r', '--minlength=%d' % MINLEN, 'info', 'iso:' + iso],
                       capture_output=True, text=True, errors='replace')
    out = {}
    for line in p.stdout.splitlines():
        m = re.match(r'TINFO:(\d+),9,\d+,"(\d+):(\d+):(\d+)"$', line)
        if m:
            out[int(m.group(1))] = int(m.group(2)) * 3600 + int(m.group(3)) * 60 + int(m.group(4))
    return sorted((i, s) for i, s in out.items() if s <= MAXLEN)


def rip(season, isodir):
    raw = os.path.join(collstage.PROBE, 'dvd_s%d' % season)
    for f in sorted(x for x in os.listdir(isodir) if x.lower().endswith('.iso')):
        disc = os.path.splitext(f)[0]
        dest_dir = os.path.join(raw, disc)
        os.makedirs(dest_dir, exist_ok=True)
        for idx, secs in titles(os.path.join(isodir, f)):
            dest = os.path.join(dest_dir, 't%02d.mkv' % idx)
            if os.path.exists(dest):
                continue
            before = set(os.listdir(dest_dir))
            print('%s title %d (%ds) ...' % (disc, idx, secs), flush=True)
            p = subprocess.run([MKV, '-r', '--minlength=%d' % MINLEN, 'mkv',
                                'iso:' + os.path.join(isodir, f), str(idx), dest_dir],
                               capture_output=True, text=True, errors='replace')
            new = [x for x in os.listdir(dest_dir) if x not in before and x.endswith('.mkv')]
            if len(new) != 1:
                print(p.stdout[-1500:])
                raise SystemExit('%s title %d produced %r' % (disc, idx, new))
            os.replace(os.path.join(dest_dir, new[0]), dest)


def match(season):
    led = collstage.ledger(season)
    ext = collstage.held_ext(season)
    raw = os.path.join(collstage.PROBE, 'dvd_s%d' % season)
    cache = os.path.join(collstage.CACHE_ROOT, 'dvd_s%d' % season)
    held = {}
    for ep, d in led.items():
        stem = d['file_name']
        if stem in ext:
            src = '%s/season_%d/%s.%s' % (collstage.B2, season, stem, ext[stem])
            held[ep] = collstage.env(src, os.path.join(cache, 'held_%d.npy' % ep))
    cands = {}
    for disc in sorted(os.listdir(raw)):
        for t in sorted(os.listdir(os.path.join(raw, disc))):
            if t.endswith('.mkv'):
                rel = 'dvd_s%d/%s/%s' % (season, disc, t)
                key = re.sub(r'[^A-Za-z0-9]+', '_', disc + '_' + t)
                cands[rel] = collstage.env(os.path.join(raw, disc, t), os.path.join(cache, key + '.npy'))
    print('season %d: %d ripped titles against %d held episodes' % (season, len(cands), len(held)))
    grid = sorted(((collstage.score(h, c)[0], ep, rel)
                   for ep, h in held.items() if h is not None
                   for rel, c in cands.items() if c is not None), reverse=True)
    got, used = {}, set()
    for s, ep, rel in grid:
        if s >= collstage.THRESHOLD and ep not in got and rel not in used:
            got[ep] = (rel, s)
            used.add(rel)
    for ep in sorted(led):
        if ep in got:
            print('  ep%-3d %-40s %-45s r=%.3f' % (ep, led[ep]['title'][:40], got[ep][0], got[ep][1]))
        else:
            print('  ep%-3d %-40s UNMATCHED%s' % (ep, led[ep]['title'][:40],
                                                  '' if ep in held else ' (no held copy)'))
    for rel in sorted(set(cands) - used):
        print('  spare %s' % rel)
    out = os.path.join(HERE, 'chosen_s%d.tsv' % season)
    io.open(out, 'w', encoding='utf8', newline='\n').write(
        ''.join('%d\t%s\t%s\n' % (ep, led[ep]['title'], got[ep][0]) for ep in sorted(got)))
    print('\nwrote %s: %d of %d episodes' % (out, len(got), len(led)))


if __name__ == '__main__':
    cmd, season = sys.argv[1], int(sys.argv[2])
    if cmd == 'rip':
        rip(season, sys.argv[3])
    elif cmd == 'match':
        match(season)
    else:
        raise SystemExit(__doc__)
