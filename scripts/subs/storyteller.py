#!/usr/bin/env python3
"""Transcribe The Storyteller (Classic Who 2x40), which ships with no subtitles.

The official upload offers none and YouTube's automatic captions are refused
by the plan, so Whisper large-v3 it is. The prompt names the vocabulary of the
piece rather than the show generally: it is a sequel to The Myth Makers, with
Vicki living as Cressida in Troy, so those names come out phonetic without it.

Tries the GPU first and falls back to CPU on the first encode, which is where
a missing CUDA runtime shows itself rather than at model load.
"""
import io
import json
import os
import time

import faster_whisper

SP = os.path.dirname(os.path.abspath(__file__))
SUBS = os.path.join(SP, 'subs')
SRC = os.path.join(os.path.expanduser('~'), 'Downloads', 'content', 'classic_who',
                   'season_2', 'S02_E40_the_storyteller_minisode.mp4')
NAME = 'S02_E40_the_storyteller_minisode'
PROMPT = ('Doctor Who. The TARDIS, the Doctor, Vicki, Cressida, Troilus, Troy, '
          'the Trojans, Steven Taylor, Katarina, Time Lord, the Myth Makers.')


def transcribe(device, compute):
    model = faster_whisper.WhisperModel('large-v3', device=device, compute_type=compute)
    segs, _ = model.transcribe(SRC, language='en', beam_size=5, vad_filter=True,
                               word_timestamps=True, initial_prompt=PROMPT)
    return [{'start': s.start, 'end': s.end, 'text': s.text.strip(),
             'words': [{'w': w.word, 's': w.start, 'e': w.end} for w in (s.words or [])]}
            for s in segs]


def main():
    os.makedirs(SUBS, exist_ok=True)
    t0 = time.time()
    try:
        data = transcribe('cuda', 'float16')
        where = 'cuda'
    except Exception as e:
        print('gpu failed (%s), falling back to cpu' % str(e)[:90], flush=True)
        data = transcribe('cpu', 'int8')
        where = 'cpu'
    out = os.path.join(SUBS, NAME + '.whisper.json')
    json.dump(data, io.open(out, 'w', encoding='utf8'), ensure_ascii=False)
    print('%d segments on %s in %.0fs -> %s' % (len(data), where, time.time() - t0, out))


main()
