// The page people land on when they open the addon in a browser.
//
// Built to Figma node 1:70, value for value. The page is four things in one
// 1200px column with 128px between them: the logo, the intro, a 3-column grid
// of series cards, and the footer — under a scrolling ticker and over a piece
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

/** What one card needs to know. */
function profile(entry, index) {
  const episodes = episodesFor(entry);
  const playable = episodes.filter(hasStream).length;
  return {
    entry,
    index,
    total: episodes.length,
    playable,
    pct: episodes.length ? Math.round(playable / episodes.length * 100) : 0,
    // Season 0 is the specials bucket, not a season.
    seasons: new Set(episodes.filter((e) => e.season > 0).map((e) => e.season)).size,
    facts: FACTS[entry.key] || {},
    // The bucket's poster, the same URL and the same file the addon hands to
    // Stremio, hash and all. The site used to build its own copy from
    // art-src/, which meant a replaced poster could be live in the app and
    // still old here, with nothing to say which was right.
    art: entry.poster,
  };
}

function seriesCard(p) {
  const { entry, facts } = p;
  const done = p.pct === 100;
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
  const meta = lines.map((m) => `<span>${esc(m)}</span>`).join('');

  return `
    <div class="card rise" style="--i:${p.index}" data-key="${esc(entry.key)}">
      <div class="card-art"><img class="fade" src="${esc(p.art)}" alt="${esc(entry.name)}" width="600" height="900" decoding="async" onload="this.classList.add('ok')"></div>
      <div class="card-body">
        <div class="card-top">
          <b title="${esc(entry.name)}">${esc(entry.name)}</b>
          <div class="card-meta">${meta}</div>
        </div>
        <div class="card-stat ${done ? 'done' : 'todo'}">
          <span><span>${p.playable}/${p.total}</span><span>${p.pct}%</span></span>
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

function landingPage(manifest, baseUrl) {
  // Every card is shown, the chronology included. Only the sums leave it out:
  // its own share of itself is a fair thing to print on its card, but adding
  // it to the catalogue's total counts every episode twice.
  const all = populatedSeries().map(profile);
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
  --bg:#0A0B16;
  --line:#1D1E28;                 /* component borders */
  --hair:rgba(255,255,255,.08);   /* hairline dividers — brighter than --line on this ground */
  --mute:#888897;
  --url:rgba(255,255,255,.24);
  --copy:rgba(255,255,255,.5);
  --go:#05E362;  --go-bg:#1C2725;
  --wait:#E34805; --wait-bg:#271C1C;
  --f:"Hanken Grotesk",ui-sans-serif,system-ui,-apple-system,sans-serif;
  --ease:cubic-bezier(.2,.7,.2,1);
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
}

/* ---------------- ticker: white strip, full width, 12px vertical padding ---------------- */
.ticker{background:#fff;color:var(--bg);padding:12px 0;overflow:hidden}
.ticker-run{display:flex;width:max-content;animation:slide 90s linear infinite;font-weight:600}
.ticker span{white-space:nowrap;padding-right:32px}
.ticker b{font-weight:800;padding-right:6px}
@keyframes slide{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ---------------- hero ---------------- */
.hero{position:relative;background:var(--bg);padding:24px 32px;overflow:hidden}
/* The art is placed relative to the 1200px column — 243px in from its left
   edge, 1151 wide, 647 tall — so it stays with the content rather than
   sliding to the viewport's right edge on a wide screen. */
.hero-art{position:absolute;top:0;left:calc(50% - 357px);width:1151px;height:647px;pointer-events:none}
.hero-art img{width:100%;height:100%;object-fit:cover;display:block;transition-duration:1.4s}
.hero-art::after{content:"";position:absolute;inset:0;
  background:
    linear-gradient(to left,var(--bg) 0%,rgba(10,11,22,0) 50%),
    linear-gradient(to bottom,rgba(10,11,22,0) 50%,var(--bg) 100%),
    linear-gradient(to left,rgba(10,11,22,0) 0%,var(--bg) 100%)}
.col{position:relative;z-index:1;max-width:1200px;margin:0 auto;display:flex;flex-direction:column;gap:128px}

/* logo + rule */
.head{display:flex;flex-direction:column;gap:24px}
/* Figma frames the logo: a 163x24 window onto the image scaled to 124.1% /
   244.9% and pushed up, which keeps the wordmark and crops the BBC block. */
.logo{display:block;position:relative;width:163px;height:24px;overflow:hidden}
.logo img{position:absolute;width:124.1%;height:244.9%;left:-12.05%;top:-112.24%;max-width:none}
.hr{height:1px;background:var(--hair)}

/* intro */
.intro{max-width:600px;display:flex;flex-direction:column;gap:8px}
h1{font-weight:800;font-size:88px;margin:0;white-space:nowrap}
.stack{display:flex;flex-direction:column;gap:32px}
.blurb{margin:0;font-weight:400;font-size:16px}
.row{display:flex;gap:8px;align-items:stretch}
.install{display:inline-flex;align-items:center;justify-content:center;flex:none;
  background:#fff;color:var(--bg);font-weight:600;
  padding:16px 24px;border-radius:4px;text-decoration:none;transition:opacity .15s}
.install:hover{opacity:.85}
.install:focus-visible{outline:2px solid #fff;outline-offset:3px}
.url{flex:1 0 0;min-width:0;display:flex;align-items:center;justify-content:space-between;gap:16px;
  background:rgba(29,30,40,.9);border-radius:4px;padding:16px;
  box-shadow:0 0 28px 0 var(--bg);font-weight:600}
/* The address is displayed in caps, as designed. The href and what "copy"
   puts on the clipboard are the real, lower-case URL: CSS changes the
   rendering, not the text. */
.url a{color:var(--url);text-decoration:underline;text-underline-position:from-font;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.url a:hover{color:#fff}
/* Browsers reset text-transform on buttons; put the caps back. */
.url button{color:var(--copy);background:none;border:0;padding:0;font:inherit;text-transform:uppercase;cursor:pointer;flex:none}
.url button:hover{color:#fff}

/* ---------------- cards: 3 columns, image left at 2:3, text right ---------------- */
.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
/* The design splits the card 169.67 : 217.67 — image 43.8%, body 56.2%.
   The image is locked at 271:406.5 and is never cropped: it sets the row's
   height from its own ratio (align-self:start keeps it out of the stretch
   that made the ratio circular), and the body stretches to that height. The
   body's content fits inside it at every width the grid allows, so the pill
   sits at the bottom through justify-content alone. */
.card{display:grid;grid-template-columns:43.8fr 56.2fr;align-items:start;
  border:1px solid var(--line);border-radius:8px;overflow:hidden}
.card-art{aspect-ratio:271/406.5;min-width:0;align-self:start;background:var(--line)}
.card-art img{width:100%;height:100%;object-fit:cover;display:block}
.card-body{align-self:stretch;display:flex;flex-direction:column;justify-content:space-between;
  padding:24px;min-width:0}
.card-top{display:flex;flex-direction:column;gap:24px}
/* One line, cut with an ellipsis; the full name is in the title attribute. */
.card-top b{font-weight:800;font-size:18px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card-meta{display:flex;flex-direction:column;gap:8px}
.card-meta span{font-weight:700;font-size:14px;text-transform:uppercase;color:var(--mute);
  padding-bottom:8px;border-bottom:1px solid var(--hair)}
.card-meta span:last-child{padding-bottom:0;border-bottom:0}
.card-stat{padding:12px 16px;border-radius:4px}
/* The count sits against the left padding and the percentage against the right. */
.card-stat>span{display:flex;justify-content:space-between;
  font-weight:900;font-size:14px;text-transform:uppercase;white-space:nowrap}
.card-stat.todo{background:var(--wait-bg);color:var(--wait)}
.card-stat.done{background:var(--go-bg);color:var(--go)}

/* ---------------- footer ---------------- */
.foot{display:flex;flex-direction:column;gap:24px}
.foot-text{text-align:center;font-weight:700;color:var(--mute)}
.foot-text p{margin:0}
.foot-text p+p{margin-top:8px}
.foot-text a{text-decoration:underline;text-underline-position:from-font}
.foot-text a:hover{color:#fff}

/* ---------------- below the design's 1920 ----------------
   Three columns only while the column is its full 1200px: any narrower and a
   two-line title no longer fits beside a 2:3 image, so the grid drops to two. */
@media(max-width:1263px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:900px){
  /* The art stays, scaled to the screen and centred behind the intro rather
     than anchored to a 1200px column that no longer exists. */
  .hero-art{left:calc(50% - 80vw);width:160vw;height:auto;aspect-ratio:1151/647}
  h1{font-size:56px;white-space:normal}
  .col{gap:80px}
}
@media(max-width:680px){
  .hero{padding:24px 20px}
  .cards{grid-template-columns:1fr}
  .row{flex-direction:column}
  .url{min-width:0}
}
</style>
</head><body>

<div class="ticker"><div class="ticker-run caps">${tickerRun}</div></div>

<div class="hero">
  <div class="hero-art"><img class="fade" src="${artUrl('hero.webp')}" alt="" width="1600" height="900" fetchpriority="high" onload="this.classList.add('ok')"></div>

  <div class="col">
    <div class="head rise">
      <span class="logo"><img src="${artUrl('logo.png')}" alt="Doctor Who" width="412" height="120"></span>
      <div class="hr"></div>
    </div>

    <div class="intro">
      <h1 class="rise" style="--d:.1s">Whoniverse</h1>
      <div class="stack rise" style="--d:.2s">
        <p class="blurb">A free addon for Stremio and Nuvio with the complete Doctor Who universe in the original UK broadcast order. Specials and minisodes sit inside their seasons, so you can watch straight through.</p>
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

    <div class="foot rise" style="--d:.75s">
      <div class="hr"></div>
      <div class="foot-text caps">
        <p><a href="${DISCORD_URL}" target="_blank" rel="noopener">Discord</a> &middot; <a href="${REPO_URL}" target="_blank" rel="noopener">Source</a> &middot; <a href="${esc(manifestUrl)}">manifest.json</a></p>
        <p>Whoniverse ${esc(manifest.version)} &middot; ${n(live)} of ${n(total)} episodes available.</p>
        <p>Doctor Who is © BBC. Fan-made, non-commercial, not affiliated with the BBC or BBC Studios.</p>
      </div>
    </div>
  </div>
</div>

<script>
// An image that finished loading before its onload attribute was parsed never
// fires load; mark those complete now so nothing stays at opacity 0.
document.querySelectorAll('img.fade').forEach(function (i) { if (i.complete && i.naturalWidth) i.classList.add('ok'); });

</script>
</body></html>`;
}

module.exports = { landingPage };
