# Open tasks

Everything started and not finished, or found and not fixed. Delete a line when it is
done; nothing here is kept as a record once it is. The how of each job is in
[season-pass.md](season-pass.md); this file only says what is outstanding.

Last reviewed 29 September 2026.

## In flight

- **Season 4, still open after the 24 September pass.**
  - Tenth Planet DVD remux (`730f0336d2`) and Faceless Ones Blu-ray (`7cd853ab8b`) had
    stalled; every torrent in qBittorrent was removed with its files at 12:11 on 25 September,
    not by any script here. Re-add them only if the user wants them tried again.
- **Every Classic season has had its pass (finished 29 September 2026).** Seasons 13, 14, 18, 21,
  23 and 26 would improve further only from their Collection Blu-rays, none of which is on the
  public indexers; the user's call on 29 September is to keep them as they are until one appears.
  The pack sidecars on kept files stay as they came, also the user's call.

## Waiting on the user

- **Classic Who IMDb ids.** Regenerating on 23 September dropped the ones the audit typed
  in; they do nothing, since the addon answers only its own ids. Leave out, or carry?
- **The stremio-addons.net listing.** The text was given on 22 September; paste it by
  hand, since the browser pane cannot reach the site.
- **Cyber-Controller holds Administrator in Discord.** It needs six permissions. Only a
  person can change a bot's top role.
- **Log the second GitHub account out of `gh`** on this machine, to be run by the user.

## DVD for every season without a Blu-ray

Decided 23 September 2026: every Classic season with no Collection set to be had is
brought to at least the retail DVD. The bucket's copies of seasons 4, 5, 6, 11, 13, 14,
16, 18, 21, 23 and 26 are 1.7 to 3 Mbps re-encodes (DivX for season 21); the discs are
MPEG-2 with their own subtitles.

**Nothing better can be downloaded today.** Searched 23 to 24 September across Prowlarr's
22 indexers and archive.org:
- The well-seeded "Classic Season N Complete" packs are the files the bucket already
  holds, matching to two decimals of a gigabyte.
- One DVD image per story exists (the TRBLE PAL series and "Original DVD9 Rip"s, listed
  with hashes in `scripts/media/dvd/dvd_sources.tsv`), but TorBox has none cached and
  none has a peer.
- The VRiSFAGS `iNTERNAL DVDrip x264 AC3` re-encodes and the few disc images the indexers
  still list as seeded (Resurrection of the Daleks at 36, The Awakening, Frontios) load no
  metadata in qBittorrent: the counts are stale. The five were left queued there.

Routes left, the user's call: buy the DVDs and a USB DVD drive (this PC has no optical
drive; the rip route is ready), or Usenet or a private tracker, both needing accounts.
Season 3 already had its pass from DVD images.

## Collection seasons not started

- **Released but not on the public indexers: 13, 14, 18, 21, 23, 26.** All six are out on
  Blu-ray (UK: 13 on 20 October 2025, 14 on 4 May 2020, 18 on 18 March 2019, 21 on
  16 March 2026, 23 on 7 October 2019, 26 on 27 January 2020, per Wikipedia's home video
  list). Searched on 23 September 2026 by set name and by story title: nothing in
  Prowlarr's 22 indexers but SD rips. Try TorBox's own search, or buy the discs. Seasons 13
  and 21 are recent enough that a rip may still appear.
- **Seasons 1, 3, 4, 5, 6, 11 and 16 have no Collection set at all.**

## Checks owed on seasons not yet passed

The 22 September audit changed data in Classic seasons that have not had their pass.
No video was touched. Check these again at each season's step 4:

- Air dates were written into seasons 5, 6, 11, 13, 14, 16, 18, 21, 23 and 26, from
  Wikipedia's episode tables.
- Sidecar subtitles were removed in seasons 5, 6 and 23, because the files
  carry their own track.
- *The Space Pirates* part 2 carries a DVD bitmap track, not PGS. Nobody has checked
  that Stremio shows one. If it does not, restore the old sidecar from B2's file versions.
- The *Battlefield* part 4 still is letterboxed (101 and 114 dark rows, measured
  23 September). Rebuild it in the season 26 pass.

## Smaller items

- Stop the local preview server when the session ends.
