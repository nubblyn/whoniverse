// Doctor Who: The Movie — catalogued, not yet playable.
//
// Fetched from Cinemeta by scripts/fetch-metadata.js. No entry has a `url`,
// so the addon does not offer these as streams and the landing page lists the
// series as queued. Adding files means adding urls here, not refetching.
//
// Upstream's season 0 holds specials and shorts and is kept as season 0, which
// is what Stremio expects. Everything in it is typed Special; refining that into
// minisode, prequel and animated needs a pass by hand.

const episodes = [
{
  title: "Doctor Who: The Movie",
  season: 1,
  episode: 1,
  type: "Special",
  released: "1996-05-14T00:00:00.000Z",
  overview: "The newly-regenerated Doctor takes on the Master on the turn of the millennium, 31 December 1999.",
  imdb: { id: "tt0116118", season: 1, episode: 1 },
}
];

module.exports = episodes;
