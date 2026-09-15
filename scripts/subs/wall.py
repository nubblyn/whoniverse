#!/usr/bin/env python3
"""Transcribe the Lockdown minisodes, which have no published subtitles.

    python wall.py

YouTube's automatic captions were the first attempt and are not good enough:
no punctuation on ten of the eleven, no capitalisation, and proper nouns come
out as nonsense ("a groupie computer"). Whisper large-v3 punctuates, and an
initial prompt naming the show's vocabulary keeps TARDIS, Zygon and the rest
from being spelled phonetically.

Word timestamps are kept so cues can be cut at sentence boundaries later.
Output is subs/<name>.whisper.json, one file per episode.
"""
import io
import json
import os
import sys
import time

import faster_whisper

SP = os.path.dirname(os.path.abspath(__file__))
SUBS = os.path.join(SP, 'subs')
CONTENT = os.path.join(os.path.expanduser('~'), 'Downloads', 'content', 'new_who')

PROMPT = ('Doctor Who. The TARDIS, the Doctor, Gallifrey, Time Lord, Dalek, '
          'Cybermen, Zygon, Sontaran, UNIT, Rory Williams, Amy Pond, Clara '
          'Oswald, Danny Pink, Madame de Pompadour, Reinette, Novice Hame, '
          'Osgood, Coal Hill School, the Master, Missy, sonic screwdriver.')

ITEMS = [
    (2, 'S02_E05_pompadour_minisode'),
    (2, 'S02_E12_the_genuine_article_minisode'),
    (3, 'S03_E04_the_secret_of_novice_hame_minisode'),
    (4, 'S04_E03_the_descendants_of_pompeii_minisode'),
    (5, 'S05_E01_the_raggedy_doctor_by_amelia_pond_minisode'),
    (7, 'S07_E11_rorys_story_minisode'),
    (8, 'S08_E14_fear_is_a_superpower_minisode'),
    (9, 'S09_E11_the_zygon_isolation_minisode'),
    (10, 'S10_E14_the_best_of_days_minisode'),
    (12, 'S12_E12_shadow_of_a_doubt_minisode'),
    (12, 'S12_E13_the_shadow_in_the_mirror_minisode'),
]


def main():
    os.makedirs(SUBS, exist_ok=True)
    model = faster_whisper.WhisperModel('large-v3', device='cpu', compute_type='int8')
    print('model ready', flush=True)
    for season, name in ITEMS:
        out = os.path.join(SUBS, name + '.whisper.json')
        if os.path.exists(out):
            print('  = %s already done' % name, flush=True)
            continue
        src = os.path.join(CONTENT, 'season_%d' % season, name + '.mp4')
        if not os.path.exists(src):
            print('  ! %s missing video' % name, flush=True)
            continue
        t0 = time.time()
        segs, info = model.transcribe(src, language='en', beam_size=5,
                                      vad_filter=True, word_timestamps=True,
                                      initial_prompt=PROMPT)
        data = []
        for s in segs:
            data.append({
                'start': s.start, 'end': s.end, 'text': s.text.strip(),
                'words': [{'w': w.word, 's': w.start, 'e': w.end}
                          for w in (s.words or [])],
            })
        json.dump(data, io.open(out, 'w', encoding='utf8'), ensure_ascii=False)
        print('  %-52s %3d segments in %3.0fs' % (name[:52], len(data),
                                                  time.time() - t0), flush=True)


if __name__ == '__main__':
    main()
