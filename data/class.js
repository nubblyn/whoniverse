// Class — catalogued, not yet playable.
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
  title: "For Tonight We Might Die",
  season: 1,
  episode: 1,
  type: "Main Show",
  released: "2016-10-22T10:00:00.000Z",
  overview: "When Coal Hill School comes under attack from deadly monsters, four alienated students must form an unlikely alliance to defeat them. But this incursion is only the beginning.",
  imdb: { id: "tt5079788", season: 1, episode: 1 },
},
{
  title: "The Coach with the Dragon Tattoo",
  season: 1,
  episode: 2,
  type: "Main Show",
  released: "2016-10-22T10:00:00.000Z",
  overview: "Ram struggles to cope following events at the prom, isolating himself from the others. But when the school is faced with a dreadful new threat, the gang must unite to fight it.",
  imdb: { id: "tt5079788", season: 1, episode: 2 },
},
{
  title: "Nightvisiting",
  season: 1,
  episode: 3,
  type: "Main Show",
  released: "2016-10-29T10:00:00.000Z",
  overview: "When London is infiltrated by a powerful alien, an unexpected visitor comes to Tanya's window. The team must battle this strange new threat to stop Tanya from being lost forever.",
  imdb: { id: "tt5079788", season: 1, episode: 3 },
},
{
  title: "Co-owner of a Lonely Heart",
  season: 1,
  episode: 4,
  type: "Main Show",
  released: "2016-11-05T10:00:00.000Z",
  overview: "April starts to feel greater effects of sharing her heart with Corakinus, and as the connection strengthens, she vows to reclaim her heart as her own. Meanwhile, something sinister is invading the streets.",
  imdb: { id: "tt5079788", season: 1, episode: 4 },
},
{
  title: "Brave-ish Heart",
  season: 1,
  episode: 5,
  type: "Main Show",
  released: "2016-11-12T10:00:00.000Z",
  overview: "There is no going back for April: she must face the terrifying consequences of her actions and confront Corakinus in battle.",
  imdb: { id: "tt5079788", season: 1, episode: 5 },
},
{
  title: "Detained",
  season: 1,
  episode: 6,
  type: "Main Show",
  released: "2016-11-19T10:00:00.000Z",
  overview: "When the gang are thrown into detention by Miss Quill, they find themselves trapped - inexplicably floating in space. With tensions rising, dark truths emerge.",
  imdb: { id: "tt5079788", season: 1, episode: 6 },
},
{
  title: "The Metaphysical Engine, or What Quill Did",
  season: 1,
  episode: 7,
  type: "Main Show",
  released: "2016-11-26T10:00:00.000Z",
  overview: "Miss Quill embarks on an extraordinary mission to reclaim her freedom.",
  imdb: { id: "tt5079788", season: 1, episode: 7 },
},
{
  title: "The Lost",
  season: 1,
  episode: 8,
  type: "Main Show",
  released: "2016-12-03T10:00:00.000Z",
  overview: "As Corakinus wages war, the gang must fight against the Shadow Kin one last time.",
  imdb: { id: "tt5079788", season: 1, episode: 8 },
}
];

module.exports = episodes;
