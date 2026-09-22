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

The catalogue itself is the ledger in `ledger/`, one TSV per series, shown at
https://whoniverse.nubblyn.com/ledger. Video ids are the addon's own
(`whoniverse_new_who:1:1`), so other addons do not answer for its episodes and
watch history stays with this catalogue.

[docs/architecture.md](docs/architecture.md) describes every part, the
repository layout, what builds what and each script.

## Running it locally

```
npm install
npm start
```

Then open http://127.0.0.1:7000/ for the landing page and
http://127.0.0.1:7000/manifest.json for the addon.

## Feedback

Problems and ideas go in the Discord: https://discord.gg/TrVzhzS4BJ

---

Made by nubblyn. Doctor Who is © BBC. This project is fan-made and
non-commercial, and is not affiliated with the BBC or BBC Studios.
