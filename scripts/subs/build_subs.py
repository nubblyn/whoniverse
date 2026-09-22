#!/usr/bin/env python3
"""Subtitles for videos that carry none: a human track where one fits, else Whisper.

    python scripts/subs/build_subs.py targets.tsv OUTDIR          decide and write
    python scripts/subs/build_subs.py targets.tsv OUTDIR --report decide only

targets.tsv is whisper_batch.py's input. For each target with a transcript in
scripts/subs/subs/, this writes OUTDIR/<stem>.srt and a line in
OUTDIR/decisions.tsv saying which track it is and why.

The plan's order: a file's own track always wins, but these files have none,
so the choice is between a supplied subtitle and a generated one. The supplied
set is archive.org's doctor-who-1963_20251231, 614 human-made Classic .srt
named DoctorWho<season><episode><Title>.srt in the ledger's own numbering.
A human track is better than Whisper, but only if it is this episode and was
timed to this cut, so each one is tested against the episode's own speech:
the archive cues are shifted by offsets from -30 s to +30 s, and at each the
words of each cue are compared with the words Whisper heard in that cue's
window. The track is used, shifted by its best offset, when the mean overlap
reaches 0.50 and stands at least 0.20 above any offset two seconds or more
away. Timing alone was tried first and cannot judge: Classic dialogue is dense
enough that nearly any shift puts a cue start near some word, and it scored an
unrelated offset at 87%.

A supplied track then goes through housestyle.py, which changes presentation
only, never the words. A Whisper track goes through srtify.build(), which is
clean.py's repairs plus the house rules.
"""
import io
import os
import re
import subprocess
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import srtify  # noqa: E402

SUBS = os.path.join(HERE, 'subs')
ARCHIVE = 'https://archive.org/download/doctor-who-1963_20251231/'
MIN_SHARE = 0.50      # mean share of a cue's words Whisper also heard there


def secs(tc):
    h, m, rest = tc.strip().split(':')
    s, ms = re.split(r'[,.]', rest)
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def tc(t):
    t = max(t, 0)
    return '%02d:%02d:%02d,%03d' % (t // 3600, (t % 3600) // 60, t % 60, round(t % 1 * 1000) % 1000)


def archive_index():
    """name -> file for the archive item, fetched once."""
    import json
    meta = json.load(urllib.request.urlopen('https://archive.org/metadata/doctor-who-1963_20251231', timeout=120))
    return [f['name'] for f in meta.get('files', []) if f['name'].lower().endswith('.srt')]


def cue_starts(srt_text):
    return [secs(m.group(1)) for m in re.finditer(r'(\d+:\d+:\d+[,.]\d+)\s*-->', srt_text)]


def shift(srt_text, off):
    def one(m):
        return '%s --> %s' % (tc(secs(m.group(1)) + off), tc(secs(m.group(2)) + off))
    return re.sub(r'(\d+:\d+:\d+[,.]\d+)\s*-->\s*(\d+:\d+:\d+[,.]\d+)', one, srt_text)


def tokens(s):
    return set(re.findall(r"[a-z']+", s.lower().replace('’', "'"))) - {'', "'"}


TIMING = re.compile(r'(\d+:\d+:\d+[,.]\d+)\s*-->\s*(\d+:\d+:\d+[,.]\d+)')


def cues_of(srt_text):
    """(start, end, word set) per cue with at least two words of dialogue."""
    out = []
    for block in re.split(r'\n\s*\n', srt_text.strip()):
        lines = block.split('\n')
        at = next((i for i, l in enumerate(lines) if TIMING.search(l)), None)
        if at is None:
            continue
        m = TIMING.search(lines[at])
        text = ' '.join(lines[at + 1:])
        words = tokens(re.sub(r'<[^>]+>|\[[^\]]*\]|\([^)]*\)', ' ', text))
        if len(words) >= 2:
            out.append((secs(m.group(1)), secs(m.group(2)), words))
    return out


def fit(cues, spoken):
    """(best score, best offset, runner-up score at least 2 s away).

    Timing alone cannot judge a track: Classic dialogue is dense enough that
    almost any shift puts a cue start within half a second of some word, so
    the first version of this found 87% "agreement" at offsets that were
    simply wrong. The words decide instead. At each offset, each cue's words
    are compared with the words Whisper heard in that cue's window, and the
    mean overlap is the score. A human track of this episode, timed to this
    cut, agrees closely at one offset and nowhere else; a track for another
    episode, or another edit, agrees nowhere.
    """
    import bisect
    if not cues or not spoken:
        return 0.0, 0.0, 0.0
    spoken = sorted(spoken)
    starts = [s for s, _ in spoken]
    step = max(1, len(cues) // 80)          # 80 cues spread across the episode
    sample = cues[::step]

    def score(off):
        tot = 0.0
        for a, b, t in sample:
            i = bisect.bisect_left(starts, a + off - 0.7)
            heard = set()
            while i < len(spoken) and spoken[i][0] <= b + off + 0.7:
                heard |= spoken[i][1]
                i += 1
            tot += len(t & heard) / len(t)
        return tot / len(sample)

    coarse = [(score(k / 2), k / 2) for k in range(-60, 61)]
    s0, o0 = max(coarse)
    fine = [(score(o0 + k / 10), round(o0 + k / 10, 1)) for k in range(-10, 11)]
    best = max(fine)
    rival = max((s for s, o in coarse if abs(o - best[1]) >= 2.0), default=0.0)
    return best[0], best[1], rival


def main():
    targets, outdir = sys.argv[1], sys.argv[2]
    report = '--report' in sys.argv
    os.makedirs(outdir, exist_ok=True)
    names = archive_index()
    rows = [l.rstrip('\n').split('\t') for l in io.open(targets, encoding='utf8') if l.strip()]
    log = []
    for series, season, stem, path, title in rows:
        wj = os.path.join(SUBS, stem + '.whisper.json')
        if not os.path.exists(wj):
            log.append((stem, 'pending', 'no transcript yet', ''))
            continue
        import json
        data = json.load(io.open(wj, encoding='utf8'))
        spoken = [(w['s'], tokens(w['w'])) for s in data for w in (s.get('words') or [])]
        spoken = [(t, k) for t, k in spoken if k]
        choice, why, text = None, '', None
        m = re.match(r'S(\d+)_E(\d+)_', stem)
        if series == 'classic-who' and m:
            code = 'DoctorWho%02d%02d' % (int(m.group(1)), int(m.group(2)))
            cands = [n for n in names if n.startswith(code)]
            if cands:
                raw = urllib.request.urlopen(ARCHIVE + urllib.request.quote(cands[0]), timeout=120).read()
                srt = raw.decode('utf-8-sig', 'replace').replace('\r\n', '\n').replace('\r', '\n')
                share, off, rival = fit(cues_of(srt), spoken)
                if share >= MIN_SHARE and share - rival >= 0.20:
                    choice = 'archive'
                    why = '%s, words agree %.2f at %+.1f s (next best %.2f)' % (cands[0], share, off, rival)
                    text = shift(srt, off)
                else:
                    why = '%s rejected: words agree %.2f at %+.1f s, next best %.2f' % (cands[0], share, off, rival)
        if choice is None:
            built, problems = srtify.build(wj)
            if built is None:
                log.append((stem, 'FAILED', 'srtify: %s' % problems, ''))
                continue
            choice, text = 'whisper', built
            why = (why + '; ' if why else '') + 'Whisper large-v3, %d cues' % built.count(' --> ')
        out = os.path.join(outdir, stem + '.srt')
        if not report:
            if choice == 'archive':
                tmp = out + '.in'
                io.open(tmp, 'w', encoding='utf8', newline='\n').write(text)
                subprocess.run([sys.executable, os.path.join(HERE, 'housestyle.py'), tmp, out],
                               check=True, capture_output=True)
                os.remove(tmp)
            else:
                io.open(out, 'w', encoding='utf8', newline='\n').write(text)
        log.append((stem, choice, why, path))
        print('  %-50s %-8s %s' % (stem[:50], choice, why[:90]), flush=True)
    io.open(os.path.join(outdir, 'decisions.tsv'), 'w', encoding='utf8', newline='\n').write(
        '\n'.join('\t'.join(r) for r in log) + '\n')
    done = [r for r in log if r[1] in ('archive', 'whisper')]
    print('\n%d built (%d archive, %d whisper), %d pending, %d failed' % (
        len(done), sum(r[1] == 'archive' for r in log), sum(r[1] == 'whisper' for r in log),
        sum(r[1] == 'pending' for r in log), sum(r[1] == 'FAILED' for r in log)))


if __name__ == '__main__':
    main()
