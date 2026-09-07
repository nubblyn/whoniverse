// The War Between the Land and the Sea — catalogued, not yet playable.
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
  title: "Homo Aqua",
  season: 1,
  episode: 1,
  type: "Main Show",
  released: "2025-12-07T20:30:00.000Z",
  overview: "Barclay’s ordinary life becomes a world of terror when an ancient species rises from the sea. As UNIT fights for control, the summit on the Thames reveals terrifying secrets.",
  thumbnail: "https://episodes.metahub.space/tt30645193/1/1/w780.jpg",
  imdb: { id: "tt30645193", season: 1, episode: 1 },
},
{
  title: "Plastic Apocalypse",
  season: 1,
  episode: 2,
  type: "Main Show",
  released: "2025-12-07T20:30:00.000Z",
  overview: "Barclay becomes humanity’s ambassador when the mysterious Salt emerges from the Tank. But his family’s life is torn apart when Salt wreaks revenge upon all mankind.",
  thumbnail: "https://episodes.metahub.space/tt30645193/1/2/w780.jpg",
  imdb: { id: "tt30645193", season: 1, episode: 2 },
},
{
  title: "The Deep",
  season: 1,
  episode: 3,
  type: "Main Show",
  released: "2025-12-14T20:30:00.000Z",
  overview: "Barclay makes a terrifying descent into the world of Homo Aqua. Back on the land, Kate stands alone as Downing Street conspires with the army to change the course of the war.",
  thumbnail: "https://episodes.metahub.space/tt30645193/1/3/w780.jpg",
  imdb: { id: "tt30645193", season: 1, episode: 3 },
},
{
  title: "The Witch of the Waterfall",
  season: 1,
  episode: 4,
  type: "Main Show",
  released: "2025-12-14T20:30:00.000Z",
  overview: "Barclay and Salt go on the run in a war-torn London as UNIT reels from disaster. But when Tide threatens the land and Gunsberg advances his plans, the Severance schemes demand blood.",
  thumbnail: "https://episodes.metahub.space/tt30645193/1/4/w780.jpg",
  imdb: { id: "tt30645193", season: 1, episode: 4 },
},
{
  title: "The End of the War",
  season: 1,
  episode: 5,
  type: "Main Show",
  released: "2025-12-21T20:30:00.000Z",
  overview: "Barclay stands alone, Salt is lost, UNIT is powerless, and the oceans rise as the war reaches its climax. While traitors conspire, can Barclay find Salt before it’s too late?",
  thumbnail: "https://episodes.metahub.space/tt30645193/1/5/w780.jpg",
  imdb: { id: "tt30645193", season: 1, episode: 5 },
}
];

module.exports = episodes;
