#!/usr/bin/env python3
"""Bring a supplied .srt into the catalogue's house style.

    python housestyle.py in.srt out.srt

srtify.py does this for Whisper output, building cues from word timestamps. This
does it for a subtitle that already exists: a BBC iPlayer track, a disc rip, any
finished .srt whose wording is worth keeping but whose presentation is not.

What it changes, and nothing else:

  colour markup   <font color=...> removed. The BBC uses colour to tell speakers
                  apart and it is unreadable over picture. The colour is read
                  BEFORE it is discarded, so a change of colour inside one cue
                  becomes the house-style dash rather than being lost.
  speaker dashes  two speakers in one cue get a dash on every line, no space
                  after it. A single speaker never gets one.
  SDH             [door creaks], (BREATHING SHAKILY) and bare NAME: labels go.
  line length     at most two lines, at most 42 characters each, rewrapped on
                  word boundaries with the two lines balanced.
  duration        at least 0.8s, at most 7s, never overlapping the next cue.

What it never changes: the words themselves, their order, or a cue's start time.
Wording is the subtitler's work; presentation is ours.
"""
import io
import re
import sys

MAX_LINE = 42
MAX_LINES = 2
MIN_DUR = 0.80
MAX_DUR = 7.00

SDH_BRACKET = re.compile(r'[\[(][^\])]*[\])]')
SPEAKER_LABEL = re.compile(r'^[A-Z][A-Z0-9 .\'-]{1,20}:\s*')
FONT_OPEN = re.compile(r'<font[^>]*color="?(#?\w+)"?[^>]*>', re.I)
TAG = re.compile(r'</?[a-z][^>]*>', re.I)


def parse(text):
    """(start, end, [lines]) per cue. Tolerates a BOM and CRLF."""
    text = text.lstrip('﻿').replace('\r\n', '\n')
    out = []
    for block in re.split(r'\n\s*\n', text.strip()):
        lines = [l for l in block.split('\n') if l.strip()]
        if not lines:
            continue
        if '-->' not in lines[0]:
            lines = lines[1:]
        if not lines or '-->' not in lines[0]:
            continue
        m = re.match(r'\s*([\d:,.]+)\s*-->\s*([\d:,.]+)', lines[0])
        if not m:
            continue
        out.append([secs(m.group(1)), secs(m.group(2)), lines[1:]])
    return out


def merge_simultaneous(cues):
    """Fold cues that share a timestamp into one.

    The BBC splits a single on-screen subtitle across two cue records when it
    wants three display lines, giving two cues with identical start and end.
    Left alone they read as an overlap and each gets rewrapped separately, so
    the speaker dashes land wrong. Merged, they are one cue with two speakers.
    """
    out = []
    for start, end, lines in cues:
        if out and abs(out[-1][0] - start) < 0.005 and abs(out[-1][1] - end) < 0.005:
            out[-1][2] = out[-1][2] + lines
        else:
            out.append([start, end, list(lines)])
    return out


def secs(tc):
    h, m, rest = tc.split(':')
    s, ms = re.split(r'[,.]', rest)
    return int(h) * 3600 + int(m) * 60 + int(s) + int(ms) / 1000


def tc(t):
    t = max(t, 0)
    return '%02d:%02d:%02d,%03d' % (t // 3600, (t % 3600) // 60, t % 60,
                                    round(t % 1 * 1000))


def speakers(lines):
    """Split a cue into one text per speaker, then drop the colour.

    Two things mark a speaker in a BBC cue and both have to be read before the
    markup is thrown away: a change of <font> colour, and a line that already
    begins with a dash. The BBC uses whichever suits it, sometimes dashes inside
    a single colour, so keying on colour alone merges two speakers into one line
    and the rewrap then mangles it.

    A trailing dash is punctuation, not a speaker, and is left alone.
    """
    runs = []          # (colour, text) one per source line
    colour = None
    for raw in lines:
        pos, parts = 0, []
        for m in FONT_OPEN.finditer(raw):
            if m.start() > pos:
                parts.append((colour, raw[pos:m.start()]))
            colour = m.group(1).lower()
            pos = m.end()
        parts.append((colour, raw[pos:]))
        for c, t in parts:
            t = TAG.sub('', t)
            if t.strip():
                runs.append((c, t.strip()))

    out = []
    for c, t in runs:
        starts_speaker = bool(re.match(r'^-\s*\S', t))
        t = re.sub(r'^-\s*', '', t)
        if out and out[-1][0] == c and not starts_speaker:
            out[-1] = (c, out[-1][1].rstrip() + ' ' + t)
        else:
            out.append((c, t))
    return out


def strip_sdh(text):
    text = SDH_BRACKET.sub(' ', text)
    text = SPEAKER_LABEL.sub('', text)
    return re.sub(r'\s+', ' ', text).strip()


def wrap(text, dash=False):
    """At most MAX_LINES of at most MAX_LINE, balanced. Longest line first is
    avoided: a two-line cue reads better with the break near the middle."""
    words = text.split()
    if not words:
        return []
    # A lone dash is punctuation belonging to the word before it. Kept separate
    # it either wraps onto the next line, where it reads as a second speaker, or
    # is forced onto the current one and overruns the 42.
    joined = []
    for w in words:
        if w == '-' and joined:
            joined[-1] += ' -'
        else:
            joined.append(w)
    words = joined
    text = ' '.join(words)
    prefix = '-' if dash else ''
    budget = MAX_LINE - len(prefix)
    if len(prefix + text) <= MAX_LINE:
        return [prefix + text]
    best = None
    for split in range(1, len(words)):
        a = ' '.join(words[:split])
        b = ' '.join(words[split:])
        if b.startswith('-'):
            continue          # a line opening with a dash reads as a second
                              # speaker; never break a sentence so that happens
        if len(prefix + a) <= budget + len(prefix) and len(prefix + b) <= budget + len(prefix):
            score = abs(len(a) - len(b))
            if best is None or score < best[0]:
                best = (score, [prefix + a, prefix + b])
    if best:
        return best[1]
    # too long for two lines: fill greedily and keep the first two
    lines, cur = [], ''
    for w in words:
        trial = (cur + ' ' + w).strip()
        if len(prefix + trial) <= MAX_LINE:
            cur = trial
        elif w.startswith('-') and cur:
            cur = trial          # never start a line on a dash
        else:
            lines.append(prefix + cur)
            cur = w
    if cur:
        lines.append(prefix + cur)
    return lines      # every line is returned; the caller splits the cue if
                      # there are more than MAX_LINES, so no words are dropped


def main():
    if len(sys.argv) < 3:
        raise SystemExit('usage: housestyle.py in.srt out.srt')
    cues = parse(io.open(sys.argv[1], encoding='utf8').read())
    raw_count = len(cues)
    cues = merge_simultaneous(cues)
    stats = {'dashed': 0, 'sdh': 0, 'rewrapped': 0, 'retimed': 0, 'dropped': 0, 'split': 0}
    out = []
    for start, end, lines in cues:
        runs = speakers(lines)
        texts = []
        for _, t in runs:
            before = t
            t = strip_sdh(t)
            if t != strip_sdh(TAG.sub('', before)):
                pass
            if TAG.sub('', before).strip() != t:
                stats['sdh'] += 1
            if t:
                texts.append(t)
        if not texts:
            stats['dropped'] += 1
            continue
        multi = len(texts) > 1
        if multi:
            stats['dashed'] += 1
        body = []
        for t in texts:
            body.extend(wrap(t, dash=multi))
        if body != [TAG.sub('', l).strip() for l in lines if TAG.sub('', l).strip()]:
            stats['rewrapped'] += 1
        # More than two lines means the cue has to become two cues. Dropping the
        # overflow would lose the subtitler's words, which is the one thing this
        # script must never do; the time is divided in proportion to the text.
        if len(body) <= MAX_LINES:
            out.append([start, end, body])
        else:
            chunks = [body[i:i + MAX_LINES] for i in range(0, len(body), MAX_LINES)]
            total = sum(len(' '.join(c)) for c in chunks) or 1
            t0 = start
            for j, c in enumerate(chunks):
                share = (end - start) * len(' '.join(c)) / total
                t1 = end if j == len(chunks) - 1 else min(t0 + share, end)
                out.append([t0, t1, c])
                t0 = t1
            stats['split'] += len(chunks) - 1

    # No-overlap wins over the minimum duration. Where the source packs cues
    # tighter than MIN_DUR apart, the cue simply stays short: stealing time from
    # the next one would put two subtitles on screen together, which is worse.
    for i, cue in enumerate(out):
        nxt = out[i + 1][0] if i + 1 < len(out) else None
        end = cue[1]
        if end - cue[0] < MIN_DUR:
            end = cue[0] + MIN_DUR
        if end - cue[0] > MAX_DUR:
            end = cue[0] + MAX_DUR
        if nxt is not None:
            end = min(end, nxt)
        end = max(end, cue[0] + 0.04)
        if abs(end - cue[1]) > 0.001:
            stats['retimed'] += 1
        cue[1] = end

    parts = ['%d\n%s --> %s\n%s' % (i, tc(s), tc(e), '\n'.join(b))
             for i, (s, e, b) in enumerate(out, 1)]
    io.open(sys.argv[2], 'w', encoding='utf8', newline='\n').write(
        '﻿' + '\n\n'.join(parts) + '\n')
    print('  %d cues in, %d after merging simultaneous, %d out'
          % (raw_count, len(cues), len(out)))
    print('  %d cues given speaker dashes, %d had SDH removed' % (stats['dashed'], stats['sdh']))
    print('  %d rewrapped, %d retimed, %d cues split to fit, %d dropped as empty'
          % (stats['rewrapped'], stats['retimed'], stats['split'], stats['dropped']))


if __name__ == '__main__':
    main()
