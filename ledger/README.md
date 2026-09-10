# The ledger

These files are the source of truth for what Whoniverse contains: every episode,
special, minisode, prequel and animated serial, in the order a viewer watches
them. The Google Sheet is a published view of this, not the other way round.

Editing a TSV and running the build takes seconds. Editing the sheet by hand
took a browser session, a live Google login and about forty clicks per change,
which is why the ledger moved here on 9 September 2026.

## Files

| File | What it holds |
| --- | --- |
| `addon.tsv` | What the addon says about itself: id, name, description, logo |
| `series.tsv` | One row per series: its key, sheet name, whether it is numbered, its category columns, and everything the addon needs — bucket folder, Stremio id, artwork, release span, genres and description |
| `series/*.tsv` | One file per series, rows in viewing order |
| `all-who.tsv` | The combined running order, referencing rows in the series files |
| `build.py` | Validates all of the above, writes `out/` and `data/registry.json` |
| `out/whoniverse.xlsx` | Generated. Import this into the Google Sheet |
| `out/file-names.tsv` | Generated. Every item with its `S01_E01_slug` name, for matching media files |
| `../data/registry.json` | Generated. What the addon reads for its own name and every series' prose and artwork |

## The Complete Chronology

`series.tsv` marks it `derived`: it has no file under `series/` because it is
all of `all-who.tsv`, every other series in UK broadcast order. The addon
builds its episode list with `scripts/build-chronology.js`, and each episode
reuses the stream and still its own series already publishes, so there is one
copy of everything and the two cannot drift.

## A series row

```
season   category   title   status   note
```

- **season** is a number, or `-` for an item that is not numbered because no
  copy can be obtained.
- **category** must be one the tab declares in `tabs.tsv`. The full set is Main
  Show, Special, Minisode, Animated Series, Prequel, Animated Restoration and
  Movie, and columns always appear in that order.
- **title** is the official title, without the category suffix and without any
  warning mark. The build adds those.
- **status** is `ok` or `missing`. Use `missing` only when no copy can be
  obtained at all, not when a copy merely has to be downloaded from somewhere.
- **note** is the reason, and is required when the status is `missing`. It
  appears in the sheet after the warning sign, in brackets.

Episode numbers are not stored. They are the position within the season, so
inserting a row renumbers everything below it automatically. Adding an item
means adding one line to a series file and one line to `all-who.tsv`.

## Building

```bash
python ledger/build.py
```

It refuses to write anything if the ledger does not check out. It verifies that
every category is one the tab declares, that a missing row has a note and an
available row does not, that no series repeats a title within a season and
category, and that `all-who.tsv` and the series files describe exactly the same
set of items.

`out/` is not committed. Regenerate it whenever you need it.

## Publishing to the sheet

In the Google Sheet: File, Import, Upload, `out/whoniverse.xlsx`, then Replace
spreadsheet.

Two tab names do not survive the trip, because the xlsx format bans some
punctuation in sheet names and caps them at 31 characters. The build prints
which ones to rename afterwards. It is the same trimming Google's own export
does in the other direction.

Anything edited directly in the sheet is lost on the next import, so make
changes here.

## What this does not decide

Ordering rules, and what belongs in the catalogue at all, are recorded in the
project memory rather than here. The short version: main episodes in UK
broadcast order, extras by their position in the story, and an item earns its
place only if it carries story.
