#!/usr/bin/env python3
"""Remove everything under a season's probe folder except the chosen files.

    python scripts/media/dvd/keepchosen.py <season>

The list is the extract_sN.txt collsel.py wrote. qBittorrent leaves partial
files behind when a torrent is removed without its data, and they sit at the
same paths the zip extracts to, so anything not on the list is a leftover.
"""
import io
import os
import sys

season = int(sys.argv[1])
DVD = os.path.dirname(os.path.abspath(__file__))
PROBE = os.path.expanduser(r'~\Downloads\content\classic_who\probe')
keep = {os.path.normcase(os.path.normpath(os.path.join(PROBE, l.strip())))
        for l in io.open(os.path.join(DVD, 'extract_s%d.txt' % season), encoding='utf8') if l.strip()}
top = {os.path.normcase(os.path.normpath(os.path.join(PROBE, l.strip()))).split(os.sep)[len(PROBE.split(os.sep))]
       for l in io.open(os.path.join(DVD, 'extract_s%d.txt' % season), encoding='utf8') if l.strip()}
kept = removed = 0
for root in top:
    base = os.path.join(PROBE, root)
    for dp, _, fs in os.walk(base):
        for f in fs:
            p = os.path.normcase(os.path.normpath(os.path.join(dp, f)))
            if p in keep:
                kept += 1
            else:
                os.remove(p)
                removed += 1
missing = [k for k in keep if not os.path.exists(k)]
print('season %d: kept %d chosen files, removed %d leftovers, %d chosen files missing'
      % (season, kept, removed, len(missing)))
for m in missing:
    print('  MISSING', m)
