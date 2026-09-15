#!/usr/bin/env python3
"""Record what the 15 September 2026 New Who sweep found.

    python apply_found.py            dry run
    python apply_found.py --write    write ledger/series/04-new-who.tsv

Only `found` and `found_on` are touched. `have` is what is in the bucket and
nothing has been downloaded, so it stays as it is. `note` is left alone: the
builder requires that column to carry text only on rows whose status is
`missing`, and every row here is `ok`.

Two kinds of record:

  a found value   a release was seen in a Prowlarr response, described as what
                  it actually is rather than what we would like it to be
  a date only     the search ran across 22 indexers and nothing beat the
                  ceiling already recorded. The board reads an empty `found`
                  with a date as "looked, nothing there", which is different
                  from "nobody has looked".

Every keyed title is matched exactly and a key that matches no row is reported,
so a renamed episode cannot make an entry disappear silently.
"""
import io
import os
import sys

TSV = os.path.join('C:/Users/hello/Documents/Claude Projects/Whoniverse Stremio Addon',
                   'ledger', 'series', '04-new-who.tsv')
DATE = '2026-09-15'

# --- per-episode finds, keyed (season, title) -----------------------------
FOUND = {
    # Rows we hold nothing for. Two reach their ceiling; the rest fall short of
    # it, and several exist only inside a concert recording rather than as a
    # standalone file.
    ('3', 'Time Crash'): '576i Blu-ray remux DTS-HD MA',
    ('4', 'Music of the Spheres'): '576i Blu-ray remux, inside the 2008 Proms',
    ('5', 'The Boy Who Saved the Proms'): '1080p Blu-ray, inside the 2010 Proms',
    ('7', 'A Hyperscape Body Swap Ticket'): '720p HDTV, inside the 2013 Proms',
    ('1', 'Born Again'): '720p HDTV',
    ('3', 'The Infinite Quest'): '576i DVD',
    ('4', 'Dreamland'): '720p HDTV',
    ('4', "Tonight's the Night"): 'SD broadcast',

    # Seasons 1-12, where a newer or better encode than ours turned up.
    ('2', 'The Runaway Bride'): '1080p Blu-ray x264',
    ('7', 'The Snowmen'): '1080p Blu-ray x264',
    ('7', 'The Night of the Doctor'): '1080i Blu-ray remux DTS-HD MA 5.1',
    ('10', 'Twice Upon a Time'): '2160p UHD Blu-ray remux DTS-HD MA 5.1',

    # The 2023 specials. Two masters circulate: BBC iPlayer at HLG and Disney+
    # at HDR10/Dolby Vision. Both are 2160p.
    ('14', 'The Star Beast'): '2160p HDR WEB-DL',
    ('14', 'Wild Blue Yonder'): '2160p HLG WEB-DL',
    ('14', 'The Giggle'): '2160p HLG WEB-DL',

    # The Church on Ruby Road is the one 2160p claim not worth stating plainly:
    # a single 24.91GB torrent with no group, source or codec in its name, at
    # one seeder and 957 days old. Recorded with that doubt attached.
    ('15', 'The Church on Ruby Road'): '2160p, one unverified source',
    ('15', 'Joy to the World'): '2160p HDR WEB-DL, thinly seeded',
}

# --- whole runs where every main-show episode has the same find -----------
# Seasons 1 and 2: OFT has posted a 1080p Blu-ray x264 set at roughly 2.2x the
# bitrate we hold. Main Show only; the minisodes and prequels are not in it.
MAIN_SHOW_SEASON = {
    '1': '1080p Blu-ray x264',
    '2': '1080p Blu-ray x264',
}

# Season 12: OFT is mid-campaign. Seven episodes posted, four not yet, so this
# is listed by title rather than applied to the season.
BY_TITLE = {
    '1080p Blu-ray x264': [
        ('12', 'Spyfall, Part 1'), ('12', 'Orphan 55'),
        ('12', "Nikola Tesla's Night of Terror"), ('12', 'Fugitive of the Judoon'),
        ('12', 'Praxeus'), ('12', 'The Haunting of Villa Diodati'),
        ('12', 'Ascension of the Cybermen'),
    ],
    # The 2024 and 2025 runs. NewDoctorWhoDis and SuccessfulCrab carry these at
    # 99-269 seeders, well above the Disney+ rips that sit at 1-9.
    '2160p HDR WEB-DL': [
        ('15', 'Space Babies'), ('15', "The Devil's Chord"), ('15', 'Boom'),
        ('15', '73 Yards'), ('15', 'Dot and Bubble'), ('15', 'Rogue'),
        ('15', 'The Legend of Ruby Sunday'), ('15', 'Empire of Death'),
        ('16', 'The Robot Revolution'), ('16', 'Lux'), ('16', 'The Well'),
        ('16', 'Lucky Day'), ('16', 'The Story & the Engine'),
        ('16', 'The Interstellar Song Contest'), ('16', 'Wish World'),
        ('16', 'The Reality War'),
    ],
}

SEARCHED = {str(n) for n in range(1, 17)}


def main():
    do = '--write' in sys.argv
    lines = [l for l in io.open(TSV, encoding='utf8').read()
             .replace('\r', '').split('\n') if l.strip()]
    head = lines[0].split('\t')
    i = {k: head.index(k) for k in ('season', 'category', 'title', 'found', 'found_on')}
    rows = [r.split('\t') + [''] * (len(head) - len(r.split('\t'))) for r in lines[1:]]

    want = dict(FOUND)
    for val, keys in BY_TITLE.items():
        for k in keys:
            want[k] = val

    seen, named, dated = set(), 0, 0
    for r in rows:
        s, t = r[i['season']], r[i['title']]
        val = want.get((s, t))
        if val is None and s in MAIN_SHOW_SEASON and r[i['category']] == 'Main Show':
            val = MAIN_SHOW_SEASON[s]
        elif val is not None:
            seen.add((s, t))
        if val and r[i['found']] != val:
            print('  S%-3s %-42s %s' % (s, t[:42], val))
            r[i['found']] = val
            named += 1
        elif val:
            r[i['found']] = val
        if s in SEARCHED:
            if r[i['found_on']] != DATE:
                dated += 1
            r[i['found_on']] = DATE

    missed = sorted(set(want) - seen)
    if missed:
        print('\n  ! %d keys matched no ledger row:' % len(missed))
        for s, t in missed:
            print('      S%s %s' % (s, t))

    print('\n%d rows given a found value, %d rows newly dated %s' % (named, dated, DATE))
    if do:
        io.open(TSV, 'w', encoding='utf8', newline='\n').write(
            '\n'.join(['\t'.join(head)] + ['\t'.join(r) for r in rows]) + '\n')
        print('written')
    else:
        print('dry run. Re-run with --write')


if __name__ == '__main__':
    main()
