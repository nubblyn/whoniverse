#!/usr/bin/env python3
"""Turn the official-channel pulls into catalogue files.

Three ledger rows have no copy in the bucket and no torrent anywhere, because
the BBC publishes them itself: 'Twas the Night Before Christmas, The Runaway,
and Daleks!. yt-dlp got them; this puts them in the naming scheme, in a
container every client can actually decode, and with their subtitles attached.

Three different jobs, because the three sources are three different things:

  'Twas the Night   already H.264 1080p25 with AAC, so it is a remux. Only the
                    moov atom moves to the front.
  The Runaway       VP9. No Stremio client decodes VP9 in MP4, so it is encoded
                    to H.264. Left at its native 30fps: it is a web-native 360
                    short, not a broadcast master, and forcing 25 would judder
                    a picture that has no 25fps original to return to.
  Daleks!           five AV1 parts, one ledger row. Concatenated in order and
                    encoded once, with the five subtitle files shifted by the
                    running duration so the cues still land.

Encoding is NVENC because there is a card here and this is a format change
rather than a quality decision — the source is already a YouTube encode, so
spending an hour of x264 on it buys nothing back.
"""
import io
import os
import re
import subprocess
import sys

YT = os.path.join(os.path.expanduser('~'), 'Downloads', 'whoniverse-youtube')
OUT = os.path.join(os.path.expanduser('~'), 'Downloads', 'content', 'new_who')

# NVENC at a constant quality, capped so nothing runs away. -bf 2 and a 2-second
# GOP keep it seekable; faststart and yuv420p keep it playable everywhere.
ENC = ['-c:v', 'h264_nvenc', '-preset', 'p5', '-rc', 'vbr', '-cq', '24',
       '-b:v', '0', '-maxrate', '8M', '-bufsize', '16M', '-profile:v', 'high',
       '-pix_fmt', 'yuv420p', '-bf', '2',
       '-c:a', 'aac', '-b:a', '192k', '-ac', '2',
       '-movflags', '+faststart']


def run(cmd):
    print('    $ ffmpeg ' + ' '.join(cmd[1:6]) + ' ...')
    sys.stdout.flush()
    r = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    if r.returncode:
        print(r.stderr.decode('utf8', 'replace')[-1500:])
        raise SystemExit('ffmpeg failed')


def duration(path):
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
         '-of', 'default=nw=1:nk=1', path],
        capture_output=True, text=True).stdout.strip()
    return float(out)


def shift_srt(text, offset, first_index):
    """Move every cue on by `offset` seconds and renumber from `first_index`."""
    def stamp(m):
        h, mi, s, ms = (int(m.group(i)) for i in range(1, 5))
        t = h * 3600 + mi * 60 + s + ms / 1000.0 + offset
        h, rem = divmod(t, 3600)
        mi, s = divmod(rem, 60)
        return '%02d:%02d:%02d,%03d' % (h, mi, int(s), round(s % 1 * 1000))
    text = re.sub(r'(\d{2}):(\d{2}):(\d{2}),(\d{3})', stamp, text)
    blocks = [b for b in re.split(r'\n\s*\n', text.strip()) if b.strip()]
    out = []
    for i, b in enumerate(blocks, start=first_index):
        lines = b.split('\n')
        if lines[0].strip().isdigit():
            lines = lines[1:]
        out.append('%d\n%s' % (i, '\n'.join(lines)))
    return out


def one(src, dest_rel, mode):
    dest = os.path.join(OUT, dest_rel)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    print('\n%s' % os.path.basename(dest))
    if mode == 'remux':
        run(['ffmpeg', '-y', '-i', src, '-map', '0:v:0', '-map', '0:a:0',
             '-c', 'copy', '-movflags', '+faststart', dest])
    else:
        run(['ffmpeg', '-y', '-i', src, '-map', '0:v:0', '-map', '0:a:0',
             '-vf', 'scale=-2:1080'] + ENC + [dest])
    print('    %.2f GB' % (os.path.getsize(dest) / 2**30))
    # The subtitle, if yt-dlp got one, alongside under the same stem.
    for lang in ('en-GB', 'en'):
        s = os.path.splitext(src)[0] + '.%s.srt' % lang
        if os.path.exists(s):
            d = os.path.splitext(dest)[0] + '.srt'
            io.open(d, 'w', encoding='utf8', newline='\n').write(
                io.open(s, encoding='utf8').read())
            print('    subtitles copied')
            break


def daleks():
    parts = [os.path.join(YT, 'S12_daleks_0%d.mp4' % n) for n in range(1, 6)]
    missing = [p for p in parts if not os.path.exists(p)]
    if missing:
        print('  ! missing %d parts, skipping Daleks!' % len(missing))
        return
    dest = os.path.join(OUT, 'season_12', 'S12_E14_daleks_animated_series.mp4')
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    print('\n%s' % os.path.basename(dest))

    listing = os.path.join(YT, '_daleks.txt')
    io.open(listing, 'w', encoding='utf8', newline='\n').write(
        '\n'.join("file '%s'" % p.replace('\\', '/') for p in parts) + '\n')
    run(['ffmpeg', '-y', '-f', 'concat', '-safe', '0', '-i', listing,
         '-map', '0:v:0', '-map', '0:a:0', '-vf', 'scale=-2:1080'] + ENC + [dest])
    print('    %.2f GB' % (os.path.getsize(dest) / 2**30))

    # One row, five subtitle files. Each is timed from zero, so each has to move
    # on by everything that plays before it.
    cues, offset, idx = [], 0.0, 1
    for p in parts:
        s = os.path.splitext(p)[0] + '.en-GB.srt'
        if os.path.exists(s):
            blocks = shift_srt(io.open(s, encoding='utf8').read(), offset, idx)
            cues += blocks
            idx += len(blocks)
        offset += duration(p)
    if cues:
        io.open(os.path.splitext(dest)[0] + '.srt', 'w',
                encoding='utf8', newline='\n').write('\n\n'.join(cues) + '\n')
        print('    %d subtitle cues across five parts' % len(cues))


def main():
    one(os.path.join(YT, 'S11_twas_the_night.mp4'),
        'season_11/S11_E11_twas_the_night_before_christmas_minisode.mp4', 'remux')
    one(os.path.join(YT, 'S12_the_runaway.mp4'),
        'season_12/S12_E04_the_runaway_animated_series.mp4', 'encode')
    daleks()


if __name__ == '__main__':
    main()
