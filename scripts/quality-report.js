// Judge every file in the bucket against the best version of that episode that
// exists anywhere, and say what that best version is.
//
// probe-media.js says what a file is. This says what it should be, which is a
// research question rather than a measurement, and it moves three times across
// the run:
//
//   To The Next Doctor (Dec 2008)   Shot and finished in SD. The BBC upscaled
//                                   all sixty of these for the box set released
//                                   27 November 2023, so an upscale is the top.
//   Planet of the Dead (Apr 2009)   First episode shot in HD. Blu-ray from here
//                                   on is the native frame.
//   The Star Beast (Nov 2023)       Mastered in 4K HLG HDR and Dolby Vision and
//                                   streamed that way on Disney+ and iPlayer.
//                                   No UHD disc exists; the Blu-rays are 1080p.
//
// Then there are the odd ones out, which do not follow their era at all: the
// charity skits the 2023 box set deliberately left in SD, two animated serials
// with their own Blu-ray, and a handful of pieces that were only ever put on
// the web. Those are listed by name below, with what is actually available.
//
//   node scripts/quality-report.js > data/quality-report.json

const { series } = require('../lib/series');
const { episodesFor } = require('../lib/catalog');

const probe = require('../data/media-probe.json');
const origin = require('../data/media-origin.json');
const cadence = {};
for (const o of origin) cadence[o.id] = o;

const HD_FROM = Date.parse('2009-04-11');  // Planet of the Dead
const UHD_FROM = Date.parse('2023-11-25'); // The Star Beast

const ERA = {
  sd: {
    label: 'SD master',
    ceiling: 1080,
    best: '1080p Blu-ray',
    how: 'Upscaled from the SD master for the box set of 27 November 2023. No HD original exists.',
  },
  hd: {
    label: 'Native HD',
    ceiling: 1080,
    best: '1080p Blu-ray',
    how: 'Shot in HD and released on disc at its native frame. Never published in 4K.',
  },
  uhd: {
    label: '4K era',
    ceiling: 2160,
    best: '2160p HDR (Disney+ / iPlayer)',
    how: 'Mastered in 4K HLG HDR and Dolby Vision and streamed that way. The Blu-ray is 1080p only.',
  },
};

// Episodes whose ceiling is set by something other than the era they aired in.
// `h` is the height of the best version that exists.
const SPECIAL_CASE = {
  'Born Again': {
    h: 576,
    best: '576p SD (Blu-ray extra)',
    how: 'The 2023 box set deliberately left this and Time Crash un-upscaled. Its one improvement there is audio: earlier releases used an early edit that dropped Murray Gold’s score and the cloister bell.',
  },
  'Time Crash': {
    h: 576,
    best: '576p SD (Blu-ray extra)',
    how: 'Left un-upscaled on the 2023 box set alongside Born Again. SD is the ceiling.',
  },
  'Music of the Spheres': {
    h: 576,
    best: '576p SD (DVD extra)',
    how: 'Shot for the 2008 Proms in SD and released as a bonus feature with The Next Doctor. No HD version.',
  },
  'Good as Gold': {
    h: 576,
    best: '576p SD (broadcast)',
    how: 'A Blue Peter competition winner shown on CBBC in 2012. SD broadcast, no disc release.',
  },
  'The Infinite Quest': {
    h: 1080,
    best: '1080i Blu-ray (upscaled)',
    how: 'Made in SD for the CBBC website, then upscaled for the Animated Double Feature Blu-ray of 22 February 2019.',
  },
  Dreamland: {
    h: 1080,
    best: '1080i Blu-ray (native HD)',
    how: 'Produced in HD, unlike The Infinite Quest, and released at that resolution on the 2019 Animated Double Feature Blu-ray.',
  },
  'P.S.': {
    h: 480,
    best: 'Web upload (storyboard)',
    how: 'Never filmed. Released as narrated storyboards on the BBC site and YouTube, which is the only version there has ever been.',
  },
  'Bad Music': {
    h: 1080,
    best: '1080p web upload',
    how: 'A Proms 2024 minisode put out on YouTube rather than broadcast. The official upload runs higher than the copy held here — worth re-pulling.',
    check: true,
  },
  'Destination: Skaro': {
    h: 1080,
    best: '1080p broadcast / iPlayer',
    how: 'A Children in Need minisode on BBC One, carried on iPlayer and YouTube. It sits beside the 60th specials but was not part of their 4K release.',
  },
};

function eraOf(released) {
  const t = Date.parse(released);
  if (t >= UHD_FROM) return 'uhd';
  if (t >= HD_FROM) return 'hd';
  return 'sd';
}

function main() {
  const entry = series.find((s) => s.key === 'new-who');
  const byId = {};
  for (const e of episodesFor(entry)) {
    byId[`S${String(e.season).padStart(2, '0')}E${String(e.episode).padStart(2, '0')}`] = e;
  }

  const out = [];
  for (const r of probe) {
    const e = byId[r.id];
    if (!e) continue;
    if (r.error) { out.push({ id: r.id, title: e.title, error: r.error }); continue; }

    const era = eraOf(e.released);
    const odd = SPECIAL_CASE[e.title];
    const ceiling = odd ? odd.h : ERA[era].ceiling;

    // Frame heights vary by a few lines once black bars are cropped, and the
    // 2:1 Whittaker episodes are 960 lines by design, so the comparison is
    // "reaches its class" rather than an exact match.
    const reaches = r.h >= ceiling - 130;

    let verdict = reaches ? 'best' : 'below';
    let note = odd ? odd.how : ERA[era].how;
    if (!reaches) {
      note = `${odd ? odd.how : ERA[era].how} This file is ${r.h}p.`;
    }
    if (odd && odd.check) verdict = 'check';

    out.push({
      id: r.id,
      season: e.season,
      episode: e.episode,
      title: e.title,
      kind: e.type,
      released: new Date(e.released).toISOString().slice(0, 10),
      era,
      eraLabel: ERA[era].label,
      best: odd ? odd.best : ERA[era].best,
      how: note,
      ceiling,
      width: r.w,
      height: r.h,
      vcodec: r.vcodec,
      tag: r.tag,
      depth: r.depth,
      profile: r.profile,
      acodec: r.acodec,
      channels: r.channels,
      seconds: Math.round(r.seconds),
      size: r.size,
      bitrate: Math.round(r.bitrate),
      faststart: r.faststart,
      verdict,
    });
  }

  // Bitrate is deliberately not a verdict. These seasons were pulled whole from
  // one source at a constant quality setting, where a dark, quiet, slow episode
  // legitimately encodes smaller than a bright, busy one at the same quality.
  // Listen, Sleep No More, Knock Knock and Before the Flood came out lowest,
  // which is a list of the show's dimmest hours, not a list of its worst files.
  //
  // Frame rate is a verdict, because it is not a matter of taste. Doctor Who is
  // finished at 25fps for UK broadcast and every disc of it carries 25. A file
  // running at 23.976 or 29.97 has had its frames decimated or retimed to suit
  // a different television standard, and no setting recovers them.
  for (const r of out) {
    if (r.error) continue;
    const c = cadence[r.id];
    if (!c) continue;
    r.fps = c.fps;
    r.cfr = c.stts <= 2;
    r.native = Math.abs(c.fps - 25) <= 0.1;

    if (r.verdict === 'best' && !r.native) {
      r.verdict = 'cadence';
      r.how = `Runs at ${c.fps}fps where the show is finished at 25. Frames have been dropped or retimed for another television standard, which no re-encode undoes. ${r.how}`;
    } else if (r.verdict === 'best' && !r.cfr) {
      r.verdict = 'cadence';
      r.how = `Right resolution and rate, but the frame timing varies through the file rather than holding steady. ${r.how}`;
    }
  }

  process.stdout.write(`${JSON.stringify(out, null, 1)}
`);
}

main();
