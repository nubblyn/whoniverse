#!/usr/bin/env python3
"""Turn the identified DVD rips into the season's files, named and probed.

Reads identified.tsv (written by identify.py), hard-links or moves each
winning title to its stem from the ledger, and prints the probe of every
result so `have`, the `audio` flag and the sidecar decision come off measured
facts rather than expectation.

    python scripts/media/dvd/finalise.py plan
    python scripts/media/dvd/finalise.py move
"""
import io
import json
import os
import subprocess
import sys

RAW = os.path.expanduser('~/Downloads/content/classic_who/raw')
OUT = os.path.expanduser('~/Downloads/content/classic_who/season_1')


def identified():
    rows = {}
    p = os.path.join(RAW, 'identified.tsv')
    for l in io.open(p, encoding='utf8'):
        if not l.strip():
            continue
        ep, tag, stem, r, lag = l.rstrip('\n').split('\t')
        rows[int(ep)] = (tag, stem, float(r), float(lag))
    return rows


def probe(f):
    d = json.loads(subprocess.run(
        ['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', f],
        capture_output=True, text=True).stdout)
    v = [s for s in d['streams'] if s['codec_type'] == 'video'][0]
    a = [s for s in d['streams'] if s['codec_type'] == 'audio']
    su = [s for s in d['streams'] if s['codec_type'] == 'subtitle']
    fm = d['format']
    return dict(w=v['width'], h=v['height'], codec=v['codec_name'],
                fps=v['r_frame_rate'], dur=float(fm['duration']),
                size=int(fm['size']),
                audio=[(x['codec_name'], x.get('channels')) for x in a],
                subs=[(x['codec_name'], (x.get('tags') or {}).get('language')) for x in su])


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'plan'
    rows = identified()
    os.makedirs(OUT, exist_ok=True)
    print('%d episodes identified' % len(rows))
    for ep in sorted(rows):
        tag, stem, r, lag = rows[ep]
        src = os.path.join(RAW, tag + '.mkv')
        dst = os.path.join(OUT, stem + '.mkv')
        p = probe(src)
        fps = p['fps']
        print('  ep%-3d %-46s %sx%-4s %-10s %-6s %7.1fs %5.2fGB %4.2fMbps a=%s s=%s r=%.3f'
              % (ep, stem[:46], p['w'], p['h'], p['codec'], fps, p['dur'],
                 p['size'] / 1e9, p['size'] * 8 / p['dur'] / 1e6,
                 '+'.join('%s%s' % x for x in p['audio']),
                 '+'.join('%s:%s' % x for x in p['subs']) or 'none', r))
        if cmd == 'move':
            if os.path.exists(dst):
                print('       already in place')
                continue
            os.replace(src, dst)


main()
