#!/usr/bin/env python3
"""Transcribe bucket videos that carry no subtitles at all, on the GPU.

    python scripts/subs/whisper_batch.py targets.tsv

targets.tsv: one line per video, tab-separated: series, season, stem, bucket
path relative to b2 whoniverse/, and the story title the vocabulary is built
from. Writes scripts/subs/subs/<stem>.whisper.json in the same shape the
minisode transcripts use, and skips any stem that already has one, so a run
can be stopped and started again.

Why the settings are what they are:
  - large-v3 on the RTX 3070 in float16. On the CPU it runs at about real
    time, which for 27 hours of audio is a day and a half; the CUDA 12
    cuBLAS and cuDNN wheels from PyPI make it an hour. Their DLL folders have
    to be added by hand on Windows before ctranslate2 loads.
  - The voice-activity gate stays on, because a whole episode has long music
    beds that Whisper otherwise fills with invented lines, but with its
    threshold lowered from 0.5 to 0.35. At 0.5 it dropped the whole second
    half of Hello Boys!, quiet dialogue under wind.
  - initial_prompt names the era's people and the story's title. It is what
    stops proper nouns coming out phonetic, and the Hello Boys! run showed it
    can also be where a hallucination gets its words, so every run is checked
    for coverage afterwards rather than trusted.

Audio is read straight from B2's own host, which answers range requests,
into a 16 kHz mono WAV in a temp folder, a few files ahead of the GPU.
"""
import concurrent.futures as cf
import io
import json
import os
import site
import subprocess
import sys
import tempfile
import time

for sp in site.getsitepackages() + [site.getusersitepackages()]:
    for sub in ('nvidia/cublas/bin', 'nvidia/cudnn/bin'):
        d = os.path.join(sp, sub)
        if os.path.isdir(d):
            os.add_dll_directory(d)
            os.environ['PATH'] = d + os.pathsep + os.environ['PATH']

import faster_whisper  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'subs')
ORIGIN = 'https://f003.backblazeb2.com/file/whoniverse/'

# Who is on screen, by Classic season, for the vocabulary. The Wilderness
# pieces are listed by story below instead, since each has its own cast.
ERA = {
    1: 'Ian, Barbara, Susan', 2: 'Ian, Barbara, Vicki, Steven', 3: 'Steven, Vicki, Dodo, Katarina, Sara Kingdom',
    4: 'Ben, Polly, Jamie', 5: 'Jamie, Victoria, Zoe, the Brigadier', 6: 'Jamie, Zoe, the Brigadier',
    13: 'Sarah Jane, Harry, the Brigadier, UNIT, Sergeant Benton', 20: 'Tegan, Turlough, Nyssa, Kamelion, the Master',
}
STORY = {
    'Dimensions in Time': 'the Rani, EastEnders, Albert Square',
    'Doctor Who and the Curse of Fatal Death': 'the Master, Emma, Daleks, Tersurus',
    'Death Comes to Time': 'the Minister of Chance, Antimony, Casmus, the Canisian, Time Lords',
    'Real Time': 'Evelyn Smythe, the Cybermen, Chronos, Goddard',
    'Shada': 'Romana, K-9, Professor Chronotis, Skagra, Chris Parsons, Clare Keightley, Gallifrey',
    # New Who series 2; ERA is keyed by Classic season and would give it Ian and Barbara.
    'Tardisode': 'Rose, Mickey, Torchwood, Novice Hame, the Sisters of Plenitude, Cybus Industries, '
                 'John Lumic, the Cybermen, the Preachers, Madame de Pompadour, the Ood, Sanctuary Base, LINDA, Magpie',
}


def prompt(series, season, title):
    base = 'Doctor Who. The Doctor, the TARDIS, Time Lord. '
    for k, v in STORY.items():
        if title.startswith(k):
            return base + '%s. %s.' % (k, v)
    return base + '%s. %s.' % (title.split(' (')[0], ERA.get(int(season), ''))


def fetch(path, tmp):
    wav = os.path.join(tmp, os.path.basename(path).rsplit('.', 1)[0] + '.wav')
    if not os.path.exists(wav):
        subprocess.run(['ffmpeg', '-v', 'error', '-i', ORIGIN + path, '-map', '0:a:0', '-ac', '1',
                        '-ar', '16000', '-y', wav], check=True, timeout=3600)
    return wav


def main():
    rows = [l.rstrip('\n').split('\t') for l in io.open(sys.argv[1], encoding='utf8') if l.strip()]
    todo = [r for r in rows if not os.path.exists(os.path.join(OUT, r[2] + '.whisper.json'))]
    print('%d targets, %d already transcribed, %d to go' % (len(rows), len(rows) - len(todo), len(todo)), flush=True)
    if not todo:
        return
    os.makedirs(OUT, exist_ok=True)
    model = faster_whisper.WhisperModel('large-v3', device='cuda', compute_type='float16')
    tmp = tempfile.mkdtemp(prefix='whisper_batch_')
    with cf.ThreadPoolExecutor(max_workers=3) as pool:
        futures = [pool.submit(fetch, r[3], tmp) for r in todo]
        for r, fut in zip(todo, futures):
            series, season, stem, path, title = r
            t0 = time.time()
            try:
                wav = fut.result()
            except Exception as e:  # noqa: BLE001
                print('  AUDIO FAILED %s: %s' % (stem, e), flush=True)
                continue
            segs, info = model.transcribe(
                wav, language='en', beam_size=5, word_timestamps=True,
                vad_filter=True, vad_parameters={'threshold': 0.35, 'min_speech_duration_ms': 120},
                initial_prompt=prompt(series, season, title))
            data = [{'start': s.start, 'end': s.end, 'text': s.text.strip(),
                     'words': [{'w': w.word, 's': w.start, 'e': w.end} for w in (s.words or [])]}
                    for s in segs]
            json.dump(data, io.open(os.path.join(OUT, stem + '.whisper.json'), 'w', encoding='utf8'),
                      ensure_ascii=False)
            speech = sum(s['end'] - s['start'] for s in data)
            print('  %-52s %4d segs  %5.1f/%5.1f min speech  %4.0fs' % (
                stem[:52], len(data), speech / 60, info.duration / 60, time.time() - t0), flush=True)
            try:
                os.remove(wav)
            except OSError:
                pass


if __name__ == '__main__':
    main()
