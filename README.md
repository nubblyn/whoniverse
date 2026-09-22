# Whoniverse

Doctor Who in original UK broadcast order, as an addon for Stremio and Nuvio.

Install from **https://whoniverse.nubblyn.com**, or add the manifest by hand:

```
https://whoniverse.nubblyn.com/manifest.json
```

No account, no settings, no debrid. Streams are plain URLs to files we host, so
they play anywhere the addon does.

**Website:** https://whoniverse.nubblyn.com
**Discord:** https://discord.gg/TrVzhzS4BJ

## What is in it

Every series plays: 1,098 of the 1,124 episodes in the catalogue.

| Series | Episodes | Playing |
| --- | --- | --- |
| Classic Who (1963 to 1989) | 716 | 705 |
| Wilderness Years (1993 to 2003), with the 1996 film | 28 | 28 |
| New Who (2005 to present) | 270 | 255 |
| Torchwood (2006 to 2011) | 42 | 42 |
| The Sarah Jane Adventures (2007 to 2011) | 55 | 55 |
| Class (2016) | 8 | 8 |
| The War Between the Land and the Sea (2025) | 5 | 5 |

The **Complete Chronology** runs all of it as one list, 1963 to now, from the
same files.

Every special, minisode and prequel sits inside its season where its story
belongs, so the story runs straight through. One released years later still
sits beside the episode it goes with, and shows its real release date. Each
episode has a still and a hand-written summary, and nearly all have English
subtitles, the disc's own wherever the disc has them.

The 26 that do not play yet are the thirteen Series 2 Tardisodes, two other New
Who minisodes, eight Classic minisodes, *K9 and Company*, and parts 3 and 4 of
*Resurrection of the Daleks*.

The addon lists only what plays. The website shows everything, with the
completion figure for each.

## How it is built

The files live in a Backblaze B2 bucket behind Cloudflare, at
`cdn.nubblyn.com`. The addon is a Vercel serverless function plus a static
landing page. Everything the addon hands to a client comes from that
bucket: posters, backgrounds, logos, stills and subtitles. Nothing is fetched
from a third party at request time.

```
api/index.js       Vercel entry point: landing page, subtitle relay, addon router
server.js          the same, as a local server on port 7000
lib/series.js      the registry: one entry per series, in catalogue order
lib/catalog.js     episodes in broadcast order, catalog and meta objects
lib/streams.js     the one stream per episode
lib/subtitles.js   subtitles relayed with the CORS header Stremio Web needs
lib/landing.js     the landing page, built to the Figma design
lib/addon.js       manifest and handlers
data/<series>.js   the episodes, one file per series
public/art/        website images (WebP, built from art-src/)
art-src/           image sources: Figma exports and originals
scripts/           publishing tools, run on your machine, not on the host
```

Video ids are the addon's own (`whoniverse_new_who:1:1`), so other addons do
not answer for its episodes and watch history stays with this catalogue.
Episodes with Dolby E-AC-3 audio (S14 to S16) are marked not web-ready, since
browsers cannot decode that track.

## Running it locally

```
npm install
npm start
```

Then open http://127.0.0.1:7000/ for the landing page and
http://127.0.0.1:7000/manifest.json for the addon.

## Scripts

Publishing is done from here, not on the host. Shell scripts run through
`scripts/run.js`, which launches Git Bash on Windows.

| Command | What it does |
| --- | --- |
| `npm run art` | build the website WebP set and the bucket JPEG/PNG set from `art-src/` |
| `npm run art:upload` | copy the bucket set to `art/` in the bucket |
| `npm run relink` | point episode URLs at a new media base |
| `npm run check-links` | confirm every stream, subtitle and still URL answers |
| `npm run mirror` | copy a season from archive.org into the bucket (how New Who got there) |
| `npm run setup-b2` | configure the rclone remote for the bucket |
| `npm run doctor` | check the local tooling |
| `node scripts/fetch-metadata.js <series>` | catalogue a series from Cinemeta; refuses to touch curated data |
| `node scripts/subs/*.js` | subtitle pipeline: audit, strip hearing-impaired cues, polish, lint |

Adding a series means one entry in `lib/series.js` and one file in `data/`.
Making it playable means adding a `streamUrl` to its episodes.

## Feedback

Problems and ideas go in the Discord: https://discord.gg/TrVzhzS4BJ

---

Made by nubblyn. Doctor Who is © BBC. This project is fan-made and
non-commercial, and is not affiliated with the BBC or BBC Studios.
