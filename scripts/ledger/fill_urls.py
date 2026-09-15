#!/usr/bin/env python3
"""Give the episodes that have no URLs their three URLs.

    python fill_urls.py            say what would change
    python fill_urls.py --write

Seasons 14 to 16 were written into data/new-who.js with their titles, types and
summaries but no addresses \u2014 the files did not exist yet \u2014 and the same is true
of the three rows the BBC publishes on YouTube and a dozen older extras. Each
placeholder is a blank line between the overview and the closing brace. This
fills in thumbnail, streamUrl and subtitleUrl from the names the ledger already
computes, so those entries stop being inert.

Line by line rather than by regex over the whole file. The entries carry nested
braces (`imdb: { ... }`), a `new Date(...)` call and free prose containing every
punctuation mark there is, so any pattern that tries to grab a whole object gets
one of them wrong; tracking season and episode as they go past does not.

No hash is written here. `scripts/stamp-media.js` reads each file's own hash out
of the bucket and appends it, and it should stay the only thing that does: a
hash invented locally would not match the object B2 serves, and the point of the
query is that it changes when the file does.
"""
import csv
import io
import os
import re
import subprocess
import sys

ROOT = 'C:/Users/hello/Documents/Claude Projects/Whoniverse Stremio Addon'
DATA = os.path.join(ROOT, 'data', 'new-who.js')
NAMES = os.path.join(ROOT, 'ledger', 'out', 'file-names.tsv')
BASE = 'https://cdn.nubblyn.com/file/whoniverse/new_who'


def stems():
    """(season, episode) -> file stem, from the ledger's own naming."""
    out = {}
    for r in csv.DictReader(io.open(NAMES, encoding='utf8'), delimiter='\t'):
        if r['series'] == 'new-who' and r.get('file_name') and r['episode'].isdigit():
            out[(r['season'], int(r['episode']))] = r['file_name']
    return out


def in_bucket():
    """Every new_who object B2 currently holds.

    The gate matters: four of the entries with no URLs are minisodes that have
    never been sourced — Tonight's the Night, A Ghost Story for Christmas, The
    Boy Who Saved the Proms, A Hyperscape Body Swap Ticket. Writing addresses
    for those would point the addon at files that do not exist, and the failure
    would show up as a stream that silently does nothing rather than as an entry
    that is visibly still to do.
    """
    out = subprocess.run(['rclone', 'lsf', '-R', 'b2:whoniverse/new_who/'],
                         capture_output=True, text=True)
    if out.returncode:
        raise SystemExit('rclone failed: %s' % out.stderr[:200])
    return set(out.stdout.split())


def main():
    write = '--write' in sys.argv
    stem_of = stems()
    held = in_bucket()
    lines = io.open(DATA, encoding='utf8').read().replace('\r', '').split('\n')

    out, season, ep, seen_url = [], None, None, False
    filled, skipped = [], []
    for line in lines:
        m = re.match(r'season:\s*(\d+),', line)
        if m:
            season, ep, seen_url = m.group(1), None, False
        m = re.match(r'episode:\s*(\d+),', line)
        if m:
            ep = int(m.group(1))
        if line.startswith(('streamUrl:', 'thumbnail:', 'subtitleUrl:')):
            seen_url = True

        if line.rstrip() in ('},', '}') and season and ep is not None and not seen_url:
            key = (season, ep)
            stem = stem_of.get(key)
            if stem and 'season_%s/%s.mp4' % (season, stem) in held:
                # The blank placeholder line sits right above; replace it.
                while out and not out[-1].strip():
                    out.pop()
                folder = '%s/season_%s' % (BASE, season)
                out += ['thumbnail: "%s/%s.jpg",' % (folder, stem),
                        'streamUrl: "%s/%s.mp4",' % (folder, stem),
                        'subtitleUrl: "%s/%s.srt"' % (folder, stem)]
                filled.append((season, ep, stem))
            else:
                skipped.append(key)
            season, ep, seen_url = None, None, False
        out.append(line)

    for s, e, stem in filled:
        print('  S%-3s E%-3d %s' % (s, e, stem))
    for s, e in skipped:
        print('  - S%s E%d left alone, nothing in the bucket for it' % (s, e))
    print('\n%d entries given URLs, %d skipped' % (len(filled), len(skipped)))

    if write and filled:
        io.open(DATA, 'w', encoding='utf8', newline='\n').write('\n'.join(out))
        print('written')
    elif not write:
        print('dry run. Re-run with --write')


if __name__ == '__main__':
    main()
