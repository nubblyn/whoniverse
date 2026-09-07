// Judge every file in the bucket against the best version that exists of it.
//
// scripts/probe-media.js says what each file is. This says whether that is as
// good as the episode gets, which is a different question and depends on when
// the episode was made:
//
//   Up to The Next Doctor (Dec 2008)  shot and finished in SD. Every 1080p
//                                     version of these is an upscale, the BBC's
//                                     own included, so an upscale is the ceiling.
//   Planet of the Dead (Apr 2009) on  shot in HD. 1080p is native.
//   The Disney era (Nov 2023 on)      finished in 4K HDR and streamed that way,
//                                     so 1080p is a step below what exists.
//
// Minisodes, trailers and the two animated stories were made at whatever size
// they were made at, and no better version is coming.
//
//   node scripts/quality-report.js > data/quality-report.json

const { series } = require('../lib/series');
const { episodesFor } = require('../lib/catalog');

const probe = require('../data/media-probe.json');

// The first episode shot in HD, and the first finished in 4K for Disney+.
const HD_FROM = Date.parse('2009-04-11');
const UHD_FROM = Date.parse('2023-11-17');

// Made small on purpose: web shorts, a charity skit, two animated serials and
// the in-vision trailers. Nothing better than what we have was ever produced.
const SOURCE_LIMITED = {
  'The Infinite Quest': 'animated serial, made at 540p for the CBBC website',
  Dreamland: 'animated serial, made at 720p for the BBC Red Button',
  'Born Again': 'Children in Need skit, shot and shown in SD',
  'Time Crash': 'Children in Need skit, shot and shown in SD',
  'Music of the Spheres': 'Proms segment, shot and shown in SD',
  'Good as Gold': 'Blue Peter competition winner, shot in SD',
  'P.S.': 'unfilmed scene released as a webcast',
  'Bad Music': 'online short',
};

function eraOf(released) {
  const t = Date.parse(released);
  if (t >= UHD_FROM) return 'uhd';
  if (t >= HD_FROM) return 'hd';
  return 'sd';
}

const ERA = {
  sd: { label: 'SD master', best: 'Upscaled 1080p (BBC Blu-ray)', ceiling: 1080 },
  hd: { label: 'Native HD', best: 'Native 1080p (Blu-ray)', ceiling: 1080 },
  uhd: { label: '4K era', best: '4K HDR (Disney+)', ceiling: 2160 },
};

function main() {
  const entry = series.find((s) => s.key === 'new-who');
  const eps = episodesFor(entry);
  const byId = {};
  for (const e of eps) {
    byId[`S${String(e.season).padStart(2, '0')}E${String(e.episode).padStart(2, '0')}`] = e;
  }

  const out = [];
  for (const r of probe) {
    const e = byId[r.id];
    if (!e) continue;
    if (r.error) { out.push({ id: r.id, title: e.title, error: r.error }); continue; }

    const era = eraOf(e.released);
    const limited = SOURCE_LIMITED[e.title];

    let verdict;
    let note;
    if (limited) {
      verdict = 'best';
      note = limited;
    } else if (era === 'uhd') {
      verdict = 'below';
      note = 'Finished in 4K HDR and streamed that way; this is the 1080p version';
    } else if (r.h >= 960) {
      verdict = 'best';
      note = era === 'sd'
        ? 'Made in SD, so every 1080p version is an upscale. This is as good as it gets'
        : 'Native HD at full frame height';
    } else {
      verdict = 'below';
      note = `Below the ${ERA[era].ceiling}p its era supports`;
    }

    out.push({
      id: r.id,
      season: e.season,
      episode: e.episode,
      title: e.title,
      kind: e.type,
      released: new Date(e.released).toISOString().slice(0, 10),
      era,
      eraLabel: ERA[era].label,
      best: limited ? 'No better version exists' : ERA[era].best,
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
      note,
    });
  }

  // Flag an encode that is thin next to its own kind. Raw bitrate is the wrong
  // number to compare on twice over: a 2:1 Whittaker frame carries eleven per
  // cent fewer pixels than a 16:9 one, and HEVC needs roughly two thirds of
  // what H.264 needs to look the same. So the comparison is bits per pixel,
  // against episodes of the same era and the same codec.
  const groups = {};
  for (const r of out) {
    if (r.error || r.seconds < 1200 || SOURCE_LIMITED[r.title]) continue;
    r.bpp = r.bitrate / (r.width * r.height);
    (groups[`${r.era}|${r.vcodec}`] = groups[`${r.era}|${r.vcodec}`] || []).push(r);
  }
  for (const [key, list] of Object.entries(groups)) {
    if (list.length < 5) continue; // too few to say what normal looks like
    const sorted = list.map((r) => r.bpp).sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    for (const r of list) {
      r.vsPeers = r.bpp / median;
      r.peerGroup = key.replace('|', ' ');
      if (r.vsPeers < 0.75) {
        r.thin = true;
        if (r.verdict === 'best') r.verdict = 'thin';
        r.note = `${Math.round((1 - r.vsPeers) * 100)}% under the median for ${r.vcodec} episodes of its era`;
      }
    }
  }

  process.stdout.write(`${JSON.stringify(out, null, 1)}\n`);
}

main();
