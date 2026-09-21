#!/usr/bin/env python3
"""Rip Classic Who season 1 episodes out of the retail DVD ISOs.

Part D exception 2: a DVD cannot be shipped as it came, so the container
changes and nothing else. MakeMKV copies the MPEG-2 video, every AC-3 track
(episode plus commentary) and the disc's own VobSub straight into an MKV.
Nothing is re-encoded and nothing is OCR'd.

Matching titles to episodes on absolute duration looked obvious and is not
safe: inside one serial the episodes are seconds apart (1400.0 and 1415.0 in
An Unearthly Child), so a systematic offset between the DVD and the DivX copy
we hold would reshuffle them silently. The discs lay their episodes out in
order, so the assignment is by title index; duration decides which titles are
episodes at all, and then checks the result.

    python scripts/media/dvd/rip.py info <iso>        # what a disc holds
    python scripts/media/dvd/rip.py plan <serial-no>  # the proposed mapping
    python scripts/media/dvd/rip.py rip  <serial-no>  # do it
"""
import io
import os
import re
import subprocess
import sys

MKV = r'C:\Program Files (x86)\MakeMKV\makemkvcon64.exe'
ISODIR = os.path.expanduser('~/Downloads/content/classic_who/iso')
OUTDIR = os.path.expanduser('~/Downloads/content/classic_who/season_1')
HERE = os.path.dirname(os.path.abspath(__file__))
MAP = os.path.join(HERE, 's1map.tsv')
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))
MINLEN = 1100   # 18 min: under the shortest episode (1327 s) with room to spare
TOL = 15        # seconds; the observed gap between disc and held copy is 2 to 4


def rows():
    out = []
    for i, l in enumerate(io.open(MAP, encoding='utf8')):
        if i == 0 or not l.strip():
            continue
        ep, serial, iso, title, secs = l.rstrip('\n').split('\t')
        out.append(dict(ep=int(ep), serial=int(serial), iso=iso,
                        title=title, secs=float(secs)))
    return out


def stems():
    """episode -> file stem, read from the ledger's build output rather than
    derived here, because build.py owns the naming rule."""
    f = os.path.join(ROOT, 'ledger', 'out', 'file-names.tsv')
    rs = [l.rstrip('\n').split('\t') for l in io.open(f, encoding='utf8') if l.strip()]
    h = rs[0]
    out = {}
    for r in rs[1:]:
        d = dict(zip(h, r))
        if d['series'] == 'classic-who' and d['season'] == '1':
            out[int(d['episode'])] = d['file_name']
    return out


def isos_for(serial):
    want = [r['iso'] for r in rows() if r['serial'] == serial][0]
    return sorted(os.path.join(ISODIR, f) for f in os.listdir(ISODIR)
                  if f.endswith('.iso') and want in f)


def hms(s):
    m = re.match(r'(\d+):(\d+):(\d+)', s)
    return int(m.group(1)) * 3600 + int(m.group(2)) * 60 + int(m.group(3)) if m else None


def info(iso):
    """[(title index, seconds, bytes)] for every title over MINLEN."""
    p = subprocess.run([MKV, '-r', '--minlength=%d' % MINLEN, 'info', 'iso:' + iso],
                       capture_output=True, text=True, errors='replace')
    titles = {}
    for line in p.stdout.splitlines():
        m = re.match(r'TINFO:(\d+),(\d+),\d+,"(.*)"$', line)
        if not m:
            continue
        idx, code, val = int(m.group(1)), int(m.group(2)), m.group(3)
        t = titles.setdefault(idx, {})
        if code == 9:
            t['secs'] = hms(val)
        elif code == 11:
            t['bytes'] = int(val or 0)
    return sorted((i, t.get('secs'), t.get('bytes', 0))
                  for i, t in titles.items() if t.get('secs'))


def match(serial):
    """episode -> (iso, title index, disc seconds).

    Two tests, because neither is sufficient alone. Duration alone is unsafe:
    inside one serial the episodes are seconds apart (1400.0 and 1415.0 in An
    Unearthly Child), so a systematic offset would reshuffle them silently, and
    two Reign of Terror episodes have the identical held duration. Order alone
    is unsafe too: An Unearthly Child's disc carries both unaired pilot cuts at
    1503 s and 1522 s, which sit inside any sane duration window and would
    shift four episodes by two places.

    So duration picks which titles are episodes at all (within TOL of some
    episode in the serial, which drops the pilots at 28 s and 47 s out), and
    then the assignment is by disc order, which the discs follow. Both have to
    agree or nothing is ripped.
    """
    eps = sorted([r for r in rows() if r['serial'] == serial], key=lambda r: r['ep'])
    want = [r['secs'] for r in eps]
    cands = []
    for iso in isos_for(serial):
        for idx, secs, nb in info(iso):
            cands.append((iso, idx, secs, nb))
    keep = sorted([c for c in cands if min(abs(c[2] - w) for w in want) <= TOL],
                  key=lambda c: (c[0], c[1]))
    if len(keep) != len(eps):
        return {}, [('count', len(keep), len(eps),
                     [(os.path.basename(c[0])[-22:], c[1], c[2],
                       round(min(abs(c[2] - w) for w in want), 1)) for c in cands])], cands
    chosen = dict(zip((r['ep'] for r in eps), keep))
    trouble = [('delta', r['ep'], r['title'], r['secs'], chosen[r['ep']][2],
                round(chosen[r['ep']][2] - r['secs'], 1))
               for r in eps if abs(chosen[r['ep']][2] - r['secs']) > TOL]
    return chosen, trouble, cands


def main():
    cmd = sys.argv[1]
    if cmd == 'info':
        for idx, secs, nb in info(sys.argv[2]):
            print('  title %-3d %7ds  %6.2f GB' % (idx, secs, nb / 1e9))
        return
    serial = int(sys.argv[2])
    chosen, trouble, cands = match(serial)
    print('serial %d: %d titles over %ds across %d disc(s)'
          % (serial, len(cands), MINLEN, len(isos_for(serial))))
    st = stems()
    for ep in sorted(chosen):
        iso, idx, secs, nb = chosen[ep]
        r = [x for x in rows() if x['ep'] == ep][0]
        print('  ep%-3d %-28s title %-3d %5ds (held %6.1f, %+6.1f) %5.2fGB  %s'
              % (ep, r['title'][:28], idx, secs, r['secs'], secs - r['secs'],
                 nb / 1e9, os.path.basename(iso)[-24:]))
    for t in trouble:
        if t[0] == 'count':
            print('  TITLE COUNT %d, want %d. every candidate:' % (t[1], t[2]))
            for c in t[3]:
                print('     %-22s title %-3d %5ds  nearest episode %+.1f' % c)
        else:
            print('  ep%-3d %-28s DURATION held %.1f, disc %d, %+.1f'
                  % (t[1], t[2][:28], t[3], t[4], t[5]))
    if cmd == 'plan':
        return
    if trouble:
        raise SystemExit('refusing to rip: unresolved, see above')
    os.makedirs(OUTDIR, exist_ok=True)
    for ep in sorted(chosen):
        iso, idx, secs, nb = chosen[ep]
        dest = os.path.join(OUTDIR, st[ep] + '.mkv')
        if os.path.exists(dest):
            print('  ep%-3d already ripped, skipping' % ep)
            continue
        before = set(os.listdir(OUTDIR))
        print('ripping ep%d (title %d) ...' % (ep, idx), flush=True)
        p = subprocess.run([MKV, '-r', '--minlength=%d' % MINLEN, 'mkv',
                            'iso:' + iso, str(idx), OUTDIR],
                           capture_output=True, text=True, errors='replace')
        new = [f for f in os.listdir(OUTDIR) if f not in before and f.endswith('.mkv')]
        if len(new) != 1:
            print(p.stdout[-1500:])
            raise SystemExit('ep%d produced %r' % (ep, new))
        os.replace(os.path.join(OUTDIR, new[0]), dest)
        print('  -> %s.mkv' % st[ep])
        with io.open(os.path.join(OUTDIR, 'ripped.tsv'), 'a', encoding='utf8') as fh:
            fh.write('%d\t%s\t%d\t%s\n' % (ep, os.path.basename(iso), idx, st[ep]))


main()
