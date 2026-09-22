#!/usr/bin/env python3
"""Pick the episode files out of a Doctor Who: The Collection torrent.

    python scripts/media/dvd/collsel.py <season> [--apply]

A Collection set carries far more than the episodes. Season 9's is 165 files
of which 44 match an episode code, because most episodes appear three or four
times: the restored version on the story's own disc, a "(DVD Version)" in a
DVD Versions folder, a "(Special Edition)" omnibus recut, and sometimes a
"(Bonus)" disc copy. On top of that come featurettes, photo galleries and
camera scripts as PDFs.

The rule, in order:

- Only files whose name carries this season's SxxExx code.
- Never a recut or an alternative presentation: anything under a DVD Versions,
  Bonus or Omnibus folder, and anything tagged (DVD Version), (Special
  Edition), (CGI) or (Reconstruction) where a plain version also exists. The
  catalogue wants the broadcast story as the disc presents it, and on season 2
  the user settled that the CGI variants are out.
- Of what remains for an episode, the largest. On every set seen so far the
  restored version on the story's own disc is both the plain-named one and the
  biggest, so this is a tie-break rather than the decision.

It prints the chosen files and, with --apply, tells qBittorrent to download
only those: everything else goes to priority 0. `filePrio` wants its ids
pipe-separated; commas answer "File IDs must be integers" with a 200.
"""
import io
import json
import os
import re
import sys
import urllib.parse
import urllib.request

QB = 'http://127.0.0.1:8099/api/v2'
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(HERE)))

# a path segment or tag that marks an alternative presentation, not the episode.
# (Extended) earns its place here: Inferno part 5 ships as both an extended cut
# and the broadcast one, and the extended file is 0.01 GB the larger, so a
# largest-wins tie-break picked the wrong cut until this listed it.
#
# Season 8 named its alternatives by folder rather than by tag - Extended, DVD
# Restoration, 2011 DVD Restoration - and none of those were listed here, so
# all thirteen of its choices came down to the size tie-break. They happened to
# land right, including an Extended Claws of Axos that is 0.84 GB *smaller*
# than the broadcast cut, which is the opposite of the season 7 trap and would
# have gone the other way just as easily. Both lists now name what they mean.
ALT_DIR = re.compile(
    r'(?:^|/)(?:dvd versions?|bonus|omnibus|extended|[\w ]*restoration)(?:/|$)', re.I)
ALT_TAG = re.compile(
    r'\((?:dvd version|special edition|extended|cgi|reconstruction'
    r'|[\w ]*restoration|hd early edit)\)', re.I)
# A story that ships its broadcast cut in an Originals folder puts the
# alternatives beside it, so when one exists for an episode it settles the
# choice outright rather than leaving it to size.
ORIGINALS = re.compile(r'(?:^|/)originals?(?:/|$)', re.I)

# Everything in brackets except a bare part number is a variant tag, not part of
# the story's name: (Original), (CGI), (2011 DVD Restoration), (HD Early Edit).
VARIANT = re.compile(r'\((?!\d+\))[^)]*\)')


def norm(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())


def file_title(path, season):
    """The story and part a filename claims to be, normalised for comparison."""
    stem = path.rsplit('/', 1)[-1].rsplit('.', 1)[0]
    stem = re.sub(r'^\s*S0?%dE\d{1,2}\s*[-–—]?\s*' % season, '', stem, flags=re.I)
    return norm(VARIANT.sub('', stem))


def api(path, data=None):
    u = '%s/%s' % (QB, path)
    if data is None:
        return json.load(urllib.request.urlopen(u, timeout=120))
    body = urllib.parse.urlencode(data).encode()
    return urllib.request.urlopen(u, body, timeout=120).read()


def rows(season):
    """How many episode rows the ledger has for this Classic season."""
    f = os.path.join(ROOT, 'ledger', 'out', 'file-names.tsv')
    rs = [l.rstrip('\n').split('\t') for l in io.open(f, encoding='utf8') if l.strip()]
    h = rs[0]
    out = {}
    for r in rs[1:]:
        d = dict(zip(h, r))
        if d['series'] == 'classic-who' and d['season'] == str(season):
            out[int(d['episode'])] = (d['title'], d['category'], d['file_name'])
    return out


def choose(files, season, led=None):
    # The sets are inconsistent about both halves of the code and mix styles
    # inside one torrent. Season 7 uses S7E on discs 1 and 2 and S07E on discs
    # 4 and 5, which lost eleven episodes; season 8 numbers one single episode
    # S08E9 where its neighbours are S08E05 and S08E10, which lost The Mind of
    # Evil part 5 alone. Both halves are optional-zero, and the episode number
    # is anchored so S08E10 does not read as episode 1.
    code = re.compile(r'S0?%dE(\d{1,2})(?!\d)' % season, re.I)
    by_ep = {}
    for f in files:
        if not f['name'].lower().endswith(('.mkv', '.mp4', '.m4v')):
            continue
        m = code.search(f['name'])
        if not m:
            continue
        ep = int(m.group(1))
        by_ep.setdefault(ep, []).append(f)
    chosen, notes = {}, []
    for ep, cands in sorted(by_ep.items()):
        # A code with no row behind it is a numbering slip, not an episode.
        # Season 12 labels the CGI Revenge of the Cybermen part 4 `S12E30`,
        # which invented a twenty-first episode for a twenty-row season.
        if led is not None and ep not in led:
            notes.append('ep%d has no ledger row, dropped: %s'
                         % (ep, cands[0]['name'].rsplit('/', 1)[-1]))
            continue
        plain = [c for c in cands
                 if not ALT_DIR.search(c['name']) and not ALT_TAG.search(c['name'])]
        # **The filename has to name the story the row names.** Season 12 has a
        # 3.58 GB `S12E11 - The Sontaran Experiment (3)` on the Sontaran disc.
        # That story is two parts long, so there is no part 3; the file is the
        # two-parter joined. It carries the same code as Genesis of the Daleks
        # part 1, which is what episode 11 actually is, and being the larger it
        # won the size tie-break. Comparing the title against the row stops a
        # file being shipped as an episode of a different story.
        want = norm(led[ep][0]) if led is not None and ep in led else None
        titled = [c for c in plain if want and file_title(c['name'], season) == want]
        if want and plain and not titled:
            notes.append('ep%d: no filename matches the row title %r, fell back on size'
                         % (ep, led[ep][0]))
        base = titled or plain
        originals = [c for c in base if ORIGINALS.search(c['name'])]
        pool = originals or base or cands
        if not plain:
            notes.append('ep%d had only alternative versions' % ep)
        dropped = [c for c in plain if c not in base]
        for c in dropped:
            notes.append('ep%d: passed over %s, which is not %r'
                         % (ep, c['name'].rsplit('/', 1)[-1], led[ep][0]))
        chosen[ep] = max(pool, key=lambda c: c['size'])
    return chosen, notes, by_ep


def main():
    season = int(sys.argv[1])
    apply_it = '--apply' in sys.argv
    led = rows(season)
    torrents = api('torrents/info?category=collprobe')
    t = [x for x in torrents if x['name'].split()[-1] == str(season)]
    if not t:
        raise SystemExit('no queued torrent for season %d' % season)
    h = t[0]['hash']
    files = api('torrents/files?hash=%s' % h)
    chosen, notes, by_ep = choose(files, season, led)
    print('season %d: %d files in the set, %d carry an episode code, %d episodes chosen'
          % (season, len(files), sum(len(v) for v in by_ep.values()), len(chosen)))
    print('ledger has %d rows for this season' % len(led))
    total = 0
    for ep in sorted(chosen):
        c = chosen[ep]
        total += c['size']
        title = led.get(ep, ('?', '', ''))[0]
        alts = len(by_ep[ep]) - 1
        print('  ep%-3d %-30s %6.2fGB  %-54s%s'
              % (ep, title[:30], c['size'] / 1e9, c['name'].split('/', 1)[-1][:54],
                 '  (%d alt)' % alts if alts else ''))
    print('  selected %.2f GB of %.2f GB' % (total / 1e9, sum(f['size'] for f in files) / 1e9))
    missing = [e for e in led if e not in chosen]
    if missing:
        print('  ledger rows with no file in the set: %s'
              % [(e, led[e][0], led[e][1]) for e in sorted(missing)])
    for n in notes:
        print('  note: %s' % n)
    if not apply_it:
        print('\n(dry run; pass --apply to set file priorities)')
        return
    keep = {c['index'] for c in chosen.values()}
    drop = [str(f['index']) for f in files if f['index'] not in keep]
    api('torrents/filePrio', {'hash': h, 'id': '|'.join(drop), 'priority': 0})
    api('torrents/filePrio', {'hash': h,
                              'id': '|'.join(str(i) for i in sorted(keep)),
                              'priority': 1})
    api('torrents/start', {'hashes': h})
    print('\napplied: %d files selected, %d deselected, torrent started'
          % (len(keep), len(drop)))
    io.open(os.path.join(HERE, 'chosen_s%d.tsv' % season), 'w', encoding='utf8').write(
        '\n'.join('%d\t%s\t%s' % (ep, led.get(ep, ('?',))[0], chosen[ep]['name'])
                  for ep in sorted(chosen)))


# Guarded so choose() can be imported and checked on its own, which is how the
# hardened rules were confirmed to pick the same files already downloaded.
if __name__ == '__main__':
    main()
