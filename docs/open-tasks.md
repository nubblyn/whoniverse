# Open tasks

Everything started and not finished, or found and not fixed. Delete a line when it is
done; nothing here is kept as a record once it is. The how of each job is in
[season-pass.md](season-pass.md); this file only says what is outstanding.

Last reviewed 23 September 2026.

## In flight

- **Seasons 24 and 25 from the Collection.** Both zips are downloading from TorBox to
  `~/Downloads`. When each lands, run the full season pass. Season 24 has the minisode
  *24 Carat*, which needs a cut point from the user, as *Risen* did.
- **Subtitles for the 76 files with no track at all** (the telesnap reconstructions,
  Mission to the Unknown, Don't Shoot the Pianist, The O.K. Corral, seasons 13 and 20,
  and 21 Wilderness Years pieces). Whisper is transcribing on the GPU. Then run
  `scripts/subs/build_subs.py`, upload the `.srt` files, add `subtitleUrl`, rebuild,
  deploy and commit the transcripts. If any turn out useless later, delete them.
- **Season 15 from the Collection** is still downloading on TorBox.

## Waiting on the user

- **The *Risen* cut point.** Suggested 88.08 s. The source is
  `~/Downloads/content/classic_who/_work/risen_full.mp4`.
- **The stremio-addons.net listing.** The text was given on 22 September; paste it by
  hand, since the browser pane cannot reach the site.
- **Cyber-Controller holds Administrator in Discord.** It needs six permissions. Only a
  person can change a bot's top role.
- **Log the second GitHub account out of `gh`** on this machine, to be run by the user.

## Collection seasons not started

- **Seasons 20 and 22** are on the TorBox hash list, not downloaded yet. When season 20
  lands, its files bring their own PGS, so delete the three Whisper sidecars made for
  *The King's Demons* 1 and 2 and *The Five Doctors*.
- **No set found for 13, 14, 18, 21, 23 or 26.** Not searched since the first sweep.
  Season 21 matters most: *Resurrection of the Daleks* parts 3 and 4 are not in the
  bucket, so only the first half plays.
- **Seasons 4, 5, 6, 11 and 16 have no Collection set at all.**

## Checks owed on seasons not yet passed

The 22 September audit changed data in Classic seasons that have not had their pass.
No video was touched. Check these again at each season's step 4:

- Air dates were written into seasons 4, 5, 6, 11, 13 to 16, 18 and 20 to 26, from
  Wikipedia's episode tables.
- Sidecar subtitles were removed in seasons 4, 5, 6 and 22 to 25, because the files
  carry their own track.
- Four of those files carry a DVD bitmap track, not PGS: *The Space Pirates* part 2 and
  *Silver Nemesis* parts 1 to 3. Nobody has checked that Stremio shows a DVD bitmap
  track. If it does not, restore the old sidecars from B2's file versions. The season 25
  pass replaces the Silver Nemesis files anyway.
- The *Battlefield* part 4 still is letterboxed (101 and 114 dark rows, measured
  23 September). Rebuild it in the season 26 pass.

## Smaller items

- Six Collection minisodes have no description yet. Each gets one in its season's pass.
- Stop the local preview server when the session ends.
