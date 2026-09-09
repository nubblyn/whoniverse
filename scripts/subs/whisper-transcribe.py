#!/usr/bin/env python3
"""Transcribe whole episodes so our subtitles have something to be checked against.

    python scripts/subs/whisper-transcribe.py <video folder> <out folder>

OpenSubtitles allows five downloads a day on an API key, which is three weeks
for this catalogue. This has no limit at all: the audio is already on the disk.
It is also the better reference, because it comes from the exact file we are
shipping rather than from somebody's copy of a different broadcast.

Roughly seventeen times real time on the GPU, so a 45 minute episode takes two
and a half minutes and the whole catalogue takes about five hours. Already
transcribed episodes are skipped, so stopping and restarting costs nothing.

Feed the result to cross-check.py. Expect it to mishear the names — Kaagh and
Androvax mean nothing to it — which is why cross-check prints how often a word
appears in our own files: a real name recurs, a real mistake usually does not.
"""
import os
import subprocess
import sys

VIDEO = ('.mkv', '.mp4', '.m4v')


def cuda_on_path():
    import importlib.util
    spec = importlib.util.find_spec('nvidia')
    if not spec or not spec.submodule_search_locations:
        return
    root = spec.submodule_search_locations[0]
    for sub in ('cublas', 'cudnn'):
        d = os.path.join(root, sub, 'bin')
        if os.path.isdir(d):
            os.add_dll_directory(d)
            os.environ['PATH'] = d + os.pathsep + os.environ['PATH']


def stamp(seconds):
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return '%02d:%02d:%02d,%03d' % (h, m, s, ms)


def main():
    src, out = sys.argv[1], sys.argv[2]
    ffmpeg = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Programs', 'Stremio', 'ffmpeg.exe')

    jobs = []
    for base, _, names in os.walk(src):
        for f in sorted(names):
            if not f.lower().endswith(VIDEO):
                continue
            dest = os.path.join(out, os.path.splitext(f)[0] + '.srt')
            if not os.path.exists(dest):
                jobs.append((os.path.join(base, f), dest))
    if not jobs:
        print('nothing left to do')
        return

    cuda_on_path()
    from faster_whisper import WhisperModel
    import numpy

    def build(device):
        m = WhisperModel('large-v3', device=device,
                         compute_type='float16' if device == 'cuda' else 'int8',
                         cpu_threads=os.cpu_count() or 8)
        list(m.transcribe(numpy.zeros(16000, dtype='float32'))[0])
        return m

    try:
        model, where = build('cuda'), 'gpu'
    except Exception as exc:
        print('gpu unusable (%s), falling back to cpu' % str(exc).strip().split('\n')[-1][:70])
        model, where = build('cpu'), 'cpu'
    print('%d to transcribe, large-v3 on %s\n' % (len(jobs), where))

    os.makedirs(out, exist_ok=True)
    for n, (video, dest) in enumerate(jobs, 1):
        pcm = subprocess.run([ffmpeg, '-v', 'error', '-i', video, '-map', '0:a:0',
                              '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'],
                             capture_output=True)
        audio = numpy.frombuffer(pcm.stdout, dtype='<f4').copy()
        # Greedy and without word timings: this is read for its words, not its
        # clock, and both settings roughly double the speed.
        segments, _ = model.transcribe(audio, language='en', beam_size=1,
                                       vad_filter=False, word_timestamps=False,
                                       condition_on_previous_text=False)
        lines = []
        for i, s in enumerate(segments, 1):
            text = s.text.strip()
            if text:
                lines.append('%d\n%s --> %s\n%s\n' % (i, stamp(s.start), stamp(s.end), text))
        with open(dest, 'w', encoding='utf8', newline='\n') as fh:
            fh.write('\n'.join(lines))
        print('%3d/%d  %s  %d cues' % (n, len(jobs), os.path.basename(dest), len(lines)))


if __name__ == '__main__':
    main()
