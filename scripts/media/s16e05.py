#!/usr/bin/env python3
"""Build the one season 16 episode with no file: The Story & the Engine.

Its twenty-one siblings came off iPlayer as 1080p25 H.264 with E-AC-3 5.1, and
that is the shape this has to match or the season plays inconsistently. The only
source available is the 2160p Disney+ rip, which is HDR10 with a Dolby Vision
enhancement layer.

Downscaling HDR without tone mapping is the trap here: the picture arrives grey
and flat on every SDR client, and it looks like a bad encode rather than a
colour-space mistake. So the chain converts properly — linearise, map with
Hable, return to bt709 — rather than just resizing.

Audio is copied, not re-encoded. E-AC-3 is what the rest of the season carries
and `lib/streams.js` already marks those episodes not-web-ready so the client
routes around the browser; converting to AAC here would make this one episode
behave differently from the other twenty-one.
"""
import glob
import os
import subprocess
import sys

OUT = os.path.join(os.path.expanduser('~'), 'Downloads', 'content', 'new_who',
                   'season_16')
STEM = 'S16_E05_the_story__the_engine'

# The input side has to be stated, and the conversion to float has to happen
# before zscale rather than after. This is a Dolby Vision file whose colour
# metadata lives in the DV RPU, so ffprobe reports colour_space, transfer and
# primaries all as "unknown" and zscale answers "no path between colorspaces"
# however the tags are named downstream. Converting to gbrpf32le first, then
# naming smpte2084 / bt2020 and the bt709 output primaries in a single zscale,
# is the arrangement that works; two other orderings were tried and did not.
#
# rin=tv despite the container claiming pc. A Disney+ HEVC base layer is
# limited range and the full-range tag is what a muxer writes when it has
# nothing better; taking it at its word would crush the blacks.
TONEMAP = (
    'format=gbrpf32le,'
    'zscale=tin=smpte2084:min=bt2020nc:pin=bt2020:rin=tv:'
    't=linear:npl=100:p=bt709,'
    'tonemap=hable:desat=0,'
    'zscale=t=bt709:m=bt709:r=tv,scale=-2:1080,format=yuv420p'
)


def main():
    hits = [p for p in glob.glob(os.path.join(
        os.path.expanduser('~'), 'Downloads', '*', '*S02E05*Story*.mkv'))]
    if not hits:
        raise SystemExit('source not found')
    src = hits[0]
    print('source: %s' % os.path.basename(src))

    mp4 = os.path.join(OUT, STEM + '.mp4')
    cmd = ['ffmpeg', '-y', '-i', src, '-map', '0:v:0', '-map', '0:a:0',
           '-vf', TONEMAP,
           '-c:v', 'h264_nvenc', '-preset', 'p5', '-rc', 'vbr', '-cq', '23',
           '-b:v', '0', '-maxrate', '12M', '-bufsize', '24M',
           '-profile:v', 'high', '-bf', '2',
           '-c:a', 'copy', '-movflags', '+faststart', mp4]
    print('encoding, tone mapped to SDR...')
    sys.stdout.flush()
    r = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    if r.returncode:
        print(r.stderr.decode('utf8', 'replace')[-2000:])
        raise SystemExit('ffmpeg failed')
    print('  %.2f GB' % (os.path.getsize(mp4) / 2**30))

    # The plain English track, not the SDH one: house style is dialogue only.
    srt = os.path.join(OUT, STEM + '.srt')
    if os.path.exists(srt) and os.path.getsize(srt) > 0:
        print('  subtitles already present, left alone')
        return
    r = subprocess.run(['ffmpeg', '-y', '-i', src, '-map', '0:2', '-c:s', 'srt', srt],
                       stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    print('  subtitles extracted' if not r.returncode else '  no subtitles extracted')


if __name__ == '__main__':
    main()
