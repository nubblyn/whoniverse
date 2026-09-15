#!/usr/bin/env python3
"""Pull the seven rows the BBC publishes itself on the official YouTube channel.

No indexer carries these, and Destination: Skaro is on the channel under a name
that mentions neither the Doctor nor Skaro, so no title search could reach it.

Format choice follows the catalogue's rule rather than "whatever is biggest":
up to 2160p, H.264 or VP9 in mp4 where YouTube offers it, merged with the best
m4a audio. Subtitles are pulled if the uploader wrote any; auto-captions are
not, because the Whisper pass produces better ones and we already know it.
"""
import os, subprocess, sys

OUT = os.path.join(os.path.expanduser('~'), 'Downloads', 'whoniverse-youtube')

ITEMS = [
    ('S14_E01_destination_skaro',     'RfLtAdSgWPQ'),
    ('S11_twas_the_night',            'epjD_cn0yKg'),
    ('S12_the_runaway',               '-RPe6aNiotA'),
    ('S12_daleks_01',                 'd-HJqrE0fbk'),
    ('S12_daleks_02',                 'fsS2jMaAYbI'),
    ('S12_daleks_03',                 'FDXm5c0q51M'),
    ('S12_daleks_04',                 'X8pzP4zD46s'),
    ('S12_daleks_05',                 'ehQOBJsaUQs'),
]

FMT = ('bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/'
       'bestvideo[height<=2160]+bestaudio/best[height<=2160]')


def main():
    os.makedirs(OUT, exist_ok=True)
    bad = []
    for slug, vid in ITEMS:
        dest = os.path.join(OUT, slug + '.%(ext)s')
        print('\n=== %s  (%s)' % (slug, vid)); sys.stdout.flush()
        # yt-dlp is installed as a module here, not as an exe on PATH.
        cmd = [sys.executable, '-m', 'yt_dlp', '-f', FMT, '--merge-output-format', 'mp4',
               '--write-subs', '--sub-langs', 'en.*', '--convert-subs', 'srt',
               '--no-playlist', '--no-progress', '-o', dest,
               'https://www.youtube.com/watch?v=' + vid]
        r = subprocess.run(cmd)
        if r.returncode:
            bad.append(slug)
    print('\n%d of %d pulled into %s' % (len(ITEMS) - len(bad), len(ITEMS), OUT))
    if bad:
        print('failed: %s' % ', '.join(bad))


if __name__ == '__main__':
    main()
