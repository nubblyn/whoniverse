# How Whoniverse is built

Whoniverse is Doctor Who in UK broadcast order, as a Stremio and Nuvio addon, with a
website and a public ledger beside it. Every file it serves is ours, in one bucket.
This document says what the parts are and how they connect. How a season is worked
through is in [season-pass.md](season-pass.md); what is outstanding is in
[open-tasks.md](open-tasks.md).

## The documents

| File | For | Changes when |
| --- | --- | --- |
| `README.md` | the public face on GitHub: what the addon is, how to install it, what plays | a series' availability changes; its wording is reused for the manifest and the listing |
| `docs/architecture.md` | this file: the parts, the repo, the ledger, the addon entry, what builds what, every script and tool | a part, route, script, column or naming rule changes |
| `docs/season-pass.md` | the procedure for one season: the toolbox and its traps, where sources are, the rules a season must meet, the eight steps, the closing checklist, and rules settled along the way | a pass teaches something that the next one needs |
| `docs/open-tasks.md` | what is outstanding: work in flight, questions waiting on an answer, seasons not started, checks owed | a task starts or finishes; a finished line is deleted, not ticked |

Each fact has one home. How something is built goes here, how a season is worked goes
in the season pass, and anything still to do goes in open tasks, so none of them keeps
a copy of another. Claude's own notes between sessions live outside the repo, in its
memory folder on this machine, and point back to these files rather than repeating them.

## The parts

| Part | What it is | Where it lives | How it changes |
| --- | --- | --- | --- |
| **Addon** | the Stremio manifest, catalogs, metas, streams and subtitles | `api/index.js`, `lib/`, `data/*.js` | edit data or code, then deploy |
| **Website** | the landing page with the install button and per-series completion | `lib/landing.js`, `public/` | deploy |
| **Ledger** | every episode, special and minisode, with what we hold and the best that exists. The source of truth for the catalogue | `ledger/` TSVs, shown at `/ledger` | edit a TSV, run `build.py` and `board.py`, deploy |
| **Bucket** | every video, still, subtitle and piece of art | Backblaze B2 bucket `whoniverse`, behind Cloudflare at `cdn.nubblyn.com` | `rclone` |
| **Hosting** | one serverless function plus static files | Vercel project `whoniverse`, at `whoniverse.nubblyn.com` | `npx vercel deploy --prod` only; Vercel is not connected to GitHub |
| **Discord** | the community server and its bot, the Cyber-Controller | the Discord server; the news job is `lib/news.js` | by hand through the Discord MCP; the news job runs daily on the Vercel cron |
| **Code** | this repository | GitHub `nubblyn/whoniverse`, branch `main` | `git push origin clean-main:main` |
| **Listing** | the community addon catalogue entry | stremio-addons.net | pasted by hand; the browser pane cannot reach the site |

Everything is under the nubblyn identity: the `hub.nubblyn@gmail.com` account for every
service, and commits as `nubblyn <326105996+nubblyn@users.noreply.github.com>`. No other
name, email or account id appears anywhere in the repository, including in prose.

## Requests

Vercel sends every path to `api/index.js`. `vercel.json` has no rewrites on purpose,
because they break that routing. Files in `public/` are served as they are, before the
function.

| Path | Answered by |
| --- | --- |
| `/`, `/configure` | the landing page, `lib/landing.js`, with live completion read from the bucket index |
| `/manifest.json`, `/catalog/…`, `/meta/…`, `/stream/…`, `/subtitles/…` | the addon, through the Stremio SDK router, `lib/addon.js` |
| `/ledger` | `public/ledger.html`, built by `ledger/board.py`; `/ledger-v2` redirects here |
| `/api/bucket` | the bucket listing and `data/subtitles.json`, for the ledger page's live view |
| `/api/news` | the daily news job, called by the Vercel cron at 10:00 with `CRON_SECRET` |
| `/subs/…` | subtitle relay: fetches the `.srt` from B2 and adds the CORS header Stremio Web needs |

`server.js` runs the same handler locally on port 7000 (`npm start`) and serves
`public/` the way Vercel does. It caches `data/*.js`, so restart it after a data change.

Four behaviours that are not what you would assume:

- **Cloudflare caches nothing over 512 MB.** Episodes stream from B2 on every view;
  stills, subtitles and art are cached.
- **Vercel's function cannot reach `cdn.nubblyn.com`**: Cloudflare refuses it. Anything
  server-side, and every local script, reads B2's own host,
  `https://f003.backblazeb2.com/file/whoniverse/`.
- **A CLI deploy uploads the working directory, not the commit.** `.vercelignore` keeps
  the tools, ledger and docs out. Its negation only works as `scripts/*` plus
  `!scripts/stamp.js`; `scripts/` would silently exclude `stamp.js` and fail the build.
- **The alias switches 6 to 30 seconds after the CLI says ready.** Poll the live file's
  hash rather than checking once (season-pass.md, Part H).

## The repository

```
api/index.js          the Vercel function: every route above
server.js             the same handler, locally
lib/addon.js          manifest and the four handlers; the version lives here
lib/catalog.js        episodes per series, ordered by (season, episode); catalog and meta objects
lib/streams.js        the one stream per episode: "Whoniverse", "Play Episode"
lib/subtitles.js      subtitle entries and the /subs/ relay
lib/series.js         the registry, read from data/registry.json, plus the art URLs
lib/bucket.js         the bucket index the landing page reads (5-minute cache)
lib/landing.js        the landing page
lib/news.js           the Discord news job
data/<series>.js      the episodes, one file per series
data/registry.json    generated by ledger/build.py: the addon's name and every series' prose
data/subtitles.json   generated by scripts/probe-subtitles.js: which files carry text tracks
data/art-version.json generated by scripts/build-art.js: the ?v= stamp on each piece of art
public/               served as is: ledger.html, art/, fonts/
art-src/              the image sources scripts/build-art.js builds from
ledger/               the ledger TSVs, build.py and board.py
scripts/              publishing and media tools; run here, never on Vercel
docs/                 this file, the season pass and the open tasks
```

## The ledger

The ledger is the source of truth for what the catalogue contains. Nothing else is: the
Google Sheet it used to be imported into was dropped on 23 September 2026, and `/ledger`
is its only view.

| File | Holds |
| --- | --- |
| `ledger/series/NN-<series>.tsv` | one row per item, in viewing order |
| `ledger/all-who.tsv` | the combined running order behind the Complete Chronology |
| `ledger/series.tsv` | one row per series: key, name, categories, bucket folder, Stremio id, art, release span, genres, description |
| `ledger/addon.tsv` | the addon's own id, name, description and logo |

A series row has these columns:
`season, category, title, status, note, best, best_reported, checked, have, source, released, description`.

- `category` is one of Main Show, Special, Minisode, Animated Series, Prequel, Animated
  Restoration, Movie. The addon shows it as a tag, `Born Again (Minisode)`.
- `status` is `ok` or `missing`. `missing` means no legitimate copy exists anywhere, not
  that one is still to be downloaded, and only a `missing` row has a `note`.
- `have` is what the bucket holds, as probed: `1920x1080 25fps DTS-HD MA`. Never a local
  file. The page labels it Held.
- `best` is the best copy found, as source, resolution and audio:
  `1080p Blu-ray x265 DTS-HD MA 2.0`, and `checked` the day the indexers were last asked.
  Labelled Best found.
- `best_reported` is the best quality reported to exist, from sites like blu-ray.com.
  It is research, and it never colours a row: a row is judged against `best` only.
- `source` is where the held file came from, as `<who> | <what>`.
- `released` is the first release date; `description` the two-sentence summary.

Episode numbers are not stored. They are the row's position in its season, so adding or
removing a row renumbers everything below it, and the data file has to follow
(season-pass.md, Part D).

`ledger/build.py` validates every file: the right column count on every row, known
categories, a note only on `missing` rows, no repeated titles in a season, and
`all-who.tsv` holding exactly the items the series files hold. Then it writes
`ledger/out/file-names.tsv`, every row with its file name, and `data/registry.json`.
`ledger/board.py` builds `public/ledger.html` from the TSVs, the bucket listing and
`data/subtitles.json`.

The Complete Chronology is marked `derived` in `series.tsv`. It has no series file: it is
`all-who.tsv`, and each of its episodes reuses the stream and still its own series
already serves, so there is one copy of everything.

## Files and names

Every item's file stem is `S%02d_E%02d_<slug>`: the title lowercased, spaces to `_`,
everything outside `[a-z0-9_]` dropped, and the category added for anything that is not
a Main Show or Movie, as in `S14_E01_destination_skaro_minisode`. Read it from
`ledger/out/file-names.tsv`; never derive it by hand.

The bucket mirrors the series: `b2:whoniverse/<folder>/season_N/<stem>.<ext>`, with the
folders `classic_who`, `wilderness_years`, `new_who`, `torchwood`,
`the_sarah_jane_adventures`, `class`, `the_war_between_the_land_and_the_sea` and
`complete_chronology` (art only). Beside each video sit `<stem>.jpg`, a 1280x720 frame
from the video itself, and `<stem>.srt` only when the file carries no subtitles of its
own. Series art is in the series folder, `addon-logo.png`, `episode_missing.jpg` and
`bucket-index.json` at the root.

Every bucket URL in `data/*.js` ends in `?v=` and the first eight characters of the
file's SHA1, written by `scripts/stamp-media.js`, so a replaced file is fetched fresh.

## An episode in the addon

```js
{
title: "Born Again (Minisode)",                       // ledger title, plus the category unless Main Show
season: 1,
episode: 14,
type: "Minisode",                                     // the ledger category
audio: "E-AC-3",                                      // only when not AAC or MP3: browsers play Dolby and DTS silent
imdb: { id: "tt0436992", season: 0, episode: 9 },     // where IMDb has it; scripts/map-imdb.js
released: new Date("2005-11-18").toISOString(),
overview: "…two sentences…",
thumbnail:   "https://cdn.nubblyn.com/file/whoniverse/new_who/season_1/S01_E14_born_again_minisode.jpg?v=xxxxxxxx",
streamUrl:   "…/S01_E14_born_again_minisode.mkv?v=xxxxxxxx",
subtitleUrl: "…/S01_E14_born_again_minisode.srt?v=xxxxxxxx"   // only where a sidecar belongs
},
```

- **Order is the numbering; the date is the date.** A season is listed by (season,
  episode). A row sits where its story puts it and shows its real first release, however
  many years after its neighbours that is: the two Lockdown shadow shorts are 3x12 and
  3x13 and say 24 April 2020. Never change a date to fix an order.
- **Video ids are ours**, `whoniverse_new_who:1:14`, so other addons do not answer for
  our episodes. Watch history keys on them, so a renumber resets it for the rows that
  move. The catalogue is in beta and that cost is accepted, but a renumber is still named
  in the commit.
- **The stream** is named `Whoniverse` and labelled `Play Episode` (`Play Film` for the
  1996 film). Its `bingeGroup` is `whoniverse|<series key>` with no quality in it, since
  autoplay only moves on when the groups match.
- **Two client traps** discard an object without an error: never send both `title` and
  `name` on a video, or both `title` and `description` on a stream.
- A file that is not an MP4, or whose audio is not AAC or MP3, is marked `notWebReady`,
  so the client plays it through its own player rather than the browser's.

## What builds what

```
ledger/series/*.tsv  ──► ledger/build.py ──► ledger/out/file-names.tsv, data/registry.json
TSVs + bucket index + data/subtitles.json ──► ledger/board.py ──► public/ledger.html
ledger/series/0[5-8]-*.tsv + bucket ──► scripts/build-spinoffs.js --write ──► data/torchwood.js etc.
ledger/all-who.tsv + data/*.js ──► scripts/build-chronology.js --write ──► data/complete-chronology.js
bucket ──► scripts/bucket-index.sh ──► ledger/out/bucket-index.txt and b2:whoniverse/bucket-index.json
bucket SHA1s ──► scripts/stamp-media.js --write ──► the ?v= on every URL in data/*.js
art-src/ ──► scripts/build-art.js ──► public/art/ and art-cdn/ ──► scripts/upload-art.sh ──► the bucket
```

New Who and Classic Who data files are edited directly; the spin-offs and the chronology
are generated.

After any bucket change, in this order, or something downstream is stale:
`bucket-index.sh` → `stamp-media.js --write` → `check-links.js` → `build.py` →
`board.py` → `build-chronology.js --write` → `npx vercel deploy --prod` → poll the live
hash → `rclone rc vfs/refresh`. Then, if a series' availability changed, the hand-written
surfaces: the version and description in `lib/addon.js`, the README table, the listing,
and a post in #announcements.

## The scripts

| Script | Does |
| --- | --- |
| `scripts/bucket-index.sh` | lists the bucket for the ledger and the site |
| `scripts/stamp-media.js [--write]` | puts each file's SHA1 into its URLs; the dry run is a drift check |
| `scripts/check-links.js [series]` | fetches one byte of every URL the addon serves, all series |
| `scripts/build-chronology.js --write` | regenerates the Complete Chronology |
| `scripts/build-spinoffs.js --write` | regenerates the four spin-off data files from ledger and bucket |
| `scripts/build-stills.js <folder> \| --urls <file> --out <dir>` | the 1280x720 still for each video, from the video |
| `scripts/probe-subtitles.js [folder]` | which bucket files carry text tracks; writes `data/subtitles.json` |
| `scripts/map-imdb.js --write` | maps our numbering onto IMDb's for rows that lack it |
| `scripts/build-art.js`, `scripts/upload-art.sh` | the website and bucket art, from `art-src/` |
| `scripts/stamp.js` | the Vercel build step: records the deploy date for the page |
| `scripts/run.js <script>` | runs a shell script under Git Bash, since `bash` here is WSL |
| `scripts/ledger/ready.py` | checks a folder before upload: tags, faststart, audio flag, `.srt` is text |
| `scripts/search/pq.py` | searches the indexers through Prowlarr |
| `scripts/media/dvd/collsel.py` | picks a season's broadcast cuts out of a Collection Blu-ray set, from a zip listing |
| `scripts/media/dvd/collstage.py` | links the chosen files to their stems and proves each by audio against the bucket copy |
| `scripts/media/dvd/keepchosen.py` | clears partial files a torrent client left in a season's folder |
| `scripts/media/dvd/dvdrip.py` | rips a season's retail DVDs and matches each title to its episode by audio |
| `scripts/media/ytpull.py`, `ytbuild.py` | pulls and builds rows from the BBC's own YouTube channel |
| `scripts/subs/whisper_batch.py` | transcribes files with no subtitles, on the GPU |
| `scripts/subs/build_subs.py` | makes each such file's subtitle: an archive.org human track that fits, else Whisper |
| `scripts/subs/clean.py`, `srtify.py`, `housestyle.py` | Whisper cleanup, cue cutting, and house style for a supplied track |

## On this machine

| Tool | For |
| --- | --- |
| Node 20+, Python 3 with numpy and faster-whisper | the scripts |
| rclone, remote `b2:` | the bucket; also mounted as `W:`, with `--rc` so `vfs/refresh` can clear its cache |
| ffmpeg and ffprobe, mkvtoolnix | probing, stills, the rare encode |
| 7-Zip | extracting chosen files from TorBox zips |
| TorBox (web) | downloads; whole torrents arrive as zips in `~/Downloads` |
| qBittorrent, Web API on port 8099 | the local torrent client |
| Prowlarr on 9696, FlareSolverr on 8191 | the indexer search behind `pq.py` |
| MakeMKV | ripping retail DVDs |
| get_iplayer | BBC iPlayer, at up to 1080p |
| yt-dlp (`python -m yt_dlp`) with Deno on PATH | the official YouTube channel |
| The RTX 3070, CUDA 12 wheels | Whisper in float16 |

Working files go under `~/Downloads/content/<series>/` and are deleted once the bucket
holds them.
