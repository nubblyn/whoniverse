#!/usr/bin/env python3
"""Write an SRT from a video's audio, for the handful of items that have no
subtitle track at all.

    python scripts/subs/transcribe.py <video> [more videos...]

Uses faster-whisper with large-v3 on the GPU, falling back to the CPU. Output
lands next to the video as .srt, wrapped to the house rules: at most two lines
of 42 characters. This is a first draft, not a finished subtitle. Machine
transcription mishears names badly, so read it against the picture before
shipping it, and run strip-sdh, polish and lint over it afterwards.
"""
import os
import sys
import textwrap

MAX_LINE = 42
MAX_LINES = 2


def timestamp(seconds):
    ms = int(round(seconds * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return '%02d:%02d:%02d,%03d' % (h, m, s, ms)


def wrap(text):
    text = ' '.join(text.split())
    lines = textwrap.wrap(text, MAX_LINE) or ['']
    return lines


def split_long(segments):
    """A cue that cannot fit two lines is split on word timings instead of
    being left as a wall of text."""
    for seg in segments:
        words = [w for w in (seg.words or []) if w.word.strip()]
        text = seg.text.strip()
        if len(wrap(text)) <= MAX_LINES or not words:
            yield seg.start, seg.end, text
            continue
        budget = MAX_LINE * MAX_LINES
        chunk, start = [], words[0].start
        for w in words:
            candidate = (' '.join(x.word.strip() for x in chunk + [w])).strip()
            if chunk and len(candidate) > budget:
                yield start, chunk[-1].end, ' '.join(x.word.strip() for x in chunk)
                chunk, start = [w], w.start
            else:
                chunk.append(w)
        if chunk:
            yield start, chunk[-1].end, ' '.join(x.word.strip() for x in chunk)


def transcribe(path, model):
    segments, info = model.transcribe(
        path, language='en', beam_size=5, vad_filter=True,
        word_timestamps=True,
        condition_on_previous_text=False,   # stops it looping on repeated lines
    )
    cues = []
    for start, end, text in split_long(segments):
        if not text:
            continue
        cues.append((start, end, '\n'.join(wrap(text)[:MAX_LINES])))
    out = []
    for i, (start, end, text) in enumerate(cues, 1):
        out.append('%d\n%s --> %s\n%s\n' % (i, timestamp(start), timestamp(end), text))
    return '\n'.join(out), info


def main():
    videos = sys.argv[1:]
    if not videos:
        sys.exit('usage: python scripts/subs/transcribe.py <video> [more...]')
    from faster_whisper import WhisperModel

    def build(device):
        kind = 'float16' if device == 'cuda' else 'int8'
        model = WhisperModel('large-v3', device=device, compute_type=kind,
                             cpu_threads=os.cpu_count() or 8)
        # Constructing the model does not touch CUDA. The missing-DLL failure
        # only surfaces on the first encode, so force one on a second of
        # silence rather than discovering it halfway through an episode.
        import numpy
        list(model.transcribe(numpy.zeros(16000, dtype='float32'))[0])
        return model

    where = 'gpu'
    try:
        model = build('cuda')
    except Exception as exc:
        print('  gpu unusable (%s)' % str(exc).strip().split('\n')[-1][:90])
        print('  falling back to cpu, which is slower but needs no CUDA libraries')
        model, where = build('cpu'), 'cpu'
    print('  large-v3 running on %s' % where)
    for path in videos:
        srt = os.path.splitext(path)[0] + '.srt'
        text, info = transcribe(path, model)
        with open(srt, 'w', encoding='utf8', newline='\n') as fh:
            fh.write(text)
        print('  %s -> %d cues, %.0fs of audio, language %s at %.2f confidence'
              % (os.path.basename(srt), text.count('-->'), info.duration,
                 info.language, info.language_probability))


if __name__ == '__main__':
    main()
