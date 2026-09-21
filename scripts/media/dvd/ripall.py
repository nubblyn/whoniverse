#!/usr/bin/env python3
"""Rip every plausible episode title out of the season 1 DVD ISOs.

Deliberately over-inclusive. Working out which title is which episode from
durations and MakeMKV's naming was tried and is not safe: The Daleks offers
eight candidates for seven episodes, An Unearthly Child's disc carries both
unaired pilot cuts inside any sane duration window, and the Marco Polo
reconstruction ships as two discs of seven. So everything in range is ripped
here and identify.py settles it against the audio of the copy already held.

MakeMKV copies the MPEG-2 video, every AC-3 track and the disc's own VobSub
without re-encoding: Part D exception 2, container only.
"""
import io
import os
import re
import subprocess
import sys

MKV = r'C:\Program Files (x86)\MakeMKV\makemkvcon64.exe'
ISODIR = os.path.expanduser('~/Downloads/content/classic_who/iso')
RAW = os.path.expanduser('~/Downloads/content/classic_who/raw')
HERE = os.path.dirname(os.path.abspath(__file__))
MINLEN = 1100
TOL = 40        # wide on purpose; identify.py does the real work


def rows():
    out = []
    for i, l in enumerate(io.open(os.path.join(HERE, 's1map.tsv'), encoding='utf8')):
        if i == 0 or not l.strip():
            continue
        ep, serial, iso, title, secs = l.rstrip('\n').split('\t')
        out.append(dict(ep=int(ep), serial=int(serial), iso=iso,
                        title=title, secs=float(secs)))
    return out


def hms(s):
    m = re.match(r'(\d+):(\d+):(\d+)', s)
    return int(m.group(1)) * 3600 + int(m.group(2)) * 60 + int(m.group(3)) if m else None


def info(iso):
    p = subprocess.run([MKV, '-r', '--minlength=%d' % MINLEN, 'info', 'iso:' + iso],
                       capture_output=True, text=True, errors='replace')
    t = {}
    for line in p.stdout.splitlines():
        m = re.match(r'TINFO:(\d+),(\d+),\d+,"(.*)"$', line)
        if m and int(m.group(2)) == 9:
            t[int(m.group(1))] = hms(m.group(3))
    return sorted((i, s) for i, s in t.items() if s)


def main():
    os.makedirs(RAW, exist_ok=True)
    R = rows()
    isos = sorted(f for f in os.listdir(ISODIR) if f.endswith('.iso'))
    log = io.open(os.path.join(RAW, 'candidates.tsv'), 'a', encoding='utf8')
    for f in isos:
        serial = int(re.search(r'Serial (\d+)', f).group(1))
        disc = re.search(r'disc (\d+)', f)
        disc = int(disc.group(1)) if disc else 1
        want = [r['secs'] for r in R if r['serial'] == serial]
        path = os.path.join(ISODIR, f)
        for idx, secs in info(path):
            if min(abs(secs - w) for w in want) > TOL:
                continue
            tag = 's%d_d%d_t%02d' % (serial, disc, idx)
            dest = os.path.join(RAW, tag + '.mkv')
            if os.path.exists(dest):
                print('%s already there' % tag)
                continue
            before = set(os.listdir(RAW))
            print('%s  (%ds) ...' % (tag, secs), flush=True)
            p = subprocess.run([MKV, '-r', '--minlength=%d' % MINLEN, 'mkv',
                                'iso:' + path, str(idx), RAW],
                               capture_output=True, text=True, errors='replace')
            new = [x for x in os.listdir(RAW) if x not in before and x.endswith('.mkv')]
            if len(new) != 1:
                print(p.stdout[-1500:])
                raise SystemExit('%s produced %r' % (tag, new))
            os.replace(os.path.join(RAW, new[0]), dest)
            log.write('%s\t%d\t%d\t%d\t%d\t%s\n' % (tag, serial, disc, idx, secs, f))
            log.flush()
            print('   -> %s.mkv  %.2f GB' % (tag, os.path.getsize(dest) / 1e9))


main()
