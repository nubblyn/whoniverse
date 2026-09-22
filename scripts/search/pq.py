#!/usr/bin/env python3
"""Query Prowlarr and print what the indexers actually returned.

    python pq.py "doctor who 2023 s01e02 2160p"
    python pq.py "doctor who flux" --min 1 --limit 25
    python pq.py "born again minisode" --raw      # no filtering at all

Every release in a report has to come out of this. It prints the title verbatim
as the indexer gave it, so nothing can be paraphrased into existing: if a line
is not in this output, it was not found.

Columns: seeders, size in GB, indexer, age in days, then the title.
`--min` drops anything under that many GB, which is how the subtitle packs and
the 0.01GB decoys riding an episode name get out of the way. `--raw` keeps
them, for the minisodes where a real file legitimately is tiny.
"""
import argparse
import io
import json
import os
import re
import sys
import urllib.parse
import urllib.request

HOST = os.environ.get('PROWLARR_HOST', 'http://127.0.0.1:9696')


def key():
    """The API key, from the environment or from Prowlarr's own config, where
    the service keeps it anyway. Nothing is copied out of it, so there is no
    second place the key can leak from."""
    k = os.environ.get('PROWLARR_KEY')
    if k:
        return k.strip()
    cfg = r'C:/ProgramData/Prowlarr/config.xml'
    m = re.search(r'<ApiKey>([^<]+)</ApiKey>', io.open(cfg, encoding='utf8').read())
    if not m:
        raise SystemExit('no Prowlarr key: set PROWLARR_KEY, or check %s' % cfg)
    return m.group(1).strip()


def hash_of(x):
    """The infohash of a result, from the field or from the links.

    Several indexers return no infoHash at all — TorrentDownload is the one
    that matters here, because it carries the best-seeded copy of most of the
    2160p episodes. Its guid is the torrent page URL and the 40-hex hash is the
    first path segment of it, so the hash was there all along. Reading it keeps
    the 244-seeder release instead of dropping to a 13-seeder mirror.
    """
    ih = (x.get('infoHash') or '').strip().lower()
    if ih:
        return ih
    for field in ('magnetUrl', 'guid', 'infoUrl', 'downloadUrl'):
        v = x.get(field) or ''
        m = re.search(r'btih:([0-9a-fA-F]{40})', v) or re.search(r'(?<![0-9a-fA-F])([0-9a-fA-F]{40})(?![0-9a-fA-F])', v)
        if m:
            return m.group(1).lower()
    return ''


def search(q, limit=200):
    url = HOST + '/api/v1/search?' + urllib.parse.urlencode(
        {'query': q, 'type': 'search', 'limit': limit})
    req = urllib.request.Request(url)
    req.add_header('X-Api-Key', key())
    with urllib.request.urlopen(req, timeout=420) as r:
        return json.loads(r.read().decode('utf8'))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('query')
    ap.add_argument('--min', type=float, default=0.0, help='minimum size in GB')
    ap.add_argument('--limit', type=int, default=200)
    ap.add_argument('--match', default='', help='regex the title must contain')
    ap.add_argument('--raw', action='store_true', help='no size or title filter')
    ap.add_argument('--json', action='store_true')
    a = ap.parse_args()

    try:
        res = search(a.query, a.limit)
    except Exception as e:
        print('SEARCH FAILED: %s' % e, file=sys.stderr)
        sys.exit(2)

    out = []
    for x in res:
        title = re.sub(r'[._]+', ' ', x.get('title') or '').strip()
        gb = (x.get('size') or 0) / 1e9
        if not a.raw and gb < a.min:
            continue
        if a.match and not re.search(a.match, title, re.I):
            continue
        out.append({
            'seeders': x.get('seeders') or 0,
            'gb': round(gb, 2),
            'indexer': x.get('indexer') or '',
            'age_days': int(x.get('age') or 0),
            'title': title,
            'infohash': hash_of(x),
        })
    out.sort(key=lambda r: (-r['seeders'], -r['gb']))

    if a.json:
        print(json.dumps(out, indent=1))
        return
    print('%d results for %r' % (len(out), a.query))
    for r in out:
        print('  %4ds %7.2fGB %-14s %5dd  %s'
              % (r['seeders'], r['gb'], r['indexer'][:14], r['age_days'], r['title'][:96]))


if __name__ == '__main__':
    main()
