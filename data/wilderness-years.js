// The Wilderness Years — catalogued, not yet playable.
//
// The sixteen years between Survival in 1989 and Rose in 2005, when the
// programme was off the air and what there was of it turned up as charity
// skits and webcasts. Nine items: two charity specials cut into parts as they
// were broadcast, and three webcasts.
//
// Not fetched from Cinemeta like the other data files. Most of this never had
// an IMDb episode entry to fetch, so the list is the ledger's, typed by hand.
// No entry carries a `url`, so the addon catalogues the series and offers no
// streams, and the site lists it as queued.
//
// Dates are deliberately absent rather than guessed. The webcasts went out in
// instalments over months and pinning one date on each would be inventing
// precision the ledger does not have.

const episodes = [
  {
    title: 'Dimensions in Time (1)',
    season: 1,
    episode: 1,
    type: 'Special',
    overview:
      'A two-part charity skit made for Children in Need in 1993, crossing '
      + 'Doctor Who with EastEnders and putting most of the surviving Doctors '
      + 'and companions on Albert Square.',
  },
  {
    title: 'Dimensions in Time (2)',
    season: 1,
    episode: 2,
    type: 'Special',
    overview: 'The second half, broadcast the following night.',
  },
  {
    title: 'Doctor Who and the Curse of Fatal Death (1)',
    season: 1,
    episode: 3,
    type: 'Special',
    overview:
      'Steven Moffat wrote this for Comic Relief in 1999, six years before he '
      + 'wrote for the programme proper. Rowan Atkinson is the Doctor, until '
      + 'he keeps regenerating.',
  },
  {
    title: 'Doctor Who and the Curse of Fatal Death (2)',
    season: 1,
    episode: 4,
    type: 'Special',
  },
  {
    title: 'Doctor Who and the Curse of Fatal Death (3)',
    season: 1,
    episode: 5,
    type: 'Special',
  },
  {
    title: 'Doctor Who and the Curse of Fatal Death (4)',
    season: 1,
    episode: 6,
    type: 'Special',
  },
  {
    title: 'Death Comes to Time',
    season: 1,
    episode: 7,
    type: 'Animated Series',
    overview:
      'A BBC webcast with Sylvester McCoy, told in audio over still images and '
      + 'released in instalments from 2001.',
  },
  {
    title: 'Real Time',
    season: 1,
    episode: 8,
    type: 'Animated Series',
    overview:
      'Colin Baker meets the Cybermen in a Big Finish webcast of 2002, again '
      + 'audio over stills.',
  },
  {
    title: 'Scream of the Shalka',
    season: 1,
    episode: 9,
    type: 'Animated Series',
    overview:
      'Richard E Grant as a Doctor who was meant to be the ninth, animated for '
      + 'the BBC website in 2003 and overtaken by the revival a year later.',
  },
];

module.exports = episodes;
