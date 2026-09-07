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
const ART_DIR = path.join(__dirname, '..', 'public', 'art');
const versions = new Map();
function artUrl(file) {
  if (!versions.has(file)) {
    try {
      const hash = crypto.createHash('md5').update(fs.readFileSync(path.join(ART_DIR, file))).digest('hex').slice(0, 8);
      versions.set(file, `/art/${file}?v=${hash}`);
    } catch {
      versions.set(file, `/art/${file}`);
    }
  }
  return versions.get(file);
}

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
    // The same card art the addon serves as the series' poster.
    art: artUrl(entry.art),
  };
}

function seriesCard(p) {
  const { entry, facts } = p;
  const done = p.pct === 100;
  // A film is a date and one movie. Episode and season counts are for the series.
  const lines = facts.film
    ? [facts.era || entry.releaseInfo, '1 movie']
    : [
      facts.era || entry.releaseInfo,
      `${p.total} ${p.total === 1 ? 'episode' : 'episodes'}`,
      `${p.seasons} ${p.seasons === 1 ? 'season' : 'seasons'}`,
    ];
  const meta = lines.map((m) => `<span>${esc(m)}</span>`).join('');

  return `
    <div class="card rise" style="--i:${p.index}" role="button" tabindex="0" data-key="${esc(entry.key)}"
         aria-haspopup="dialog" aria-label="${esc(entry.name)}: episode list">
      <div class="card-art"><img class="fade" src="${esc(p.art)}" alt="" width="400" height="600" decoding="async" onload="this.classList.add('ok')"></div>
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

/**
 * Every series' episodes, grouped by season, for the modal: number, title,
 * date, type, summary, whether it plays, and a small version of our own still
 * where one exists. Stills from anywhere but our bucket are not used. Ships
 * inline as JSON; Season 0 is the specials bucket and goes last.
 */
const THUMB_CDN = 'https://cdn.nubblyn.com/file/whoniverse/';
function thumbFor(still) {
  if (!still || !still.startsWith(THUMB_CDN)) return undefined;
  return `${THUMB_CDN}art/thumbs/${still.slice(THUMB_CDN.length).replace(/\.(jpe?g|png|webp)$/i, '.webp')}`;
}

function episodeData(profiles) {
  const out = {};
  for (const p of profiles) {
    const groups = new Map();
    for (const e of episodesFor(p.entry)) {
      if (!groups.has(e.season)) groups.set(e.season, []);
      groups.get(e.season).push({
        e: e.episode,
        t: e.title,
        d: e.released ? e.released.slice(0, 10) : null,
        k: e.type || 'Main Show',
        // Summaries and stills only for a series we have curated, which is
        // the same as one that plays. The rest is Cinemeta's text and not ours.
        o: p.playable ? (e.overview || undefined) : undefined,
        i: p.playable ? thumbFor(e.thumbnail) : undefined,
        a: hasStream(e) ? 1 : 0,
      });
    }
    const seasons = [...groups.keys()].sort((a, b) => (a === 0) - (b === 0) || a - b)
      .map((n) => ({ n, eps: groups.get(n) }));
    out[p.entry.key] = {
      name: p.entry.name,
      film: !!p.facts.film,
      meta: [p.facts.era || p.entry.releaseInfo, `${p.playable}/${p.total} available`],
      seasons,
    };
  }
  return out;
}

function landingPage(manifest, baseUrl) {
  const profiles = populatedSeries().map(profile);
  // "<" escaped so no episode title can close the script element.
  const episodesJson = JSON.stringify(episodeData(profiles)).replace(/</g, '\\u003c');
  const total = profiles.reduce((n, p) => n + p.total, 0);
  const live = profiles.reduce((n, p) => n + p.playable, 0);
  const playing = profiles.filter((p) => p.playable > 0);
  const queued = profiles.filter((p) => p.playable === 0);

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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="image" href="${artUrl('hero.webp')}" fetchpriority="high">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700;800;900&display=swap">
<style>
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

/* ---------------- episode list modal ----------------
   A native dialog in the page's own language: the card's border and radius,
   14px caps for everything that is a label, hairlines between rows. */
.card{cursor:pointer;transition:border-color .2s var(--ease)}
.card:hover,.card:focus-visible{border-color:rgba(255,255,255,.28);outline:none}
.modal{background:var(--bg);color:#fff;border:0;border-radius:8px;padding:0;
  width:min(820px,calc(100vw - 32px));height:min(88vh,960px);margin:auto;overflow:hidden;
  display:flex;flex-direction:column}
.modal:not([open]){display:none}
/* The page behind goes a tone lighter than the panel, so the panel's edge
   reads without a border. */
.modal::backdrop{background:rgba(29,30,40,.9);backdrop-filter:blur(6px)}
.modal[open]{animation:rise .35s var(--ease) both}
.modal[open]::backdrop{animation:fadein .35s var(--ease) both}
/* Closing runs the same motion backwards; the element is closed once it ends. */
.modal.closing{animation:fall .25s var(--ease) both}
.modal.closing::backdrop{animation:fadeout .25s var(--ease) both}
@keyframes fall{from{opacity:1;transform:none}to{opacity:0;transform:translateY(12px)}}
@keyframes fadein{from{opacity:0}to{opacity:1}}
@keyframes fadeout{from{opacity:1}to{opacity:0}}
@media(prefers-reduced-motion:reduce){.modal[open],.modal.closing,.modal[open]::backdrop,.modal.closing::backdrop{animation:none}}
body:has(.modal[open]){overflow:hidden}
.modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;padding:24px 24px 0}
.modal-title{display:flex;flex-direction:column;gap:8px;min-width:0}
.modal-title b{font-weight:800;font-size:24px;line-height:1.1}
.modal-title span{font-weight:700;color:var(--mute)}
.modal-title span i{font-style:normal;padding:0 8px;opacity:.5}
.modal-close{flex:none;width:40px;height:40px;display:grid;place-items:center;background:none;
  border:1px solid var(--line);color:#fff;border-radius:4px;cursor:pointer;padding:0}
.modal-close:hover{border-color:rgba(255,255,255,.28)}
/* tools: search, type chips, season jump */
.modal-tools{display:flex;flex-direction:column;gap:12px;padding:20px 24px;border-bottom:1px solid var(--hair)}
.search{flex:1;min-width:0;display:flex;align-items:center;background:rgba(29,30,40,.9);border-radius:4px;padding:0 16px}
/* Typed text is a label like everything else here: 14px, caps. */
.search input{flex:1;min-width:0;background:none;border:0;color:#fff;font-family:inherit;font-size:14px;
  text-transform:uppercase;font-weight:700;padding:15px 0;outline:none}
.search input::placeholder{color:var(--mute);font-weight:700;text-transform:uppercase}
.search input::-webkit-search-cancel-button{-webkit-appearance:none}
.search span{flex:none;font-weight:700;color:var(--mute);white-space:nowrap}
.tools-row{display:flex;gap:8px;align-items:stretch}
/* One line of chips. Swipe or scroll sideways for the rest; a fade at either
   edge says there is more, and goes when there is not. */
.chips-wrap{position:relative}
.chips{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;scroll-snap-type:x proximity}
.chips::-webkit-scrollbar{display:none}
.chips-wrap::before,.chips-wrap::after{content:"";position:absolute;top:0;bottom:0;width:56px;pointer-events:none;
  opacity:0;transition:opacity .2s}
.chips-wrap::before{left:0;background:linear-gradient(to right,var(--bg),rgba(10,11,22,0))}
.chips-wrap::after{right:0;background:linear-gradient(to left,var(--bg),rgba(10,11,22,0))}
.chips-wrap.more-left::before,.chips-wrap.more-right::after{opacity:1}
.chip{flex:none;white-space:nowrap;scroll-snap-align:start}
.chip{background:none;border:1px solid var(--line);color:var(--mute);border-radius:4px;padding:9px 12px;
  font-family:inherit;font-size:14px;text-transform:uppercase;font-weight:700;cursor:pointer;display:inline-flex;
  gap:8px;align-items:baseline;transition:background-color .15s,border-color .15s,color .15s}
.chip i{font-style:normal;opacity:.6}
.chip:hover{border-color:rgba(255,255,255,.28);color:#fff}
/* Selected fills rather than outlines: a brighter border read as a hover state
   and left the row of chips looking undecided. The border matches the fill so
   the chip keeps its size and shows no outline. */
.chip.on{background:#fff;border-color:#fff;color:var(--bg)}
.chip.on i{opacity:.55}
/* Native arrow replaced with a chevron drawn at the text's weight, 12px in from the edge. */
.jump{flex:none;background:rgba(29,30,40,.9);color:#fff;border:0;border-radius:4px;padding:10px 36px 10px 16px;
  font-family:inherit;font-size:14px;text-transform:uppercase;font-weight:700;cursor:pointer;color-scheme:dark;
  max-width:100%;appearance:none;-webkit-appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none' stroke='%23fff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2.5 4.5l3.5 3.5 3.5-3.5'/%3E%3C/svg%3E");
  background-repeat:no-repeat;background-position:right 12px center}
.jump[hidden]{display:none}
/* the list */
.modal-body{flex:1;overflow-y:auto;padding:0 24px 24px;scrollbar-width:thin;scrollbar-color:var(--line) transparent}
/* Season headers stay put while their episodes scroll under them, so the
   list always says where you are. */
.season+.season{margin-top:16px}
.season-head{position:sticky;top:0;z-index:1;background:var(--bg);display:flex;justify-content:space-between;
  font-weight:700;color:#fff;padding:24px 0 10px;border-bottom:1px solid var(--hair)}
.season-head span+span{color:var(--mute)}
/* Column gap only: the summary is a second grid row, and a row gap would
   space it out even while collapsed. */
.ep{display:grid;grid-template-columns:112px minmax(0,1fr);gap:0 16px;align-items:center;padding:10px 0;
  border-bottom:1px solid var(--hair);cursor:default}
.ep:last-child{border-bottom:0}
.ep.has-o{cursor:pointer}
.ep.has-o:focus-visible{outline:none}
.ep.has-o:focus-visible .ep-t,.ep.has-o:hover .ep-t{text-decoration:underline;text-underline-position:from-font}
.ep-th{aspect-ratio:16/9;background:var(--line);border-radius:4px;overflow:hidden;display:flex;align-items:center;
  justify-content:center;font-weight:700;color:var(--mute)}
.ep-th img{width:100%;height:100%;object-fit:cover;display:block;opacity:0;transition:opacity .35s ease}
.ep-th img.ready{opacity:1}
.ep.off .ep-th img.ready{opacity:.55}
/* A still weighs a few KB but there are up to 239 of them, so the row shows a
   moving placeholder until its own image arrives rather than a dark hole. The
   class comes off on load, which also stops the animation. */
.ep-th.load{background:linear-gradient(90deg,var(--line) 25%,#2A2B38 50%,var(--line) 75%);
  background-size:200% 100%;animation:shimmer 1.4s linear infinite}
@keyframes shimmer{from{background-position:200% 0}to{background-position:-200% 0}}
@media(prefers-reduced-motion:reduce){
  .ep-th.load{animation:none}
  .ep-th img{transition:none}
}
.ep-main{min-width:0;display:flex;flex-direction:column;gap:6px}
.ep-line{display:flex;align-items:baseline;gap:10px;min-width:0}
.ep-t{font-weight:700;font-size:14px;text-transform:uppercase;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ep.off .ep-t{color:var(--mute)}
.ep-k{flex:none;font-weight:700;color:var(--mute)}
.ep-sub{display:flex;align-items:center;gap:10px;font-weight:700;color:var(--mute);white-space:nowrap}
.ep-sub::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--wait);flex:none}
.ep.on .ep-sub::before{background:var(--go)}
/* The summary slides open: a grid row that grows from 0fr to 1fr. The box and
   the text move separately. Fading them together made the text legible while
   it was still being squeezed, which is what read as wonky; the text now waits
   for the box to be most of the way open, then rises into place the way the
   rest of the page enters. Closing reverses the order, text first and quick. */
.ep-o{grid-column:1/-1;display:grid;grid-template-rows:0fr;margin-top:0;
  transition:grid-template-rows .26s var(--ease),margin-top .26s var(--ease)}
.ep-o p{margin:0;min-height:0;overflow:hidden;font-size:15px;line-height:1.5;color:rgba(255,255,255,.8);
  opacity:0;transform:translateY(6px);transition:opacity .12s ease,transform .12s ease}
.ep.open .ep-o{grid-template-rows:1fr;margin-top:10px}
.ep.open .ep-o p{opacity:1;transform:none;
  transition:opacity .18s ease .04s,transform .24s var(--ease) .04s}
@media(prefers-reduced-motion:reduce){.ep-o,.ep-o p{transition:none}}
.ep.open .ep-t{white-space:normal}
.empty{padding:40px 0;text-align:center;font-weight:700;color:var(--mute)}
@media(max-width:680px){
  .modal{width:calc(100vw - 16px);height:calc(100vh - 16px);height:calc(100dvh - 16px)}
  .modal-head{padding:20px 20px 0}
  .modal-tools{padding:16px 20px}
  .modal-body{padding:0 20px 20px}
  .ep{grid-template-columns:88px minmax(0,1fr);gap:0 12px}
  .ep-k{display:none}
}

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

<dialog class="modal" id="modal" aria-labelledby="modal-name">
  <div class="modal-head">
    <div class="modal-title">
      <b id="modal-name"></b>
      <span class="caps" id="modal-meta"></span>
    </div>
    <button type="button" class="modal-close" data-close aria-label="Close">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>
    </button>
  </div>
  <div class="modal-tools">
    <div class="tools-row">
      <label class="search">
        <input id="modal-search" type="search" placeholder="Search episodes" autocomplete="off" spellcheck="false" aria-label="Search episodes">
      </label>
      <select class="jump caps" id="modal-jump" aria-label="Jump to season"></select>
    </div>
    <div class="chips-wrap" id="modal-chips-wrap">
      <div class="chips" id="modal-chips" role="group" aria-label="Episode type"></div>
    </div>
  </div>
  <div class="modal-body" id="modal-body"></div>
</dialog>

<script id="episodes" type="application/json">${episodesJson}</script>
<script>
// An image that finished loading before its onload attribute was parsed never
// fires load; mark those complete now so nothing stays at opacity 0.
document.querySelectorAll('img.fade').forEach(function (i) { if (i.complete && i.naturalWidth) i.classList.add('ok'); });

// Episode list: click a card, read the series. Search, filter by type, jump
// to a season, open a row for its summary.
(function () {
  var data = JSON.parse(document.getElementById('episodes').textContent);
  var modal = document.getElementById('modal');
  if (!modal.showModal) return;
  var $ = function (id) { return document.getElementById(id); };
  var name = $('modal-name'), meta = $('modal-meta'), body = $('modal-body'), search = $('modal-search'),
      chips = $('modal-chips'), chipsWrap = $('modal-chips-wrap'), jump = $('modal-jump');
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var TYPES = ['Main Show', 'Special', 'Minisode', 'Prequel', 'Animated Series'];
  var cur = null, type = 'All', season = 'All';

  function date(d) { if (!d) return ''; var p = d.split('-'); return +p[2] + ' ' + months[+p[1] - 1] + ' ' + p[0]; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function label(s, season) { return s.film ? 'Feature' : season.n === 0 ? 'Specials' : 'Season ' + season.n; }
  function num(s, e) { return s.film ? '' : 'E' + (e.e < 10 ? '0' : '') + e.e; }

  function row(s, e) {
    var th = e.i ? '<img loading="lazy" decoding="async" src="' + esc(e.i) + '" alt="" width="320" height="180">'
      : '<span class="caps">' + (s.film ? 'M01' : num(s, e)) + '</span>';
    return '<div class="ep ' + (e.a ? 'on' : 'off') + (e.o ? ' has-o' : '') + '"' + (e.o ? ' role="button" tabindex="0" aria-expanded="false"' : '') + '>' +
      '<div class="ep-th' + (e.i ? ' load' : '') + '">' + th + '</div>' +
      '<div class="ep-main">' +
        '<div class="ep-line"><span class="ep-t">' + (e.i && !s.film ? num(s, e) + ' &middot; ' : '') + esc(e.t) + '</span>' +
          (e.k !== 'Main Show' ? '<span class="ep-k caps">' + esc(e.k) + '</span>' : '') + '</div>' +
        '<div class="ep-sub caps"><span>' + (e.a ? 'Available' : 'Coming soon') + '</span>' + (e.d ? '<span>&middot;</span><span>' + date(e.d) + '</span>' : '') + '</div>' +
      '</div>' +
      (e.o ? '<div class="ep-o"><p>' + esc(e.o) + '</p></div>' : '') +
    '</div>';
  }

  function render() {
    var s = data[cur]; if (!s) return;
    var q = search.value.trim().toLowerCase();
    var shown = 0, total = 0, html = '';
    s.seasons.forEach(function (se) {
      if (season !== 'All' && String(se.n) !== season) return;
      var eps = se.eps.filter(function (e) {
        total++;
        if (type !== 'All' && e.k !== type) return false;
        if (q && e.t.toLowerCase().indexOf(q) < 0 && e.k.toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      if (!eps.length) return;
      shown += eps.length;
      var live = eps.filter(function (e) { return e.a; }).length;
      html += '<section class="season" id="season-' + se.n + '"><div class="season-head caps"><span>' + label(s, se) + '</span><span>' +
        (s.film ? '' : live + '/' + eps.length) + '</span></div>' + eps.map(function (e) { return row(s, e); }).join('') + '</section>';
    });
    body.innerHTML = html || '<p class="empty caps">Nothing matches</p>';
    reveal();
  }

  // Each still fades in when it arrives and takes its skeleton with it. An
  // image already in cache can be complete before this runs, so that case is
  // handled up front rather than waiting for a load event that never fires.
  function reveal() {
    var imgs = body.querySelectorAll('.ep-th img');
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        function done(ok) {
          if (ok) img.classList.add('ready');
          img.parentNode.classList.remove('load');
        }
        if (img.complete) { done(img.naturalWidth > 0); return; }
        img.addEventListener('load', function () { done(true); });
        img.addEventListener('error', function () { done(false); });
      }(imgs[i]));
    }
  }

  function fades() {
    chipsWrap.classList.toggle('more-left', chips.scrollLeft > 4);
    chipsWrap.classList.toggle('more-right', chips.scrollLeft + chips.clientWidth < chips.scrollWidth - 4);
  }

  function open(key) {
    var s = data[key]; if (!s) return;
    cur = key; type = 'All'; season = 'All'; search.value = '';
    name.textContent = s.name;
    meta.innerHTML = s.meta.map(esc).join('<i>&middot;</i>');
    // type chips, only for the types this series has
    var counts = {}; s.seasons.forEach(function (se) { se.eps.forEach(function (e) { counts[e.k] = (counts[e.k] || 0) + 1; }); });
    var present = TYPES.filter(function (t) { return counts[t]; });
    chips.innerHTML = present.length > 1
      ? ['All'].concat(present).map(function (t) {
          var n = t === 'All' ? Object.keys(counts).reduce(function (a, k) { return a + counts[k]; }, 0) : counts[t];
          return '<button type="button" class="chip caps' + (t === 'All' ? ' on' : '') + '" data-type="' + esc(t) + '">' + esc(t) + '<i>' + n + '</i></button>';
        }).join('')
      : '';
    // season filter, only when there is more than one season
    jump.hidden = s.film || s.seasons.length < 2;
    jump.innerHTML = '<option value="All">All seasons</option>' +
      s.seasons.map(function (se) { return '<option value="' + se.n + '">' + label(s, se) + '</option>'; }).join('');
    jump.value = 'All';
    render();
    body.scrollTop = 0;
    chips.scrollLeft = 0;
    cancelClose();
    if (!modal.open) modal.showModal();
    fades();
    if (window.matchMedia('(min-width: 900px)').matches) search.focus();
  }

  document.querySelectorAll('.card[data-key]').forEach(function (card) {
    card.addEventListener('click', function () { open(card.dataset.key); });
    card.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); open(card.dataset.key); } });
  });
  search.addEventListener('input', render);
  chips.addEventListener('scroll', fades, { passive: true });
  window.addEventListener('resize', fades);
  chips.addEventListener('click', function (ev) {
    var chip = ev.target.closest('.chip'); if (!chip) return;
    type = chip.dataset.type;
    chips.querySelectorAll('.chip').forEach(function (c) { c.classList.toggle('on', c === chip); });
    chip.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    render();
  });
  jump.addEventListener('change', function () { season = jump.value; render(); body.scrollTop = 0; });
  body.addEventListener('click', function (ev) {
    var ep = ev.target.closest('.ep.has-o'); if (!ep) return;
    var open = ep.classList.toggle('open'); ep.setAttribute('aria-expanded', open);
  });
  body.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Enter' && ev.key !== ' ') return;
    var ep = ev.target.closest('.ep.has-o'); if (!ep) return;
    ev.preventDefault(); var open = ep.classList.toggle('open'); ep.setAttribute('aria-expanded', open);
  });
  // Every way out runs the closing motion first, then closes the element.
  // Opening again before the motion has finished cancels it: otherwise the
  // pending finish would fire against the newly opened dialog and shut it.
  var closing = null;
  function cancelClose() {
    if (!closing) return;
    clearTimeout(closing.timer);
    modal.removeEventListener('animationend', closing.done);
    modal.classList.remove('closing');
    closing = null;
  }
  function closeModal() {
    if (!modal.open || closing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { modal.close(); return; }
    modal.classList.add('closing');
    var done = function () { cancelClose(); modal.close(); };
    closing = { done: done, timer: setTimeout(done, 400) }; // the timer covers a missed animationend
    modal.addEventListener('animationend', done);
  }
  modal.querySelector('[data-close]').addEventListener('click', closeModal);
  // A click on the backdrop lands on the dialog element itself, not its children.
  modal.addEventListener('click', function (ev) { if (ev.target === modal) closeModal(); });
  // The browser's own Escape handling closes instantly; take it over.
  modal.addEventListener('cancel', function (ev) { ev.preventDefault(); closeModal(); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && modal.open) { ev.preventDefault(); closeModal(); } });
})();
</script>
</body></html>`;
}

module.exports = { landingPage };
