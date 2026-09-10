#!/usr/bin/env python3
"""Fill the `have` column in the ledger from the files we actually hold.

    python ledger/scan.py            # report only
    python ledger/scan.py --write    # write the have column back into the TSVs

Local files are read from the per-series folders under ~/Downloads. New Who is
already uploaded, so it is read from data/media-probe.json instead of the disk.
`have` is derived, never hand-edited: run this again after downloading anything.
"""
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import build  # noqa: E402

DOWNLOADS = os.path.join(os.path.expanduser('~'), 'Downloads')
FFPROBE_CANDIDATES = [
    'ffprobe',
    os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Programs', 'Stremio', 'ffprobe.exe'),
]
FOLDER = {
    'classic-who': '1. Classic Who',
    'wilderness-years': '2. Wilderness Years',
    'torchwood': '4. Torchwood ✅',
    'sarah-jane': '5. The Sarah Jane Adventures ✅',
    'class': '6. Class ✅',
    'war-between-land-and-sea': '7. The War Between the Land and the Sea ✅',
}
VIDEO = ('.mkv', '.mp4', '.m4v', '.avi', '.ts', '.mov')
COVER = ('mjpeg', 'png', 'bmp', 'gif')
CACHE = os.path.join(HERE, 'out', 'probe-cache.json')


def ffprobe_path():
    for c in FFPROBE_CANDIDATES:
        if not c:
            continue
        if os.path.sep in c and os.path.exists(c):
            return c
        try:
            subprocess.run([c, '-version'], capture_output=True, check=True)
            return c
        except Exception:
            pass
    return None


def probe(ff, path):
    p = subprocess.run([ff, '-v', 'error', '-print_format', 'json',
                        '-show_streams', '-show_format', path],
                       capture_output=True)
    try:
        d = json.loads(p.stdout.decode('utf8', 'replace'))
    except Exception:
        return None
    vs = [s for s in d.get('streams', [])
          if s.get('codec_type') == 'video' and s.get('codec_name') not in COVER]
    aus = [s for s in d.get('streams', []) if s.get('codec_type') == 'audio']
    if not vs:
        return None
    v = vs[0]
    num, den = (str(v.get('r_frame_rate', '0/1')).split('/') + ['1'])[:2]
    fps = round(int(num) / int(den), 3) if den and int(den) else 0
    return dict(h=v.get('height'), w=v.get('width'), fps=fps,
                vcodec=v.get('codec_name'),
                acodec=aus[0].get('codec_name') if aus else None,
                acodecs=[a.get('codec_name') for a in aus],
                subs=[s.get('codec_name') for s in d.get('streams', [])
                      if s.get('codec_type') == 'subtitle'],
                size=int(d.get('format', {}).get('size', 0)))


def describe(m):
    """One short cell reporting exactly what the file says: 1080p 25fps AAC.

    The usual NNNp shorthand is only used when the frame really is 16:9. A
    2:1 frame like Land and Sea's 1920x960 is written out in full, because
    calling it 1080p would claim a height the file does not have."""
    if not m:
        return ''
    h, w = m.get('h') or 0, m.get('w') or 0
    wide = bool(w and h) and abs((w / h) - 16 / 9) < 0.06
    label = ('%dp' % h) if wide or not w else '%dx%d' % (w, h)
    fps = m.get('fps') or 0
    fps_s = ('%g' % fps) if fps else '?'
    codecs = m.get('acodecs') or ([m['acodec']] if m.get('acodec') else [])
    seen, order = set(), []
    for c in codecs:
        c = (c or '?').upper().replace('EAC3', 'E-AC-3').replace('AC3', 'AC-3').replace('E-AC-3', 'E-AC-3').replace('TRUEHD', 'TrueHD')
        if c not in seen:
            seen.add(c); order.append(c)
    return '%s %sfps %s' % (label, fps_s, '/'.join(order) or '?')


def norm(s):
    return re.sub(r'[^a-z0-9]+', '', str(s).lower().replace('&', 'and'))


def new_who_map():
    """New Who is already uploaded. Join the probe records to the catalogue by
    title and type, because episode numbers in the ledger have moved since the
    files were uploaded."""
    probe_path = os.path.join(REPO, 'data', 'media-probe.json')
    if not os.path.exists(probe_path):
        return {}
    by_id = {}
    for e in json.load(open(probe_path, encoding='utf8')):
        by_id[e['id']] = dict(h=e.get('h'), w=e.get('w'), fps=None,
                              vcodec=(e.get('vcodec') or '').lower(),
                              acodec=(e.get('acodec') or '').lower(),
                              size=e.get('size') or 0)
    origin = os.path.join(REPO, 'data', 'media-origin.json')
    if os.path.exists(origin):
        for e in json.load(open(origin, encoding='utf8')):
            if e['id'] in by_id:
                by_id[e['id']]['fps'] = e.get('fps')
    try:
        dump = subprocess.run(
            ['node', '-e', "console.log(JSON.stringify(require('./data/new-who.js')))"],
            capture_output=True, cwd=REPO)
        catalogue = json.loads(dump.stdout.decode('utf8', 'replace'))
    except Exception:
        return {}
    out = {}
    for e in catalogue:
        sid = 'S%02dE%02d' % (e.get('season', 0), e.get('episode', 0))
        if sid in by_id:
            out[(norm(e.get('title')), e.get('type'))] = by_id[sid]
    return out


def main():
    write = '--write' in sys.argv
    ff = ffprobe_path()
    if not ff:
        sys.exit('ffprobe not found. Install ffmpeg, or run Stremio once so its copy exists.')
    cache = {}
    if os.path.exists(CACHE):
        try:
            cache = json.load(open(CACHE, encoding='utf8'))
        except Exception:
            cache = {}

    tabs, series, allwho = build.load()
    errs = build.validate(tabs, series, allwho)
    if errs:
        sys.exit('ledger does not check out, run build.py to see why')
    build.number(tabs, series)

    nw = new_who_map()
    totals = []
    for t in tabs:
        key = t['key']
        rows = series[key]
        found = {}
        if key == 'new-who':
            for r in rows:
                r['have'] = describe(nw.get((norm(r['title']), r['category'])))
        else:
            root = os.path.join(DOWNLOADS, FOLDER.get(key, ''))
            disk = {}
            if os.path.isdir(root):
                for dirpath, _, names in os.walk(root):
                    for n in names:
                        base, ext = os.path.splitext(n)
                        if ext.lower() in VIDEO:
                            disk[base] = os.path.join(dirpath, n)
            for r in rows:
                fn = (build.slug(build.cell_text(r)) if not t['numbered']
                      else ('S%02d_E%02d_%s' % (int(r['season']), r['ep'],
                                                build.slug(build.cell_text(r)))
                            if r['ep'] else None))
                path = disk.get(fn) if fn else None
                if not path:
                    r['have'] = ''
                    continue
                stamp = '%s:%d' % (path, os.path.getmtime(path))
                if stamp in cache:
                    m = cache[stamp]
                else:
                    m = probe(ff, path)
                    cache[stamp] = m
                r['have'] = describe(m)
                found[fn] = m
        have = sum(1 for r in rows if r.get('have'))
        totals.append((t['name'].replace(' ✅', ''), have, len(rows)))

    os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
    json.dump(cache, open(CACHE, 'w', encoding='utf8'))

    print('  %-40s %s' % ('series', 'files / items'))
    for name, have, n in totals:
        bar = '' if have == n else '   %d to get' % (n - have)
        print('  %-40s %4d / %-5d%s' % (name, have, n, bar))

    if not write:
        print('\n  report only. Pass --write to put these into the have column.')
        return
    for t in tabs:
        path = None
        for fn in sorted(os.listdir(os.path.join(HERE, 'series'))):
            if fn.endswith('-%s.tsv' % t['key']) or fn[3:-4] == t['key']:
                path = os.path.join(HERE, 'series', fn)
        if not path:
            continue
        with open(path, encoding='utf8') as fh:
            lines = fh.read().rstrip('\n').split('\n')
        head = lines[0].split('\t')
        if 'have' not in head:
            head.append('have')
        hi = head.index('have')
        out = ['\t'.join(head)]
        for r, line in zip(series[t['key']], lines[1:]):
            cells = line.split('\t')
            while len(cells) <= hi:
                cells.append('')
            cells[hi] = r.get('have', '')
            out.append('\t'.join(cells))
        with open(path, 'w', encoding='utf8', newline='\n') as fh:
            fh.write('\n'.join(out) + '\n')
    print('\n  have column written into ledger/series/*.tsv')


if __name__ == '__main__':
    main()
