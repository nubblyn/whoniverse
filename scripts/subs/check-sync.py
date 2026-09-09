#!/usr/bin/env python3
"""Measure how far each subtitle file sits from the speech in its video.

    python scripts/subs/check-sync.py <folder> [--windows 3] [--seconds 60]

ffsubsync was the obvious tool and it was wrong: on a file that was already in
step it proposed a 56 second shift, because it aligns a voice-activity trace
against subtitle timings and any long stretch of music or effects fools it.

This asks a different question. Whisper is run over a few short windows of the
audio and gives a word with a timestamp. For each candidate offset, count how
many of those words appear in the subtitle text near where the offset says they
should be. The offset that matches the most words is the drift, and the match
rate says whether to believe it. Text has to agree as well as timing, so music
cannot fool it.

An offset of zero with a high score means the file is in step. A low score at
every offset means the check could not decide, usually a window with little
speech in it, and says so rather than inventing a number.
"""
import os
import re
import subprocess
import sys

WINDOW = 60          # seconds of audio per sample
SAMPLES = 3          # samples spread across the episode
SEARCH = 10.0        # look this many seconds either way
STEP = 0.25          # offset resolution
TOLERANCE = 1.5      # a word counts as matched within this many seconds

FFMPEG = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Programs', 'Stremio', 'ffmpeg.exe')
FFPROBE = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Programs', 'Stremio', 'ffprobe.exe')
VIDEO = ('.mkv', '.mp4', '.m4v')


def cuda_on_path():
    """ctranslate2 loads its CUDA libraries from PATH, and pip puts them
    somewhere it never looks."""
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


def duration(path):
    out = subprocess.run([FFPROBE, '-v', 'error', '-show_entries', 'format=duration',
                          '-of', 'csv=p=0', path], capture_output=True, text=True)
    return float(out.stdout.strip())


def audio(path, start, length):
    import numpy
    out = subprocess.run([FFMPEG, '-v', 'error', '-ss', str(start), '-t', str(length),
                          '-i', path, '-map', '0:a:0', '-ac', '1', '-ar', '16000',
                          '-f', 'f32le', '-'], capture_output=True)
    return numpy.frombuffer(out.stdout, dtype='<f4').copy()


def ms(t):
    m = re.match(r'(\d+):(\d+):(\d+)[,.](\d+)', t)
    return ((int(m[1]) * 60 + int(m[2])) * 60 + int(m[3])) + int(m[4]) / 1000


def read_srt(path):
    """Every word with the time of the cue it sits in, spread evenly across it."""
    words = []
    text = open(path, encoding='utf8').read().replace('﻿', '').replace('\r', '')
    for block in text.split('\n\n'):
        lines = block.split('\n')
        i = next((i for i, x in enumerate(lines) if '-->' in x), None)
        if i is None:
            continue
        a, z = (ms(x.strip()) for x in lines[i].split('-->'))
        body = ' '.join(lines[i + 1:])
        toks = re.findall(r"[a-z']+", body.lower())
        if not toks:
            continue
        span = max(z - a, 0.1)
        for k, w in enumerate(toks):
            words.append((a + span * (k + 0.5) / len(toks), w.strip("'")))
    return words


def offset_for(heard, written):
    """The shift that lines up the most spoken words with written ones."""
    if len(heard) < 25:
        return None, 0.0, len(heard)
    best, best_score = 0.0, -1.0
    n = int(SEARCH / STEP)
    for k in range(-n, n + 1):
        off = k * STEP
        score = 0
        for t, w in heard:
            if len(w) < 3:
                continue
            for wt, ww in written:
                if abs(wt - (t + off)) <= TOLERANCE and ww == w:
                    score += 1
                    break
        if score > best_score:
            best, best_score = off, score
    usable = sum(1 for _, w in heard if len(w) >= 3)
    return best, best_score / max(usable, 1), usable


def main():
    root = sys.argv[1]
    global SAMPLES, WINDOW
    if '--windows' in sys.argv:
        SAMPLES = int(sys.argv[sys.argv.index('--windows') + 1])
    if '--seconds' in sys.argv:
        WINDOW = int(sys.argv[sys.argv.index('--seconds') + 1])

    videos = []
    for base, _, names in os.walk(root):
        for f in sorted(names):
            if f.lower().endswith(VIDEO) and os.path.exists(os.path.join(base, os.path.splitext(f)[0] + '.srt')):
                videos.append(os.path.join(base, f))
    if not videos:
        sys.exit('no video with a matching .srt under ' + root)

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
    print('%d files, large-v3 on %s, %d windows of %ds each\n' % (len(videos), where, SAMPLES, WINDOW))

    bad = []
    for path in videos:
        srt = os.path.splitext(path)[0] + '.srt'
        written = read_srt(srt)
        total = duration(path)
        results = []
        for frac in [0.2 + 0.55 * i / max(SAMPLES - 1, 1) for i in range(SAMPLES)]:
            start = total * frac
            segs, _ = model.transcribe(audio(path, start, WINDOW), language='en',
                                       vad_filter=False, word_timestamps=True,
                                       condition_on_previous_text=False)
            heard = [(start + w.start, w.word.strip().lower().strip(".,!?'\"-"))
                     for s in segs for w in (s.words or [])]
            heard = [(t, w) for t, w in heard if re.fullmatch(r"[a-z']+", w)]
            off, score, n = offset_for(heard, written)
            results.append((off, score, n))
        name = os.path.relpath(srt, root).replace('\\', '/')
        good = [r for r in results if r[1] >= 0.25]
        if not good:
            print('%-58s could not tell (best match %.0f%%)' % (name, max(r[1] for r in results) * 100))
            bad.append((name, None))
            continue
        offs = [r[0] for r in good]
        worst = max(abs(o) for o in offs)
        flag = ''
        # A cue is normally cut in a little before the line is spoken, and the
        # word times here are guessed by spreading a cue evenly, so anything
        # under a second and a half is the method's own noise. Class measured
        # at +-1.0s across the board with 84-100% word agreement, which is a
        # file in step, not a file adrift.
        if worst > 1.5:
            flag = '   ** out of step **'
            bad.append((name, worst))
        elif max(offs) - min(offs) > 2.0:
            flag = '   ** drifts **'
            bad.append((name, max(offs) - min(offs)))
        print('%-58s %s  match %s%s' % (
            name,
            ' '.join('%+5.2fs' % o for o in offs),
            ' '.join('%3.0f%%' % (r[1] * 100) for r in good),
            flag))

    print('\n%d of %d need a look' % (len(bad), len(videos)))
    for name, x in bad:
        print('  %s%s' % (name, '' if x is None else '  %.2fs' % x))


if __name__ == '__main__':
    main()
