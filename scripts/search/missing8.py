#!/usr/bin/env python3
"""Hashes for the eight 2160p episodes that are not already downloaded.

The other fourteen are sitting in ~/Downloads as zips, so querying them again
would only produce links for files we hold. This asks about the eight that are
actually missing.

"Best" is seeders first, then size, with a ceiling on size: the goal is a good
source at the right resolution and audio, encoded for streaming, not the
largest file in existence. A 40GB remux of a 4GB WEB-DL is not an upgrade for
this catalogue, it is a bandwidth bill.
"""
import io, json, os, re, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pq import search, hash_of

MIN_GB, MAX_GB = 1.5, 12.0

TARGETS = [
    ('14', 'The Star Beast', ['doctor who the star beast 2160p'], None),
    ('15', 'The Church on Ruby Road', ['doctor who church on ruby road 2160p'], None),
    ('15', 'Dot and Bubble', ['doctor who dot and bubble 2160p',
                              'doctor who 2023 S01E05 2160p'], r'S01E05|S14E05'),
    ('15', 'Rogue', ['doctor who rogue 2160p',
                     'doctor who 2023 S01E06 2160p'], r'S01E06|S14E06'),
    ('15', 'Empire of Death', ['doctor who empire of death 2160p',
                               'doctor who 2023 S01E08 2160p'], r'S01E08|S14E08'),
    ('16', 'The Robot Revolution', ['doctor who the robot revolution 2160p',
                                    'doctor who 2023 S02E01 2160p'], r'S02E01|S15E01'),
    ('16', 'Lucky Day', ['doctor who lucky day 2160p',
                         'doctor who 2023 S02E04 2160p'], r'S02E04|S15E04'),
    ('10', 'Twice Upon a Time', ['doctor who twice upon a time 2160p'], None),
]

TRACKERS = ''.join('&tr=' + t for t in (
    'udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce',
    'udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce',
    'udp%3A%2F%2Fopen.demonii.com%3A1337%2Fannounce',
    'udp%3A%2F%2Fexodus.desync.com%3A6969%2Fannounce',
    'udp%3A%2F%2Ftracker.openbittorrent.com%3A6969%2Fannounce',
))


def flat(x):
    return re.sub(r'[^a-z0-9]+', ' ', x.lower().replace("'", '')).strip()


def candidates(title, queries, code):
    want, seen, out = flat(title), set(), []
    for q in queries:
        try:
            res = search(q, 200)
        except Exception as e:
            print('  ! %s: %s' % (q, str(e)[:50]), file=sys.stderr)
            continue
        for x in res:
            name = re.sub(r'[._-]+', ' ', x.get('title') or '')
            gb = (x.get('size') or 0) / 1e9
            ih = hash_of(x)
            if not re.search(r'2160p', name, re.I):
                continue
            if not re.search(r'doctor\s*who', name, re.I):
                continue
            if not (want in flat(name) or (code and re.search(code, name, re.I))):
                continue
            if gb < MIN_GB or gb > MAX_GB or not ih or ih in seen:
                continue
            seen.add(ih)
            out.append({'seeders': x.get('seeders') or 0, 'gb': round(gb, 2),
                        'indexer': x.get('indexer') or '', 'title': name.strip(),
                        'infohash': ih})
    out.sort(key=lambda c: (-c['seeders'], -c['gb']))
    return out


def main():
    report = []
    for season, title, queries, code in TARGETS:
        c = candidates(title, queries, code)
        report.append({'season': season, 'title': title, 'candidates': c[:4]})
        if c:
            b = c[0]
            print('S%-3s %-26s %4ds %6.2fGB %-14s %s'
                  % (season, title[:26], b['seeders'], b['gb'], b['indexer'][:14],
                     b['infohash']), file=sys.stderr)
        else:
            print('S%-3s %-26s NOTHING under %dGB' % (season, title[:26], MAX_GB),
                  file=sys.stderr)
        time.sleep(0.3)

    lines = ['Whoniverse - the eight 2160p episodes not already on disk',
             'Paste into qBittorrent.', '']
    total = 0.0
    for o in report:
        if not o['candidates']:
            lines += ['# S%s %s - nothing matched under %dGB' % (o['season'], o['title'], MAX_GB), '']
            continue
        b = o['candidates'][0]
        total += b['gb']
        lines += ['# S%s %s' % (o['season'], o['title']),
                  '#   %s' % b['title'],
                  '#   %d seeders, %.2f GB, %s' % (b['seeders'], b['gb'], b['indexer']),
                  'magnet:?xt=urn:btih:%s&dn=%s%s'
                  % (b['infohash'], b['title'].replace(' ', '.'), TRACKERS), '']
    lines.insert(2, '%d of %d matched, %.1f GB total' % (
        sum(1 for o in report if o['candidates']), len(report), total))
    text = '\n'.join(lines)
    io.open('missing8.txt', 'w', encoding='utf8', newline='\n').write(text + '\n')
    io.open('missing8.json', 'w', encoding='utf8').write(
        json.dumps(report, indent=1, ensure_ascii=False))
    print(text)


if __name__ == '__main__':
    main()
