// The page people land on when they open the addon in a browser.
//
// Built to Figma node 43:4, value for value. One 1300px column with 128px
// between its parts: the header, the intro, a 3-column grid of series cards,
// the ledger pitch, and the footer — under a scrolling ticker and over a piece
// of key art anchored to the column, not the viewport edge.
//
// Content is read from the catalog and the registry, never written out here:
// the counts, the completion figures and the "updated" date are whatever the
// addon is serving. Cards follow registry order, which is the design's order.
//
// Type rule, from the designer: everything set in caps is 14px, and everything
// at 14px is set in caps. That includes the manifest address.

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { FACTS } = require('./series');
const { populatedSeries, episodesFor, hasStream } = require('./catalog');
const { episodeIsUploaded } = require('./bucket');

// The other two places this project lives. Each surface links the ones it is
// not: the site points at the Discord and the source, the Discord and the
// README point back here.
const DISCORD_URL = 'https://discord.gg/TrVzhzS4BJ';
const REPO_URL = 'https://github.com/nubblyn/whoniverse';

/**
 * An image URL that changes when the image does.
 *
 * /art/ is served with a week-long cache, and Cloudflare holds it at the edge
 * for that long: a replaced poster kept showing the old picture through any
 * number of hard reloads. A short hash of the file's contents in the query
 * string gives a changed file a new address, so caches never need purging.
 */
const PUBLIC = path.join(__dirname, '..', 'public');
const versions = new Map();
function assetUrl(rel) {
  if (!versions.has(rel)) {
    try {
      const hash = crypto.createHash('md5').update(fs.readFileSync(path.join(PUBLIC, rel))).digest('hex').slice(0, 8);
      versions.set(rel, `/${rel}?v=${hash}`);
    } catch {
      versions.set(rel, `/${rel}`);
    }
  }
  return versions.get(rel);
}
const artUrl = (file) => assetUrl(`art/${file}`);
const FONT = 'fonts/hanken-grotesk-latin.woff2';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
));

/**
 * When the running deployment was built. scripts/stamp.js writes the file as
 * Vercel's build step, so the ticker says when the catalogue last changed, not
 * when the page was requested. Locally the file may not exist; use now.
 */
function updatedAt() {
  try { return new Date(require('../data/updated.json').updated); } catch { return new Date(); }
}

/**
 * What one card needs to know.
 *
 * `bucket` is the live listing when it could be read. With it, "playable"
 * means the file is in the bucket; without it, it falls back to "a URL is
 * recorded", which is all the committed data can tell us. The difference is
 * not academic: deleting a series from the bucket left every card still
 * claiming a full set, because the URLs were still written down.
 */
function profile(entry, index, bucket) {
  const episodes = episodesFor(entry);
  const playable = bucket
    ? episodes.filter((e) => episodeIsUploaded(bucket, e)).length
    : episodes.filter(hasStream).length;
  return {
    entry,
    index,
    total: episodes.length,
    playable,
    pct: episodes.length ? Math.round(playable / episodes.length * 100) : 0,
    // Season 0 is the specials bucket, not a season.
    seasons: new Set(episodes.filter((e) => e.season > 0).map((e) => e.season)).size,
    facts: FACTS[entry.key] || {},
    // The bucket's own art, the same URLs and the same files the addon hands to
    // Stremio, hash and all. The site used to build its own copies from
    // art-src/, which meant a replaced image could be live in the app and still
    // old here, with nothing to say which was right.
    art: entry.background || entry.poster,
    logo: entry.logo,
  };
}

function seriesCard(p) {
  const { entry, facts } = p;
  // A film is a date and one movie. The chronology is a date and a count:
  // it is one season by construction, so saying so tells nobody anything,
  // and what it holds are items from every series rather than its own
  // episodes. Everything else is a date, episodes and seasons.
  const lines = facts.film
    ? [facts.era || entry.releaseInfo, '1 movie']
    : facts.chronology
      ? [facts.era || entry.releaseInfo, `${p.total.toLocaleString('en-GB')} items`, 'every series']
      : [
        facts.era || entry.releaseInfo,
        `${p.total} ${p.total === 1 ? 'episode' : 'episodes'}`,
        `${p.seasons} ${p.seasons === 1 ? 'season' : 'seasons'}`,
      ];
  // The design sets the first separator as a slash and the rest as bullets:
  // "1963–1989 / 698 episodes • 26 seasons".
  const meta = esc(lines[0]) + (lines.length > 1 ? ` / ${lines.slice(1).map(esc).join(' &bull; ')}` : '');

  // A logo is drawn over the foot of the artwork. Where a series has none the
  // name takes its place rather than leaving a hole.
  const mark = p.logo
    ? `<img class="card-logo fade" src="${esc(p.logo)}" alt="${esc(entry.name)}" width="412" height="160" loading="lazy" decoding="async" onload="this.classList.add('ok')">`
    : `<b class="card-name">${esc(entry.name)}</b>`;

  return `
    <div class="card rise" style="--i:${p.index}" data-key="${esc(entry.key)}">
      <div class="card-head">
        <div class="card-art"><img class="fade" src="${esc(p.art)}" alt="" width="1920" height="1080" loading="lazy" decoding="async" onload="this.classList.add('ok')"></div>
        <div class="card-mark">${mark}</div>
      </div>
      <div class="card-body">
        <div class="card-text">
          <p class="card-meta caps">${meta}</p>
          <p class="card-blurb">${esc(entry.description || '')}</p>
        </div>
        <div class="card-stat">
          <span class="card-count caps">${p.playable}/${p.total}</span>
          <span class="track"><i style="width:${p.pct}%"></i></span>
          <span class="card-pct caps">${p.pct}%</span>
        </div>
      </div>
    </div>`;
}

// The Complete Chronology is every other series in one running order, so it
// holds no episode of its own. Counting it would count everything twice: with
// it in, the page claimed 700 of 2,261 episodes when the truth was 350 of
// 1,155. It is a way to watch the catalogue, not a part of it, and the ticker
// names it as such.
const CHRONOLOGY = 'complete-chronology';

function landingPage(manifest, baseUrl, bucket) {
  // Every card is shown, the chronology included. Only the sums leave it out:
  // its own share of itself is a fair thing to print on its card, but adding
  // it to the catalogue's total counts every episode twice.
  const all = populatedSeries().map((entry, i) => profile(entry, i, bucket));
  const counted = all.filter((p) => p.entry.key !== CHRONOLOGY);
  const profiles = all;
  const chronology = all.find((p) => p.entry.key === CHRONOLOGY);
  const total = counted.reduce((n, p) => n + p.total, 0);
  const live = counted.reduce((n, p) => n + p.playable, 0);
  const playing = counted.filter((p) => p.playable > 0);
  const queued = counted.filter((p) => p.playable === 0);

  const install = `${baseUrl.replace(/^https?:/, 'stremio:')}/manifest.json`;
  const manifestUrl = `${baseUrl}/manifest.json`;

  const n = (x) => x.toLocaleString('en-GB');
  const updated = updatedAt().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  // What the ticker says: who we are, what plays today, what is coming, and
  // when that last changed. The bold part of each segment is the part that
  // matters if you only catch a glimpse of it.
  const segments = [
    `<b>Whoniverse</b> A Doctor Who addon for Stremio and Nuvio`,
    `<b>${n(live)} of ${n(total)} episodes</b> streaming in original UK broadcast order`,
    `<b>Now playing</b> ${playing.map((p) => esc(p.entry.name) + (p.pct < 100 ? ` (${p.pct}%)` : '')).join(', ')}`,
    `<b>Coming</b> ${queued.map((p) => esc(p.entry.name)).join(', ')}`,
    ...(chronology ? [`<b>Complete Chronology</b> all ${n(chronology.total)} of it in one running order`] : []),
    `<b>Updated</b> ${updated}`,
  ];
  const ticker = segments.map((s) => `<span>${s}</span>`).join('');
  // The loop translates by exactly half, so both halves must be identical.
  const tickerRun = Array.from({ length: 4 }, () => ticker).join('');

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(manifest.name)}: Doctor Who in broadcast order</title>
<meta name="description" content="${esc(manifest.description)}">
<link rel="icon" type="image/png" href="${artUrl('icon.png')}">
<link rel="apple-touch-icon" href="${artUrl('icon.png')}">
<link rel="preload" as="image" href="${artUrl('hero.webp')}" fetchpriority="high">
<link rel="preload" as="font" type="font/woff2" href="${assetUrl(FONT)}" crossorigin>
<style>
/* Hanken Grotesk, served from here rather than from Google. One variable file
   covers 400 to 900, which is 34KB against two DNS lookups, a stylesheet and a
   font file from a third party. SIL Open Font License. */
@font-face{font-family:"Hanken Grotesk";font-style:normal;font-weight:400 900;font-display:swap;
  src:url("${assetUrl(FONT)}") format("woff2")}
:root{
  --bg:#0A0E20;                   /* the design's ground, a shade bluer than the old one */
  --panel:#1A1E30;                /* cards and the manifest field */
  --hair:rgba(255,255,255,.08);   /* hairline dividers and card borders */
  --mute:#888897;
  --dim:rgba(255,255,255,.4);     /* card meta, and the manifest address */
  --copy:#BABABA;
  --go:#1BC38C;                   /* online, and every progress bar */
  --f:"Hanken Grotesk",ui-sans-serif,system-ui,-apple-system,sans-serif;
  --ease:cubic-bezier(.2,.7,.2,1);
  /* The design carries one shadow on everything that sits over the key art. */
  --lift:0 4px 4px rgba(10,14,32,.25),0 0 40px rgba(10,14,32,.5),0 4px 164px rgba(10,14,32,.5);
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:#fff;font-family:var(--f);font-size:16px;
  line-height:normal;-webkit-font-smoothing:antialiased}
a{color:inherit}

/* Everything in caps is 14px; everything at 14px is caps. */
.caps{font-size:14px;text-transform:uppercase}

/* ---------------- entrance ----------------
   One motion for the whole page: rise 16px and fade, 700ms, staggered. Cards
   take their slot from --i. Images fade in on their own once decoded, so a
   slow network shows the frame first and the picture second, never a pop. */
.rise{animation:rise .7s var(--ease) both;animation-delay:calc(var(--d,0s) + var(--i,0) * 60ms)}
@keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
img.fade{opacity:0;transition:opacity .8s var(--ease)}
img.fade.ok{opacity:1}
@media(prefers-reduced-motion:reduce){
  .rise{animation:none}
  img.fade{opacity:1;transition:none}
  .ticker-run{animation:none}
  .shoot{display:none}
}

/* ---------------- ticker: white strip, full width, 12px vertical padding ----------------
   The one place the type rule bends: the design sets this at 12px and still in
   caps, because a 14px strip crowds the logo beneath it. */
.ticker{background:#fff;color:#0A0B16;padding:12px 0;overflow:hidden;position:relative;z-index:2}
.ticker-run{display:flex;width:max-content;animation:slide 90s linear infinite;
  font-weight:700;font-size:12px;text-transform:uppercase}
.ticker span{white-space:nowrap;padding-right:24px}
.ticker b{font-weight:800;padding-right:6px}
@keyframes slide{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ---------------- starfield ----------------
   A canvas, not CSS. Three attempts got here:

   Drifting gradient layers with position:fixed made Firefox re-composite large
   tiles on every scroll frame. Moving to absolute + transform fixed the scroll
   cost but not the motion: at 320px over 150s a layer advances 0.036px per
   frame, and Firefox rounds a composited layer's position to whole pixels
   where Chrome places it on subpixels — so it stepped once every half second
   and read as 1fps. Slowing it down makes that worse, not better, so there is
   no CSS speed that solves it.

   A canvas draws at fractional coordinates everywhere. It is also cheaper: one
   viewport of pixels and a few hundred fillRects, instead of several
   document-tall gradient layers. The field is drawn against the page's scroll
   offset, so it sits behind the document rather than following the viewport. */
.stars{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;display:block}

/* ---------------- shooting stars ----------------
   Left in CSS on purpose: these already look right, and they do not suffer the
   subpixel problem the field did — they cross 620px in about two seconds, so
   every frame advances several pixels and Firefox has nothing to round away.
   A bar with the head at its right end and the tail fading to the left, rotated
   first and then translated along its own X axis, so the tail stays collinear
   with the direction of travel. */
.shooters{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}
.shoot{position:absolute;width:140px;height:1px;transform-origin:100% 50%;
  background:linear-gradient(to left,rgba(255,255,255,.9),rgba(255,255,255,0));
  opacity:0;animation:shoot var(--t) cubic-bezier(.4,0,.7,1) var(--o) infinite;
  will-change:transform,opacity}
.shoot::after{content:"";position:absolute;right:-1px;top:-1.5px;
  width:4px;height:4px;border-radius:50%;background:#fff;
  box-shadow:0 0 10px 2px rgba(255,255,255,.7)}
.shoot.a{--t:17s;--o:4s;  --a:32deg;top:18%;left:26%}
.shoot.b{--t:27s;--o:13s; --a:24deg;top:46%;left:58%}
.shoot.c{--t:39s;--o:25s; --a:38deg;top:71%;left:18%}
@keyframes shoot{
  0%  {opacity:0;transform:rotate(var(--a)) translateX(0)}
  3%  {opacity:1}
  14% {opacity:0;transform:rotate(var(--a)) translateX(620px)}
  100%{opacity:0;transform:rotate(var(--a)) translateX(620px)}
}

/* ---------------- hero ---------------- */
.hero{position:relative;padding:24px 32px;overflow:hidden;z-index:1}
/* The art is placed relative to the 1300px column so it stays with the content
   rather than sliding to the viewport's right edge on a wide screen. Figma has
   it at x=578 in a 1920 frame; the column starts at (1920-1300)/2 = 310, so it
   sits 268px into the column: 50% - 650 + 268. */
.hero-art{position:absolute;top:0;left:calc(50% - 382px);width:1333px;height:750px;pointer-events:none}
.hero-art img{width:100%;height:100%;object-fit:cover;display:block;transition-duration:1.4s}
.hero-art::after{content:"";position:absolute;inset:0;
  background:
    linear-gradient(to left,var(--bg) 0%,rgba(10,14,32,0) 50%),
    linear-gradient(to bottom,rgba(10,14,32,0) 50%,var(--bg) 100%),
    linear-gradient(to left,rgba(10,14,32,0) 40%,var(--bg) 100%)}
.col{position:relative;z-index:1;max-width:1300px;margin:0 auto;display:flex;flex-direction:column;gap:128px}

/* header: logo one side, running state the other */
.head{display:flex;flex-direction:column;gap:24px}
.head-row{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}
/* Figma frames the logo: a 163x24 window onto the image scaled to 124.1% /
   244.9% and pushed up, which keeps the wordmark and crops the BBC block. */
.logo{display:block;position:relative;width:163px;height:24px;overflow:hidden;flex:none}
.logo img{position:absolute;width:124.1%;height:244.9%;left:-12.05%;top:-112.24%;max-width:none}
.hr{height:1px;background:var(--hair)}
/* The state pill. Its ring is 2px, not 1 — at 1 it reads as a tag rather than
   a light. */
.state{display:inline-flex;align-items:center;gap:13px;flex:none;
  background:rgba(27,195,140,.18);border:2px solid var(--go);border-radius:100px;
  padding:8px 16px 8px 13px;color:var(--go);font-weight:600;box-shadow:var(--lift);
  backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
.state i{width:8px;height:8px;border-radius:50%;background:var(--go);flex:none}

/* intro */
.intro{max-width:800px;display:flex;flex-direction:column;gap:24px}
/* Light, not bold: the weight is the whole character of the headline. */
h1{font-weight:300;font-size:72px;line-height:80px;margin:0;text-wrap:balance;
  text-shadow:var(--lift),0 0 12px rgba(0,0,0,.55)}
.stack{display:flex;flex-direction:column;gap:48px}
.blurb{margin:0;font-weight:400;font-size:16px;text-shadow:var(--lift)}
.row{display:flex;gap:8px;align-items:stretch;
  filter:drop-shadow(0 4px 2px rgba(10,14,32,.25)) drop-shadow(0 0 20px rgba(10,14,32,.5))}
.install{display:inline-flex;align-items:center;justify-content:center;flex:none;
  background:#fff;color:#0A0B16;font-weight:600;
  padding:16px 24px;border-radius:4px;text-decoration:none;
  transition-property:opacity,scale;transition-duration:150ms;transition-timing-function:cubic-bezier(0.2,0,0,1)}
.install:hover{opacity:.85}
.install:active{scale:.96}
.install:focus-visible{outline:2px solid #fff;outline-offset:3px}
.url{flex:1 0 0;min-width:0;display:flex;align-items:center;justify-content:space-between;gap:16px;
  background:var(--panel);border-radius:4px;padding:16px;font-weight:600}
/* The address is displayed in caps, as designed. The href and what "copy"
   puts on the clipboard are the real, lower-case URL: CSS changes the
   rendering, not the text. */
.url a{color:var(--dim);text-decoration:none;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.url a:hover{color:#fff}
.url a,.url button,.foot-text a{transition-property:color,scale;transition-duration:120ms;transition-timing-function:cubic-bezier(0.2,0,0,1)}
/* Browsers reset text-transform on buttons; put the caps back. */
.url button{color:var(--copy);background:none;border:0;padding:0;font:inherit;text-transform:uppercase;cursor:pointer;flex:none}
.url button:hover{color:#fff}
.url button:active{scale:.96}

/* ---------------- cards: 3 columns, art over text ---------------- */
.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px}
.card{background:var(--panel);border-radius:24px;overflow:hidden;display:flex;flex-direction:column}
.card-head{display:flex;flex-direction:column}
/* The logo is pulled up over the foot of the artwork, which is why the art
   carries a gradient into the panel colour rather than a hard edge. */
.card-art{position:relative;aspect-ratio:1920/1080;margin-bottom:-64px}
.card-art img{width:100%;height:100%;object-fit:cover;display:block}
.card-art::after{content:"";position:absolute;inset:0;
  background:linear-gradient(to bottom,rgba(26,30,48,0) 0%,var(--panel) 100%)}
.card-mark{position:relative;display:flex;align-items:flex-end;padding:0 24px;min-height:80px}
.card-logo{max-width:206px;max-height:80px;width:auto;height:auto;object-fit:contain;display:block}
.card-name{font-weight:800;font-size:22px}
.card-body{display:flex;flex-direction:column;gap:24px;padding:16px 24px 24px}
.card-text{display:flex;flex-direction:column;gap:16px}
.card-meta{margin:0;font-weight:700;color:var(--dim)}
/* Three lines, then an ellipsis: the descriptions run to different lengths and
   a ragged grid was the one thing the design did not have. */
.card-blurb{margin:0;font-size:16px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;
  overflow:hidden;text-shadow:var(--lift)}
.card-stat{display:flex;align-items:center;gap:8px;
  border:1px solid var(--hair);border-radius:8px;padding:12px 16px}
/* Figma sizes this box for "0/186". The real catalogue reaches "350/1106",
   which overran the fixed 48px and sat on top of the bar — the count keeps
   the design's minimum and grows past it when the numbers need it to. */
.card-count{font-weight:700;color:var(--mute);min-width:48px;flex:none;white-space:nowrap}
.card-pct{font-weight:700;color:var(--go);width:48px;flex:none;text-align:right}
.track{flex:1 0 0;min-width:0;height:4px;border-radius:4px;background:var(--hair);overflow:hidden}
.track i{display:block;height:4px;border-radius:8px;background:var(--go)}

/* ---------------- the ledger ---------------- */
.ledger{display:flex;gap:48px;align-items:center}
.ledger-text{flex:1 0 0;min-width:0;display:flex;flex-direction:column;gap:32px;align-items:flex-start}
.ledger-text h2{margin:0;font-weight:300;font-size:56px;line-height:64px;text-wrap:balance;
  text-shadow:var(--lift),0 0 12px rgba(0,0,0,.55)}
.ledger-text p{margin:0;font-size:16px;text-shadow:var(--lift)}
/* Three figures from the catalogue itself, so the pitch is evidence rather
   than a claim. Same border and radius as a card's progress row. */
.tally{display:flex;gap:8px;width:100%;flex-wrap:wrap}
.tally div{flex:1 0 0;min-width:110px;display:flex;flex-direction:column;gap:4px;
  border:1px solid var(--hair);border-radius:8px;padding:12px 16px}
.tally b{font-weight:700;font-size:24px;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.tally span{font-weight:700;font-size:12px;text-transform:uppercase;color:var(--mute)}
.tally .lit{color:var(--go)}
.shot{flex:1 0 0;min-width:0;position:relative;border:1px solid var(--hair);border-radius:16px;
  overflow:hidden;transform:rotate(3.07deg);
  transition:transform .5s var(--ease),box-shadow .5s var(--ease)}
.shot:hover{transform:rotate(0deg) scale(1.02);box-shadow:var(--lift)}
.shot img{width:100%;height:auto;display:block}
.shot::after{content:"";position:absolute;inset:0;
  background:linear-gradient(to bottom,rgba(10,14,32,0) 0%,var(--bg) 100%)}

/* ---------------- footer ---------------- */
.foot{display:flex;flex-direction:column;gap:24px}
.foot-text{text-align:center;font-weight:700;color:var(--mute)}
.foot-text p{margin:0}
.foot-text p+p{margin-top:8px}
.foot-text a{text-decoration:underline;text-underline-position:from-font}
.foot-text a:hover{color:#fff}

/* ---------------- below the design's 1920 ---------------- */
@media(max-width:1180px){
  .cards{grid-template-columns:repeat(2,minmax(0,1fr))}
  h1{font-size:56px;line-height:64px}
}
@media(max-width:900px){
  /* The art stays, scaled to the screen and centred behind the intro rather
     than anchored to a column that no longer exists. */
  .hero-art{left:calc(50% - 80vw);width:160vw;height:auto;aspect-ratio:1333/750}
  .col{gap:80px}
  .ledger{flex-direction:column;align-items:stretch;gap:32px}
  .ledger-text h2{font-size:40px;line-height:48px}
  .shot{transform:none}
}
@media(max-width:680px){
  .hero{padding:24px 20px}
  .cards{grid-template-columns:1fr}
  .row{flex-direction:column}
  .url{min-width:0}
  h1{font-size:40px;line-height:46px}
}
</style>
</head><body>

<div class="ticker"><div class="ticker-run">${tickerRun}</div></div>

<div class="hero">
  <canvas class="stars" aria-hidden="true"></canvas>
  <div class="shooters" aria-hidden="true"><span class="shoot a"></span><span class="shoot b"></span><span class="shoot c"></span></div>
  <div class="hero-art"><img class="fade" src="${artUrl('hero.webp')}" alt="" width="1920" height="1080" fetchpriority="high" onload="this.classList.add('ok')"></div>

  <div class="col">
    <div class="head rise">
      <div class="head-row">
        <span class="logo"><img src="${artUrl('logo.png')}" alt="Doctor Who" width="412" height="120"></span>
        <span class="state caps"><i></i>Addon ${esc(manifest.version)} &middot; Online</span>
      </div>
      <div class="hr"></div>
    </div>

    <div class="intro">
      <h1 class="rise" style="--d:.1s">Every Doctor. Every Era. One timeline.</h1>
      <div class="stack rise" style="--d:.2s">
        <p class="blurb">Complete Doctor Who series presented in the original UK broadcast order. Includes specials and minisodes integrated within their respective seasons for seamless viewing.</p>
        <div class="row">
          <a class="install caps" href="${esc(install)}">Install</a>
          <div class="url caps">
            <a id="url" href="${esc(manifestUrl)}" target="_blank" rel="noopener">${esc(manifestUrl)}</a>
            <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('url').textContent);this.textContent='copied';setTimeout(()=>this.textContent='copy',1400)">copy</button>
          </div>
        </div>
      </div>
    </div>

    <div class="cards" style="--d:.3s">${profiles.map(seriesCard).join('')}</div>

    <div class="hr rise" style="--d:.6s"></div>

    <div class="ledger rise" style="--d:.65s">
      <div class="ledger-text">
        <h2>Confirm every episode state.</h2>
        <p>Every item in the catalogue with the best release that exists, what is actually held, and what is still missing — the same ledger the addon is built from.</p>
        <div class="tally">
          <div><b>${n(total)}</b><span>catalogued</span></div>
          <div><b class="lit">${n(live)}</b><span>streaming</span></div>
          <div><b>${counted.length}</b><span>series tracked</span></div>
        </div>
        <a class="install caps" href="/ledger">Check ledger</a>
      </div>
      <div class="shot"><img class="fade" src="${artUrl('ledger.webp')}" alt="The Whoniverse ledger" width="1206" height="1093" loading="lazy" decoding="async" onload="this.classList.add('ok')"></div>
    </div>

    <div class="foot rise" style="--d:.75s">
      <div class="hr"></div>
      <div class="foot-text caps">
        <p>Whoniverse ${esc(manifest.version)} &middot; <a href="${DISCORD_URL}" target="_blank" rel="noopener">Discord</a> &middot; <a href="${REPO_URL}" target="_blank" rel="noopener">Source</a> &middot; <a href="/ledger">Ledger</a> &middot; <a href="${esc(manifestUrl)}">manifest.json</a> &middot; ${n(live)} of ${n(total)} episodes available.</p>
        <p>Doctor Who is © BBC. Fan-made, non-commercial, not affiliated with the BBC or BBC Studios.</p>
      </div>
    </div>
  </div>
</div>

<script>
// An image that finished loading before its onload attribute was parsed never
// fires load; mark those complete now so nothing stays at opacity 0.
document.querySelectorAll('img.fade').forEach(function (i) { if (i.complete && i.naturalWidth) i.classList.add('ok'); });

// ---------------- starfield ----------------
// Three bands of stars drifting up at different speeds. Drawn rather than
// styled because CSS could not move them slowly and smoothly at the same time:
// Firefox rounds a composited layer's offset to whole pixels, so a layer
// creeping at 2px a second stepped visibly. A canvas takes fractional
// coordinates in every browser.
//
// The canvas covers the viewport and is drawn against window.scrollY, so the
// field belongs to the page rather than to the screen — scrolling moves
// through it, exactly as an absolutely positioned layer would, at the cost of
// one viewport of pixels instead of a document-tall one.
(function () {
  var cv = document.querySelector('canvas.stars');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d', { alpha: true });
  var still = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  // Deterministic, so the sky is the same on every load and every deploy.
  var seed = 20260911;
  function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

  // px/sec upward, and how tall a band is before it repeats.
  var BANDS = [
    { n: 110, speed: 2.2,  wrap: 900,  r: [0.5, 1.0], a: [0.35, 0.85], hue: '255,255,255' },
    { n: 55,  speed: 5.0,  wrap: 1300, r: [0.7, 1.3], a: [0.30, 0.75], hue: '198,220,255' },
    { n: 24,  speed: 9.5,  wrap: 1800, r: [1.0, 1.8], a: [0.30, 0.70], hue: '255,238,214' }
  ];
  var stars = [];
  BANDS.forEach(function (b, bi) {
    for (var i = 0; i < b.n; i++) {
      stars.push({
        b: bi,
        x: rnd(),                                   // fraction of width
        y: rnd() * b.wrap,                          // px within the band
        r: b.r[0] + rnd() * (b.r[1] - b.r[0]),
        a: b.a[0] + rnd() * (b.a[1] - b.a[0]),
        // a slow individual shimmer, so the field is not uniformly flat
        ph: rnd() * Math.PI * 2,
        sp: 0.5 + rnd() * 1.1
      });
    }
  });

  var w = 0, h = 0, dpr = 1;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    var scroll = window.scrollY || window.pageYOffset || 0;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i], b = BANDS[s.b];
      // Up over time, and up with the page, so the field stays with the document.
      var y = s.y - (still ? 0 : t * s.speedScale) - scroll * 0.45;
      y = y % b.wrap; if (y < 0) y += b.wrap;
      if (y > h) continue;
      var a = still ? s.a : s.a * (0.72 + 0.28 * Math.sin(t * 0.0011 * s.sp + s.ph));
      ctx.globalAlpha = a;
      ctx.fillStyle = 'rgb(' + b.hue + ')';
      ctx.beginPath();
      ctx.arc(s.x * w, y, s.r, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // speed per star, resolved once
  stars.forEach(function (s) { s.speedScale = BANDS[s.b].speed / 1000; });

  var running = true, raf = 0;
  function frame(t) { if (!running) return; draw(t); raf = requestAnimationFrame(frame); }

  size();
  if (still) { draw(0); }
  else {
    raf = requestAnimationFrame(frame);
    // Nothing to animate while the tab is hidden.
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { running = false; cancelAnimationFrame(raf); }
      else if (!running) { running = true; raf = requestAnimationFrame(frame); }
    });
  }
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt); rt = setTimeout(function () { size(); if (still) draw(0); }, 150);
  });
})();
</script>
</body></html>`;
}

module.exports = { landingPage };
