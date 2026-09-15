#!/usr/bin/env python3
"""Retag and faststart the MP4s that came from the backup rather than KONTRAST.

    python retag.py            dry run, lists what would change
    python retag.py --write    do it

scripts/remux.js already does this, but only for MKV sources. These files are
already MP4: pulled from the b2 backup, they carry the `hev1` tag Apple refuses
and were written without `+faststart`, so the index sits behind the media and
every play costs an extra round trip.

A container rewrite, not a re-encode: both streams are copied byte for byte.
Each output is verified before it replaces its source, and the source is kept
until then, so an interrupted run loses nothing.
"""
import os
import subprocess
import sys

ROOT = os.path.join(os.path.expanduser('~'), 'Downloads', 'content', 'new_who')
LIMIT = 13  # seasons 14-16 are placeholders awaiting 4K; leave them alone


def probe(path):
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries',
         'stream=codec_type,codec_name,codec_tag_string:format=duration',
         '-of', 'default=nw=1', path], capture_output=True, text=True).stdout
    v = {'codec': '?', 'tag': '?'}
    dur = 0.0
    for blk in out.strip().split('codec_name=')[1:]:
        d = dict(ln.split('=', 1) for ln in ('codec_name=' + blk).splitlines() if '=' in ln)
        if d.get('codec_type') == 'video':
            v = {'codec': d.get('codec_name', '?'), 'tag': d.get('codec_tag_string', '?')}
        if 'duration' in d:
            dur = float(d['duration'])
    for ln in out.splitlines():
        if ln.startswith('duration='):
            try:
                dur = float(ln.split('=', 1)[1])
            except ValueError:
                pass
    return v, dur


def moov_first(path):
    with open(path, 'rb') as fh:
        head = fh.read(64 * 1024)
    m, d = head.find(b'moov'), head.find(b'mdat')
    return m != -1 and (d == -1 or m < d)


def tail_reads(path):
    r = subprocess.run(
        ['ffmpeg', '-v', 'error', '-sseof', '-3', '-i', path, '-map', '0:v:0',
         '-vf', 'scale=32:32', '-pix_fmt', 'gray', '-f', 'rawvideo', '-'],
        capture_output=True)
    return r.returncode == 0 and len(r.stdout) > 0


def main():
    do = '--write' in sys.argv
    jobs = []
    for d in sorted(os.listdir(ROOT)):
        if not d.startswith('season_'):
            continue
        s = int(d.split('_')[1])
        if s > LIMIT:
            continue
        for f in sorted(os.listdir(os.path.join(ROOT, d))):
            if not f.lower().endswith('.mp4'):
                continue
            p = os.path.join(ROOT, d, f)
            v, dur = probe(p)
            need = []
            if v['codec'] == 'hevc' and v['tag'] != 'hvc1':
                need.append('tag ' + v['tag'])
            if not moov_first(p):
                need.append('faststart')
            if need:
                jobs.append((p, f, dur, need))

    print('%d files to rewrite in seasons 1-%d\n' % (len(jobs), LIMIT))
    for p, f, dur, need in jobs:
        print('  %-58s %s' % (f[:58], ', '.join(need)))
    if not do:
        print('\ndry run. Re-run with --write')
        return

    print()
    ok = fail = 0
    for p, f, dur, need in jobs:
        tmp = p[:-4] + '.tmp.mp4'
        # the hvc1 tag belongs to HEVC only: MP4 refuses a header that claims it
        # over an H.264 stream, which is what the AVC files here are
        tag = ['-tag:v', 'hvc1'] if probe(p)[0]['codec'] == 'hevc' else []
        r = subprocess.run(
            ['ffmpeg', '-v', 'error', '-y', '-i', p, '-map', '0', '-c', 'copy',
             '-dn', '-map_chapters', '-1'] + tag +
            ['-movflags', '+faststart', tmp], capture_output=True, text=True)
        why = None
        if r.returncode != 0 or not os.path.exists(tmp):
            why = 'ffmpeg: ' + (r.stderr.strip().splitlines() or ['no output'])[-1][:70]
        else:
            v2, dur2 = probe(tmp)
            if v2['codec'] == 'hevc' and v2['tag'] != 'hvc1':
                why = 'tag still %s' % v2['tag']
            elif not moov_first(tmp):
                why = 'moov still behind mdat'
            elif dur and abs(dur2 - dur) > 1.0:
                why = 'duration %.1f vs %.1f' % (dur2, dur)
            elif not tail_reads(tmp):
                why = 'tail does not decode'
        if why:
            fail += 1
            print('  FAIL %-52s %s' % (f[:52], why))
            if os.path.exists(tmp):
                os.remove(tmp)
            continue
        os.replace(tmp, p)
        ok += 1
        print('  ok   %-52s %s' % (f[:52], ', '.join(need)))
    print('\n%d rewritten, %d failed' % (ok, fail))


if __name__ == '__main__':
    main()
