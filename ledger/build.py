#!/usr/bin/env python3
"""Validate the ledger and write what is built from it.

The TSVs in this directory are the source of truth. This script checks them
and writes out/file-names.tsv, every row with its S01_E01_slug file name, and
data/registry.json, which the addon reads for its own name and every series'
prose. board.py builds the ledger page from the same files.

    python ledger/build.py

There used to be a Google Sheet built from here as an xlsx and imported by
hand. It was dropped on 23 September 2026: /ledger is the one ledger.
"""
import json, os, re, sys, unicodedata
from collections import Counter, OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, 'out')

CATEGORY_ORDER = ['Main Show', 'Special', 'Minisode', 'Animated Series',
                  'Prequel', 'Animated Restoration', 'Movie']


def read_tsv(path):
    # Every row must have exactly as many columns as the header. This used to
    # pad short rows with empty strings, which hid a lost tab: The Christmas
    # Invasion ran `checked` and `have` together into one cell, so best stayed
    # right, checked became "2026-09-151872x1080 23.976fps AAC", released took
    # the description and the description went empty, and the build said
    # nothing. A dropped tab is a typo, not a shape to accommodate.
    with open(path, encoding='utf8') as fh:
        rows = [ln.rstrip('\n').split('\t') for ln in fh if ln.strip('\n')]
    head, body = rows[0], rows[1:]
    ragged = ['%s line %d: %d columns, header has %d'
              % (os.path.basename(path), i, len(r), len(head))
              for i, r in enumerate(body, 2) if len(r) != len(head)]
    if ragged:
        raise SystemExit('ragged TSV, a tab is missing or doubled:\n  '
                         + '\n  '.join(ragged))
    return [OrderedDict(zip(head, r)) for r in body]


def load():
    # series.tsv is the registry: one row per series, holding everything the
    # addon needs to describe it. The prose used to live apart, in
    # lib/series.js, which is how the film ended up with no description at all.
    tabs = []
    for t in read_tsv(os.path.join(HERE, 'series.tsv')):
        tabs.append(dict(key=t['key'], name=t['name'],
                         numbered=t['numbered'] == '1',
                         cats=t['categories'].split('|'),
                         folder=t.get('folder', ''),
                         stremio_id=t.get('stremio_id', ''),
                         data=t.get('data', ''),
                         art=t.get('art', ''),
                         release_info=t.get('release_info', ''),
                         genres=[g for g in t.get('genres', '').split('|') if g],
                         description=t.get('description', ''),
                         # The chronology has no series file: it is the whole
                         # of all-who.tsv, so it is validated and numbered
                         # from there rather than from a file of its own.
                         derived=t.get('derived', '') == '1'))
    series = {}
    for fn in sorted(os.listdir(os.path.join(HERE, 'series'))):
        if fn.endswith('.tsv'):
            series[fn.split('-', 1)[1][:-4]] = read_tsv(os.path.join(HERE, 'series', fn))
    allwho = read_tsv(os.path.join(HERE, 'all-who.tsv'))
    return tabs, series, allwho


def validate(tabs, series, allwho):
    errs = []
    keys = [t['key'] for t in tabs if not t['derived']]
    for k in series:
        if k not in keys:
            errs.append('series file %s has no row in series.tsv' % k)
    for t in tabs:
        if t['derived']:
            continue
        rows = series.get(t['key'])
        if rows is None:
            errs.append('series.tsv lists %s but there is no series file' % t['key']); continue
        seen = Counter()
        for i, r in enumerate(rows, 2):
            where = '%s line %d' % (t['key'], i)
            if r['category'] not in t['cats']:
                errs.append('%s: category %r is not one of %s' % (where, r['category'], t['cats']))
            if r['category'] not in CATEGORY_ORDER:
                errs.append('%s: unknown category %r' % (where, r['category']))
            if r['status'] not in ('ok', 'missing'):
                errs.append('%s: status must be ok or missing, got %r' % (where, r['status']))
            if (r['status'] == 'missing') != bool(r['note'].strip()):
                errs.append('%s: a missing row needs a note, an ok row must not have one' % where)
            if r['season'] != '-' and not r['season'].isdigit():
                errs.append('%s: season must be a number or -' % where)
            if not r['title'].strip():
                errs.append('%s: empty title' % where)
            seen[(r['season'], r['category'], r['title'])] += 1
        for (s, cat, ti), n in seen.items():
            if n > 1:
                errs.append('%s: %r (%s) appears %d times in season %s' % (t['key'], ti, cat, n, s))
    have = Counter((r['series'], r['season'], r['category'], r['title']) for r in allwho)
    want = Counter((t['key'], r['season'], r['category'], r['title'])
                   for t in tabs if not t['derived']
                   for r in series.get(t['key'], []))
    for k in want - have:
        errs.append('all-who.tsv is missing %s' % (k,))
    for k in have - want:
        errs.append('all-who.tsv has %s, which is in no series file' % (k,))
    return errs


def number(tabs, series):
    """episode numbers per season, in file order"""
    for t in tabs:
        if t['derived']:
            continue
        counter = Counter()
        for r in series[t['key']]:
            if r['season'] == '-':
                r['ep'] = None
            else:
                counter[r['season']] += 1
                r['ep'] = counter[r['season']]


NO_SUFFIX = ('Main Show', 'Movie')


def cell_text(r):
    t = r['title']
    if r['category'] not in NO_SUFFIX:
        t += ' (%s)' % r['category']
    if r['status'] == 'missing':
        t += ' ⚠️ (%s)' % r['note']
    return t


def slug(text):
    text = re.sub(r'⚠️?\s*\([^)]*\)$', '', text).strip()
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode().lower()
    text = text.replace(' ', '_')
    return re.sub(r'_+$', '', re.sub(r'[^a-z0-9_]', '', text))


def _height(text):
    """The vertical resolution a string is talking about, as a 16:9 equivalent.

    A 2:1 frame like 1920x960 is a 1080-class picture with the letterbox baked
    out, not a shortfall, so it is compared on the height a 16:9 frame of the
    same width would have. Frames narrower than 16:9, such as a 720x576 PAL
    DVD, keep their real height.
    """
    if not text:
        return None
    m = re.search(r'(\d{3,4})\s*[pi]\b', text)
    if m:
        return int(m.group(1))
    m = re.search(r'(\d{3,4})x(\d{3,4})', text)
    if m:
        w, h = int(m.group(1)), int(m.group(2))
        return max(h, round(w * 9 / 16))
    if re.search(r'\bSD\b', text):
        return 576
    return None


def registry(tabs):
    """Everything the addon needs to describe itself, straight from the ledger.

    Written into data/ rather than out/ because the addon loads it at runtime
    and out/ is generated output that the deploy ignores.
    """
    addon = {r['field']: r['value'] for r in read_tsv(os.path.join(HERE, 'addon.tsv'))}
    missing = [t['key'] for t in tabs if not t['description']]
    if missing:
        raise SystemExit('these series have no description in series.tsv: %s'
                         % ', '.join(missing))
    out = {
        'addon': addon,
        'series': [
            OrderedDict((
                ('key', t['key']), ('stremioId', t['stremio_id']),
                ('name', t['name']),
                ('folder', t['folder']), ('data', t['data']), ('art', t['art']),
                ('releaseInfo', t['release_info']), ('genres', t['genres']),
                ('description', t['description']),
            )) for t in tabs
        ],
    }
    path = os.path.join(ROOT, 'data', 'registry.json')
    with open(path, 'w', encoding='utf8', newline='\n') as fh:
        json.dump(out, fh, indent=1, ensure_ascii=False)
        fh.write('\n')


def main():
    tabs, series, allwho = load()
    errs = validate(tabs, series, allwho)
    if errs:
        print('%d problem(s) in the ledger:' % len(errs))
        for e in errs[:40]:
            print('  ' + e)
        sys.exit(1)
    number(tabs, series)

    # The chronology has no rows of its own: it is every other series in
    # broadcast order, so it is skipped everywhere a series file is read.
    real = [t for t in tabs if not t['derived']]
    os.makedirs(OUT, exist_ok=True)

    # released and description ride along so anything building a data file has
    # the whole row and does not have to go back to the series TSV for the two
    # columns the addon actually shows a viewer.
    names = ['series\tseason\tepisode\tcategory\tstatus\ttitle\tfile_name\t'
             'best	checked	have	source	released	description	note']
    for t in real:
        for r in series[t['key']]:
            fn = ''
            if r['ep'] is not None:
                fn = (slug(cell_text(r)) if not t['numbered']
                      else 'S%02d_E%02d_%s' % (int(r['season']), r['ep'], slug(cell_text(r))))
            names.append('\t'.join([t['key'], r['season'], str(r['ep'] or ''),
                                    r['category'], r['status'], r['title'], fn,
                                    r.get('best') or '', r.get('checked') or '',
                                    r.get('have') or '',
                                    (r.get('source') or '').replace('	', ' '),
                                    r.get('released') or '',
                                    (r.get('description') or '').replace('\t', ' '),
                                    (r.get('note') or '').replace('\t', ' ')]))
    with open(os.path.join(OUT, 'file-names.tsv'), 'w', encoding='utf8', newline='\n') as fh:
        fh.write('\n'.join(names) + '\n')

    for t in real:
        print('  %-40s %5d rows' % (t['name'], len(series[t['key']])))
    print('  %-40s %5d rows' % ('Complete Chronology', len(allwho)))
    registry(tabs)
    print('  wrote %s' % os.path.join(OUT, 'file-names.tsv'))
    print('  wrote %s' % os.path.join(ROOT, 'data', 'registry.json'))


if __name__ == '__main__':
    main()
