#!/usr/bin/env python3
"""Rewrite the New Who have column from the files actually on disk.

    python have_new_who.py            dry run, shows every change
    python have_new_who.py --write    write series/04-new-who.tsv

Rows are matched by the file name the ledger itself generates, not by title or
by SxxExx. The ledger is what named these files, so the join is exact, and it
sidesteps the drift that makes episode codes unreliable elsewhere.

Three things this has to get right, learned the hard way on Classic Who:

  - ffprobe is a native Windows binary, so paths go through cygpath -w first.
    Nine Classic files failed silently this way and wrote empty fields.
  - Probe every audio stream, not a:0. Dual-track files are recorded "AAC/DTS"
    and taking the first stream quietly downgrades them.
  - Resolution is "<height>p" only when the width is the 16:9 standard for that
    height, otherwise "<width>x<height>". Several New Who episodes are 1920x960.

Seasons 14 to 16 are left alone: they hold 1080p placeholders awaiting the 4K
copies, and recording those as what we have would misreport them as settled.
"""
import io
import os
import subprocess
import sys

ROOT = 'C:/Users/hello/Documents/Claude Projects/Whoniverse Stremio Addon'
TSV = os.path.join(ROOT, 'ledger', 'series', '04-new-who.tsv')
NAMES = os.path.join(ROOT, 'ledger', 'out', 'file-names.tsv')
CONTENT = os.path.join(os.path.expanduser('~'), 'Downloads', 'content', 'new_who')
LIMIT = 13

# 16:9 widths, by height
STD = {1080: 1920, 720: 1280, 576: 1024, 480: 854, 360: 640, 2160: 3840}
AUDIO = {'aac': 'AAC', 'eac3': 'E-AC-3', 'ac3': 'AC-3', 'dts': 'DTS',
         'truehd': 'TrueHD', 'mp3': 'MP3', 'opus': 'Opus', 'flac': 'FLAC',
         'vorbis': 'Vorbis', 'pcm_s16le': 'PCM'}


def win(p):
    return subprocess.run(['cygpath', '-w', p], capture_output=True,
                          text=True).stdout.strip() or p


def fps_of(rate):
    try:
        num, den = rate.split('/')
        v = float(num) / float(den) if float(den) else 0.0
    except Exception:
        return ''
    if not v:
        return ''
    s = '%.3f' % v
    return s.rstrip('0').rstrip('.')


def describe(path):
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries',
         'stream=codec_type,codec_name,width,height,avg_frame_rate',
         '-of', 'default=nw=1', win(path)], capture_output=True, text=True).stdout
    w = h = 0
    rate = ''
    auds = []
    for blk in out.strip().split('codec_name=')[1:]:
        d = dict(ln.split('=', 1) for ln in ('codec_name=' + blk).splitlines()
                 if '=' in ln)
        if d.get('codec_type') == 'video' and not w:
            w = int(d.get('width') or 0)
            h = int(d.get('height') or 0)
            rate = d.get('avg_frame_rate', '')
        elif d.get('codec_type') == 'audio':
            auds.append(AUDIO.get(d.get('codec_name', ''), d.get('codec_name', '').upper()))
    if not h:
        return ''
    res = '%dp' % h if STD.get(h) == w else '%dx%d' % (w, h)
    fps = fps_of(rate)
    parts = [res]
    if fps:
        parts.append(fps + 'fps')
    if auds:
        parts.append('/'.join(auds))
    return ' '.join(parts)


def rows_of(path):
    lines = io.open(path, encoding='utf8').read().split('\n')
    head = lines[0].split('\t')
    out = []
    for ln in lines[1:]:
        if ln.strip():
            c = ln.split('\t')
            while len(c) < len(head):
                c.append('')
            out.append(c)
    return head, out


def main():
    do = '--write' in sys.argv
    import csv
    want = {}
    for r in csv.DictReader(io.open(NAMES, encoding='utf8'), delimiter='\t'):
        if r['series'] == 'new-who' and r.get('file_name'):
            want[(r['season'], r['category'], r['title'])] = r['file_name']

    head, rows = rows_of(TSV)
    i = {k: head.index(k) for k in ('season', 'category', 'title', 'have')}
    changed = cleared = same = skipped = 0
    for r in rows:
        s = r[i['season']]
        if not s.isdigit() or int(s) > LIMIT:
            skipped += 1
            continue
        key = (s, r[i['category']], r[i['title']])
        fn = want.get(key)
        if not fn:
            print('  ! no file name for %s' % (key,))
            continue
        path = os.path.join(CONTENT, 'season_%d' % int(s), fn + '.mp4')
        new = describe(path) if os.path.exists(path) else ''
        old = r[i['have']]
        if new == old:
            same += 1
            continue
        if new:
            changed += 1
            print('  %-50s %-28s -> %s' % (fn[:50], old or '(blank)', new))
        else:
            cleared += 1
            print('  %-50s %-28s -> (no file)' % (fn[:50], old or '(blank)'))
        r[i['have']] = new

    print('\n%d changed, %d cleared, %d unchanged, %d outside seasons 1-%d'
          % (changed, cleared, same, skipped, LIMIT))
    if do:
        io.open(TSV, 'w', encoding='utf8', newline='\n').write(
            '\n'.join(['\t'.join(head)] + ['\t'.join(r) for r in rows]) + '\n')
        print('written')
    else:
        print('dry run. Re-run with --write')


if __name__ == '__main__':
    main()
