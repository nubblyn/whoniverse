#!/usr/bin/env python3
"""Is content/new_who fit to upload? Checks the four silent failures.

    python ready.py

From the adding-a-series checklist, in the order they bite:

  codec tag   HEVC must be tagged hvc1. Apple's player refuses hev1 outright,
              and it refuses it without saying why.
  faststart   moov must sit before mdat or every play costs an extra round
              trip while the client hunts for the index.
  audio       Dolby tracks play silent in browsers unless the episode's data
              row carries an explicit audio flag.
  subtitles   must be real SRT text, not a renamed picture format.

Reads the head of each file directly rather than shelling out per check, so a
250-file sweep is seconds.
"""
import os
import re
import subprocess
import collections

# New Who by default, because that is the tree this was written for. READY_CONTENT
# points it at another one, e.g. READY_CONTENT=~/Downloads/content/classic_who for
# a Classic season. Same override srtify.py takes as SUBS_CONTENT.
ROOT = os.path.expanduser(os.environ.get(
    'READY_CONTENT', os.path.join('~', 'Downloads', 'content', 'new_who')))


def head_boxes(path, n=2 << 20):
    """Top-level box names in order, from the first n bytes."""
    names, off = [], 0
    with open(path, 'rb') as fh:
        buf = fh.read(n)
    while off + 8 <= len(buf):
        size = int.from_bytes(buf[off:off + 4], 'big')
        name = buf[off + 4:off + 8].decode('latin-1')
        if not re.match(r'^[a-zA-Z0-9 ]{4}$', name):
            break
        names.append(name)
        if size == 1:
            size = int.from_bytes(buf[off + 8:off + 16], 'big')
        if size <= 0:
            break
        off += size
    return names


def main():
    rows = []
    for d in sorted(os.listdir(ROOT)):
        p = os.path.join(ROOT, d)
        if not os.path.isdir(p):
            continue
        for f in sorted(os.listdir(p)):
            # MKV as well as MP4. The Classic Blu-ray seasons are all Matroska,
            # and scanning only .mp4 meant a Classic folder passed every check
            # without a single file having been looked at.
            if f.lower().endswith(('.mp4', '.m4v', '.mkv')):
                rows.append(os.path.join(p, f))
    print('%d videos in %s\n' % (len(rows), ROOT))

    tags = collections.Counter()
    faststart = collections.Counter()
    audio = collections.Counter()
    bad_tag, bad_fs, dolby = [], [], []

    for p in rows:
        # ffprobe prints fields in its own order, not the order asked for, so
        # read them as key=value rather than trusting column positions
        out = subprocess.run(
            ['ffprobe', '-v', 'error', '-show_entries',
             'stream=codec_type,codec_name,codec_tag_string',
             '-of', 'default=nw=1', p],
            capture_output=True, text=True).stdout
        vtag = vcodec = acodec = '?'
        for blk in out.strip().split('codec_name=')[1:]:
            blk = 'codec_name=' + blk
            d = dict(ln.split('=', 1) for ln in blk.splitlines() if '=' in ln)
            if d.get('codec_type') == 'video':
                vcodec = d.get('codec_name', '?')
                vtag = d.get('codec_tag_string', '?')
            elif d.get('codec_type') == 'audio' and acodec == '?':
                acodec = d.get('codec_name', '?')
        tags['%s/%s' % (vcodec, vtag)] += 1
        audio[acodec] += 1
        if vcodec == 'hevc' and vtag != 'hvc1':
            bad_tag.append((p, vtag))
        if acodec in ('eac3', 'ac3', 'truehd', 'dts'):
            dolby.append((p, acodec))
        # moov/mdat are MP4 boxes; Matroska has no such thing and nothing to
        # order wrongly, so it is counted apart rather than failed.
        if p.lower().endswith('.mkv'):
            faststart['n/a (mkv)'] += 1
        else:
            boxes = head_boxes(p)
            fs = 'moov' in boxes and (('mdat' not in boxes) or
                                      boxes.index('moov') < boxes.index('mdat'))
            faststart['yes' if fs else 'no'] += 1
            if not fs:
                bad_fs.append(p)

    print('video codec / tag:')
    for k, n in tags.most_common():
        print('   %-22s %4d%s' % (k, n, '   <- hev1, Apple refuses this' if k.endswith('hev1') else ''))
    print('\naudio codec:')
    for k, n in audio.most_common():
        print('   %-22s %4d%s' % (k, n, '   <- needs an audio flag in the data row' if k in ('eac3', 'ac3') else ''))
    print('\nfaststart (moov before mdat): %s' % dict(faststart))

    if bad_fs:
        print('\n%d files without faststart, first few:' % len(bad_fs))
        for p in bad_fs[:5]:
            print('   ', os.path.relpath(p, ROOT))
    if dolby:
        print('\n%d files with Dolby audio, first few:' % len(dolby))
        for p, c in dolby[:8]:
            print('   %-58s %s' % (os.path.relpath(p, ROOT), c))

    srt = [os.path.join(dp, f) for dp, _, fs2 in os.walk(ROOT) for f in fs2
           if f.lower().endswith('.srt')]
    bad_srt = []
    for s in srt:
        with open(s, 'rb') as fh:
            start = fh.read(200)
        if b'-->' not in start and b'-->' not in open(s, 'rb').read(4000):
            bad_srt.append(s)
    print('\nsubtitles: %d srt, %d that do not look like SRT text' % (len(srt), len(bad_srt)))
    for s in bad_srt[:5]:
        print('   ', os.path.relpath(s, ROOT))


if __name__ == '__main__':
    main()
