#!/usr/bin/env python3
"""Render the ledger as a single HTML page you can actually read.

    python ledger/viewer.py

Writes out/ledger.html. Open it locally, or publish it as an artifact to read
the catalogue without opening Google Sheets. This is deliberately not a
spreadsheet clone: the stills carry the colour, the category rides a hairline
rather than a filled cell, and each episode is one composed row.
"""

import html
import io
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import build  # noqa: E402

OUT = os.path.join(HERE, 'out')
DOWNLOADS = os.path.join(os.path.expanduser('~'), 'Downloads')

# The stills already live in the bucket and are served through Cloudflare, so
# the page links to them rather than carrying its own copies. Note the
# /file/whoniverse/ prefix — without it the CDN returns 404.
CDN = os.environ.get('WHONIVERSE_CDN', 'https://cdn.nubblyn.com/file/whoniverse')

# Everything in the bucket, so the page can say per item whether it is uploaded
# yet. Refresh with scripts/bucket-index.sh. With no index the page still
# renders; it just cannot tell you what is missing.
_bucket = None


def _index():
    global _bucket
    if _bucket is not None:
        return _bucket
    _bucket = set()
    listing = os.environ.get('WHONIVERSE_B2_LISTING',
                             os.path.join(OUT, 'bucket-index.txt'))
    if os.path.exists(listing):
        with io.open(listing, encoding='utf-8') as fh:
            _bucket = {ln.strip() for ln in fh if ln.strip()}
    return _bucket


def in_bucket(path):
    idx = _index()
    return (path in idx) if idx else None   # None = we cannot tell


def still(folder, season, file_name):
    """URL of the episode still in the bucket. Nothing is copied or resized:
    duplicating the image here would mean two things to keep in step."""
    if not file_name or not folder:
        return ''
    path = '%s/season_%s/%s.jpg' % (folder, season, file_name)
    if in_bucket(path) is False:
        return ''
    return '%s/%s' % (CDN, path)


def art(folder, kind):
    """Series poster / background / logo, straight from the bucket."""
    if not folder:
        return ''
    ext = 'png' if kind == 'logo' else 'jpg'
    path = '%s/%s_%s.%s' % (folder, folder, kind, ext)
    if in_bucket(path) is False:
        return ''
    return '%s/%s' % (CDN, path)


# Subtitles are not always a file of their own. The Blu-ray-sourced series carry
# them inside the video as a PGS track, so looking only for a sidecar .srt
# reported "subtitles 0/42" for Torchwood, Class, Sarah Jane, Land and Sea and
# the TV Movie — none of which is missing subtitles at all.
# scripts/probe-subtitles.js reads each file's stream list over a range request
# and records what is really there.
_subs = None


def _subtitle_probe():
    global _subs
    if _subs is not None:
        return _subs
    _subs = {}
    p = os.path.join(HERE, '..', 'data', 'subtitles.json')
    if os.path.exists(p):
        import json
        with io.open(p, encoding='utf-8') as fh:
            _subs = json.load(fh)
    return _subs


def episode_assets(folder, season, file_name):
    """Which of video / still / subtitles are uploaded for one episode."""
    if not file_name or not folder:
        return {}
    base = '%s/season_%s/%s' % (folder, season, file_name)
    # .m4v as well as .mp4 and .mkv: 121 of the Classic files carry that
    # extension, and checking only the first two reported 583 of 701 uploaded.
    vid, vext = None, ''
    for ext in ('.mp4', '.mkv', '.m4v'):
        vid = in_bucket(base + ext)
        if vid:
            vext = ext
            break

    # A sidecar file and an embedded track are different delivery, not
    # different presence: either means the episode has subtitles.
    subs = in_bucket(base + '.srt')
    probe = _subtitle_probe().get(base)
    if probe:
        if probe.get('sidecar') or (probe.get('embedded') or 0) > 0:
            subs = True
        elif probe.get('embedded') == 0 and subs is not True:
            subs = False

    return {'video': vid, 'ext': vext, 'still': in_bucket(base + '.jpg'), 'subs': subs}


# Category tints a hairline down the row's left edge and nothing else.
KIND = {
    'Main Show': 'main', 'Special': 'spec', 'Minisode': 'mini',
    'Animated Series': 'anim', 'Prequel': 'preq',
    'Animated Restoration': 'anim', 'Movie': 'main',
}

CSS = """
/* ================================================================
   The ledger, designed as a tool rather than a page.

   It wears the site's clothes — same ground, panel, green, Hanken
   Grotesk, the rule that everything in caps is 14px, and the same single
   motion — but its job is different: this is a checklist someone keeps open,
   not a page someone arrives at. So the layout is a rail and a working column
   rather than a centred read, and the entrance animation plays on the
   furniture only. Never on the rows: a stagger across 716 of them would be a
   wave you had to sit through every time you changed series.

   Three zones. The site header. A rail down the left where every series is
   one row with a bar for how much of it is in the bucket — that rail *is* the
   overview, so no separate row of big numbers. And the working column: the
   filters that operate on the list, then the list itself.

   One rule governs the colour. A satisfied state is silent and a deficit
   speaks. The list used to fill three green chips on every complete row, which
   put roughly two thousand coloured chips on Classic Who and buried the
   fifteen rows that actually want attention. Green is now unfilled and dim;
   the red and amber fills are what survive, so a gap is the only loud thing
   on screen.
   ================================================================ */
@font-face{font-family:"Hanken Grotesk";font-style:normal;font-weight:400 900;font-display:swap;
  src:url("/fonts/hanken-grotesk-latin.woff2") format("woff2")}
:root{
  color-scheme:dark;
  --bg:#0A0E20; --panel:#1A1E30; --panel-2:#20253a; --rail:var(--bg);
  --row-hover:rgba(255,255,255,.035); --well:#070A18;
  --hair:rgba(255,255,255,.08); --line:rgba(255,255,255,.14);
  --ink:#fff; --mute:#888897; --dim:rgba(255,255,255,.58);
  --go:#1BC38C;  --go-bg:rgba(27,195,140,.14);
  --warn:#E3A505; --warn-bg:rgba(227,165,5,.14);
  --miss:#E34805; --miss-bg:rgba(227,72,5,.14);
  --f:"Hanken Grotesk",ui-sans-serif,system-ui,-apple-system,sans-serif;
  --k-main:#3d4660; --k-spec:#c08a2e; --k-mini:#3f72b0; --k-anim:#8155ad; --k-preq:#2f8079; --k-gone:#b0463a;
  /* The landing page's curve and its one shadow, so the two surfaces move and
     lift the same way. */
  --ease:cubic-bezier(.2,.7,.2,1);
  --lift:0 4px 4px rgba(10,14,32,.25),0 0 40px rgba(10,14,32,.5),0 4px 164px rgba(10,14,32,.5);
}
*{box-sizing:border-box}
/* Read aloud, never drawn. The quality columns are three bare values in a row
   and the file chips are three letters; without these a screen reader gets
   "704x528 25fps, 1080p Blu-ray, V S T" with nothing saying which is which. */
.vh{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;
  clip:rect(0 0 0 0);white-space:nowrap;border:0}
.skip{position:absolute;left:12px;top:-60px;z-index:20;background:var(--panel);color:#fff;
  padding:10px 16px;border-radius:6px;font-size:14px;font-weight:700;
  box-shadow:inset 0 0 0 1px var(--line);transition:top .16s var(--ease)}
.skip:focus{top:12px;outline:2px solid var(--go);outline-offset:2px}
html,body{height:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--f);font-size:16px;line-height:1.45;
  -webkit-font-smoothing:antialiased;display:flex;flex-direction:column;overflow:hidden}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit}
.caps{font-size:14px;text-transform:uppercase}
button,a,.pips i{touch-action:manipulation}

/* ---- the ground ----
   The same drifting starfield the landing page draws, at about half its
   brightness. It is a canvas rather than CSS for the reason recorded in
   lib/landing.js: Firefox rounds a composited layer's offset to whole pixels,
   so a layer creeping a couple of pixels a second steps visibly, and no CSS
   speed avoids it. Fixed behind everything, and it never scrolls with a pane —
   the panes scroll internally, so the field stays put and reads as depth
   behind a window rather than a parallax trick. */
.stars{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;display:block}
.head,.shell{position:relative;z-index:1}

/* ---- one motion, shared with the landing page ----
   rise is 16px and a fade over 700ms, staggered 60ms per item. It plays on the
   header, the rail, the toolbar and whatever furniture a pane puts above its
   list. Rows are excluded by design. */
.rise{animation:rise .7s var(--ease) both;animation-delay:calc(var(--d,0s) + var(--i,0) * 60ms)}
/* Transform only. This used to fade from opacity 0 with fill-mode both,
   which meant the rail and the toolbar were genuinely invisible until the
   animation ran — and in a background tab it never runs, so the content
   stayed at zero. The accessibility engine read the series labels at
   1.19:1 for that reason. Sliding into place keeps the same movement and
   never makes text unreadable to reach it. */
@keyframes rise{from{transform:translateY(16px)}to{transform:none}}
img.fade{opacity:0;transition:opacity .8s var(--ease)}
img.fade.ok{opacity:1}

/* ---- site header ---- */
.head{flex:none}
.head-row{display:flex;align-items:center;gap:24px;padding:24px 32px 20px}
.logo{display:block;position:relative;width:163px;height:24px;overflow:hidden;flex:none}
.logo img{position:absolute;width:124.1%;height:244.9%;left:-12.05%;top:-112.24%;max-width:none}
.hr{height:1px;background:var(--hair)}
/* The landing page's pill, ring and all, plus the shadow it carries there. The
   dot breathes so the header has one live thing in it; it is the only looping
   animation on the page. */
.state{display:inline-flex;align-items:center;gap:13px;background:rgba(27,195,140,.18);border:2px solid var(--go);
  border-radius:100px;padding:8px 16px 8px 13px;color:var(--go);font-weight:600;box-shadow:var(--lift);
  backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
.state i{width:8px;height:8px;border-radius:50%;background:var(--go);flex:none;
  animation:beat 3.2s ease-in-out infinite}
@keyframes beat{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(27,195,140,.5)}
  50%{opacity:.65;box-shadow:0 0 0 5px rgba(27,195,140,0)}}

/* ---- rail + working column ---- */
.shell{flex:1 1 auto;min-height:0;display:flex}
/* The rail keeps the canvas background rather than a colour of its own, so the
   starfield runs behind it and the page stays one space instead of splitting
   into a sidebar world and a content world. The border does the separating. */
.side{flex:none;width:272px;background:transparent;border-right:1px solid var(--hair);
  overflow-y:auto;padding:16px 12px 24px;display:flex;flex-direction:column;gap:2px}
.side h4{margin:8px 10px 6px;font-size:14px;text-transform:uppercase;font-weight:700;color:var(--mute)}
.nav{display:grid;grid-template-columns:1fr auto;gap:6px 12px;align-items:center;padding:11px 12px;
  border-radius:6px;cursor:pointer;color:var(--dim)}
.nav:hover{background:var(--row-hover);color:#fff}
.nav.on{background:var(--panel);color:#fff;box-shadow:inset 0 0 0 1px var(--hair)}
.nav .nm{font-weight:700;font-size:15px;line-height:1.2;grid-column:1}
.nav .n{font-weight:800;font-variant-numeric:tabular-nums;font-size:14px;grid-column:2;grid-row:1;white-space:nowrap}
.nav .n em{font-style:normal;font-weight:600;color:var(--mute)}
.nav .track{grid-column:1 / -1;height:3px;border-radius:3px;background:var(--hair);overflow:hidden}
/* Scaled rather than sized, so the bars sweep out without asking the browser to
   lay the rail out again on every frame.

   The resting state is the real share, and the sweep is an animation layered
   over it — deliberately not a transition from zero. A transition only settles
   if it is allowed to finish, and a bar stuck at its start value states that a
   98%-complete series is empty, which is a lie about the data rather than a
   missing flourish. This way the bar is right before any script runs, and the
   animation is decoration that can fail safely. */
.nav .track i{display:block;width:100%;height:100%;background:var(--go);border-radius:3px;
  transform:scaleX(var(--p,0));transform-origin:left center}
.side.ready .nav .track i{animation:sweep .9s var(--ease) both}
@keyframes sweep{from{transform:scaleX(0)}}
.nav.on .track{background:rgba(255,255,255,.14)}
/* All series is the headline figure of the whole page, so it is the one number
   allowed to be big. Everything under it is a detail of it — including
   Complete order, which shares the .all class for its layout but is a row
   count rather than a score and stays at the rail's normal size. */
.nav.all .nm{color:inherit}
.nav.all[data-key="overview"] .n{font-size:22px;letter-spacing:-.01em;color:#fff}
.nav.all[data-key="overview"] .n em{font-size:14px}
.side .sep{height:1px;background:var(--hair);margin:10px 8px}

.main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column}
.tools{flex:none;display:flex;flex-wrap:wrap;gap:10px 16px;align-items:center;justify-content:space-between;
  padding:12px 24px;border-bottom:1px solid var(--hair)}
.filters{display:flex;flex-wrap:wrap;gap:5px}
.filters button{display:inline-flex;align-items:center;gap:9px;border:1px solid var(--hair);background:none;
  color:var(--dim);font-size:14px;font-weight:700;text-transform:uppercase;padding:0 12px;min-height:44px;border-radius:4px;
  cursor:pointer;white-space:nowrap}
.filters button:hover:not(:disabled){border-color:var(--line);color:#fff}
.filters button b{font-variant-numeric:tabular-nums;font-weight:800;color:var(--mute)}
.filters button[aria-pressed="true"]{background:#fff;border-color:#fff;color:#0A0B16}
.filters button[aria-pressed="true"] b{color:rgba(10,11,22,.55)}
.filters button:disabled{opacity:.3;cursor:default}
.find{display:flex;align-items:center;margin-left:auto}
.find input{font:inherit;font-size:14px;font-weight:600;padding:10px 14px;min-height:44px;border-radius:4px;
  border:1px solid var(--hair);background:var(--well);color:#fff;width:300px}
.find input::placeholder{color:var(--dim)}
.find input:focus{outline:2px solid var(--go);outline-offset:1px;border-color:transparent}
.count{font-size:14px;text-transform:uppercase;font-weight:600;color:var(--mute);font-variant-numeric:tabular-nums;white-space:nowrap;margin-left:auto}

/* ---- panes ---- */
.pane{position:relative;flex:1 1 auto;min-height:0;overflow-y:auto;padding:0 28px 48px}
/* Switching series fades the whole pane once and rises only its furniture. One
   animation covers the list however long it is, so changing to Classic Who
   costs the same as changing to Class. */
.pane.enter{animation:wake .3s var(--ease) both}
.pane.enter .banner,.pane.enter .jump,.pane.enter .card{animation:rise .55s var(--ease) both}
.pane.enter .jump{animation-delay:60ms}
.pane.enter .card{animation-delay:calc(var(--i,0) * 45ms)}
@keyframes wake{from{opacity:0}to{opacity:1}}

/* Dark scrollbars. The default light trough on this ground reads as a seam
   down the side of the list. */
.pane,.side{scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.18) transparent}
.pane::-webkit-scrollbar,.side::-webkit-scrollbar{width:10px}
.pane::-webkit-scrollbar-thumb,.side::-webkit-scrollbar-thumb{
  background:rgba(255,255,255,.16);border-radius:10px;border:3px solid transparent;background-clip:content-box}
.pane::-webkit-scrollbar-thumb:hover,.side::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,.3);background-clip:content-box}
.pane::-webkit-scrollbar-track,.side::-webkit-scrollbar-track{background:transparent}

/* season strip: sticky, and each number carries how complete that season is */
.jump{position:sticky;top:0;z-index:7;display:flex;flex-wrap:wrap;gap:3px;padding:12px 0 10px;
  background:var(--bg);border-bottom:1px solid var(--hair)}
.jump button{border:1px solid var(--hair);background:none;color:var(--dim);font-size:14px;font-weight:700;
  min-width:44px;min-height:44px;padding:0 8px;border-radius:4px;cursor:pointer;font-variant-numeric:tabular-nums}
.jump button:hover{border-color:#fff;color:#fff}
.jump button.full{border-color:rgba(27,195,140,.45);color:var(--go)}
.jump button.none{border-color:rgba(227,72,5,.4);color:var(--miss)}
.jump button.part{border-color:rgba(227,165,5,.4);color:var(--warn)}

/* season heading with its own tally, so a season's state reads without scrolling it */
.grp{display:flex;align-items:baseline;gap:18px;flex-wrap:wrap;position:sticky;top:calc(var(--jump,0px) + var(--head,0px));z-index:5;scroll-margin-top:calc(var(--jump,0px) + var(--head,0px));
  background:var(--bg);padding:28px 0 10px}
.grp h2{font-size:22px;font-weight:800;margin:0;letter-spacing:-.01em}
.grp .c{font-size:14px;text-transform:uppercase;font-weight:600;color:var(--mute);font-variant-numeric:tabular-nums}
.grp .sum{display:flex;gap:6px;margin-left:auto}
.grp .sum i{font-style:normal;font-size:14px;text-transform:uppercase;font-weight:700;padding:3px 9px;
  border-radius:4px;font-variant-numeric:tabular-nums;background:rgba(255,255,255,.06);color:var(--mute)}
/* Same rule as the rows: a complete tally is unfilled, so the one short count
   in a season heading is what the eye lands on. */
.grp .sum i.y{background:none;color:rgba(255,255,255,.3);box-shadow:inset 0 0 0 1px rgba(255,255,255,.07)}
.grp .sum i.p{background:var(--warn-bg);color:var(--warn)}
.grp .sum i.n{background:var(--miss-bg);color:var(--miss)}

/* ---- one episode: a single dense row ---- */
/* ---- the episode list, as a table ----
   Seven columns, one track list, used by the header and by every row so a
   value cannot drift away from the heading that names it.

   The thumbnail sits inside the episode cell rather than holding a column of
   its own. That was the change that made this fit: the working column is about
   1000px once the rail takes its 272, and eight tracks left the description
   resolving to nothing. Seven fit, with the description the widest of them,
   because the description is the part somebody is actually reading.

   The header stays on screen down to 900px, which is the point below which
   seven columns stop being legible at all and the row becomes a stacked card
   instead. */
.pane{--cols:46px minmax(230px,1.3fr) minmax(200px,1.6fr) 124px 168px 86px}
/* Three things stay on screen while the list scrolls, stacked in this order:
   the season strip, then these column titles, then the heading of whichever
   season you are inside. Each one is offset by the height of the ones above
   it, measured in script because the strip wraps to two lines on the long
   series and a hard-coded offset would be wrong on exactly those. */
.ephead{display:grid;gap:0 12px;align-items:end;grid-template-columns:var(--cols);
  padding:9px 14px 7px 15px;border-bottom:1px solid var(--line);
  position:sticky;top:var(--jump,0px);z-index:6;background:var(--bg);
  font-size:12.5px;font-weight:700;color:var(--mute)}
.ephead span:last-child{text-align:center}
.ep{display:grid;gap:0 12px;align-items:center;padding:9px 14px 9px 12px;
  border-bottom:1px solid var(--hair);border-left:3px solid var(--k-main);
  grid-template-columns:var(--cols)}
.ep:hover{background:var(--row-hover)}
.ep{transition-property:background-color;transition-duration:120ms;transition-timing-function:cubic-bezier(0.2,0,0,1)}
.ep.k-spec{border-left-color:var(--k-spec)}.ep.k-mini{border-left-color:var(--k-mini)}
.ep.k-anim{border-left-color:var(--k-anim)}.ep.k-preq{border-left-color:var(--k-preq)}
.ep.k-gone{border-left-color:var(--k-gone)}
/* The episode cell: thumbnail, then title over file name. */
.idx{font-variant-numeric:tabular-nums;font-weight:800;font-size:15px;color:#fff;line-height:1.1}
.idx span{display:block;font-size:12px;font-weight:700;color:var(--mute)}
.body{min-width:0;display:flex;align-items:center;gap:10px}
.thumb{flex:0 0 auto}
.thumb img{display:block;width:64px;height:36px;object-fit:cover;border-radius:3px;background:var(--panel-2);
  outline:1px solid rgba(255,255,255,.1);outline-offset:-1px}
.thumb .ph{display:block;width:64px;height:36px;border-radius:3px;background:var(--panel);box-shadow:inset 0 0 0 1px var(--hair)}
.who{min-width:0;display:flex;flex-direction:column;gap:1px}
/* Two lines by default and the whole thing on demand. At this column width a
   summary runs to five lines, so every one of the 1,085 of them was showing
   about its first two sentences' worth of nothing: a teaser, not a summary.
   Clicking the row opens it; hovering shows it in the native tooltip. The text
   is in the DOM either way, so a screen reader always reads all of it. */
.desc{min-width:0;font-size:13px;line-height:1.4;color:var(--dim);cursor:zoom-in;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ep.open{align-items:start}
.ep.open .desc{-webkit-line-clamp:unset;cursor:zoom-out}
.ep.open .t{white-space:normal}
.desc:empty::before,.cell:empty::before{content:'—';color:var(--mute);opacity:.45}
.cell{min-width:0;font-size:12.5px;font-weight:700;line-height:1.3;
  font-variant-numeric:tabular-nums;overflow:hidden}
.cell.c-have{letter-spacing:.01em}
.cell.c-found{font-weight:500;color:var(--mute)}
.cell .when{display:block;font-size:11.5px;font-weight:500;color:var(--mute);opacity:.8}
.t{font-size:14.5px;font-weight:700;margin:0;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.t a:hover{color:var(--go)}
.thumb a:hover img{outline-color:var(--go)}
.t .kind{font-size:14px;text-transform:uppercase;font-weight:600;color:var(--mute);margin-left:10px}
.t .why{font-weight:700;font-size:14px;text-transform:uppercase;color:var(--miss);margin-left:10px}
/* A telesnap-only episode is a permanent fact of the archive rather than a job
   on the list — no download will ever fix it — so it states itself quietly and
   leaves the loud colour to the gaps that can still be closed. */
.t .why.recon{color:rgba(255,255,255,.42)}
.meta{margin:0;font-size:11.5px;font-weight:500;color:var(--mute);display:flex;gap:10px;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.meta code{font:inherit;text-transform:none;font-weight:500}
/* Three per row, so roughly two thousand of them on Classic Who. A present
   asset is dim and unfilled and a missing one keeps its fill: scanning the
   column for red finds the gaps immediately, which is the only reason anyone
   opens this page. */
/* One letter each, not the words: "video still subs" spelled out cost 172px of
   a 1000px row, which is the description's space, and the column heading above
   them already says what they are. */
.pips{display:flex;gap:3px;justify-content:center}
.pips i{font-style:normal;font-size:11px;text-transform:uppercase;font-weight:800;
  width:22px;line-height:20px;text-align:center;border-radius:4px;padding:0}
.pips i.y{background:none;color:rgba(255,255,255,.52);box-shadow:inset 0 0 0 1px rgba(255,255,255,.07)}
.pips i.n{background:var(--miss-bg);color:var(--miss)}
.pips i.u{background:rgba(255,255,255,.06);color:var(--mute)}
.ep:hover .pips i.y{color:var(--go);box-shadow:inset 0 0 0 1px rgba(27,195,140,.3)}
.q{display:contents}
.q .held{font-size:12.5px;font-weight:800;font-variant-numeric:tabular-nums}
/* Same rule on the quality column: at the best worth getting is quiet, short
   of it speaks.
   Below best is dimmed against the red of a missing file, because a file we do
   not have is a harder problem than a file that could be sharper, and on
   Classic Who 553 rows are below best against 15 with no video. */
.q .held.ok{color:rgba(255,255,255,.45)}
.q .held.below,.q .held.cadence{color:rgba(227,165,5,.72)}
.q .held.upscale{color:#7fb0e0}.q .held.missing{color:var(--miss)}
.ep:hover .q .held.ok{color:var(--go)}
.q .best{font-size:12.5px;font-weight:500;color:var(--mute);white-space:nowrap}
/* The best copy worth getting, and when that was last checked. Dimmer than
   the held line because it is a target rather than a state. */
.q .found{font-size:12.5px;font-weight:500;color:rgba(255,255,255,.34);white-space:nowrap}
.q .found.dim{color:rgba(255,255,255,.22)}
/* Amber where the indexers have never been asked about this row. That is the
   standing invitation to look, and the one amber thing in the column. */
.q .c-found.hunt{color:var(--warn)}

/* ---- overview cards ---- */
.cards{display:grid;gap:18px;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));padding:24px 0 8px}
.card{position:relative;border-radius:24px;overflow:hidden;background:var(--panel);min-height:236px;display:flex;
  align-items:flex-end;cursor:pointer;color:inherit}
.card::after,.banner::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.1)}
.card:hover::after{box-shadow:inset 0 0 0 1px var(--line)}
/* The two surfaces that sit over the starfield carry the landing page's one
   shadow, so they read as lifted off the ground rather than cut into it. */
.card:hover{box-shadow:var(--lift)}
.card .bg{transition-property:scale;transition-duration:400ms;transition-timing-function:cubic-bezier(0.2,0,0,1)}
.card:hover .bg{scale:1.03}
.card .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.card .veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,14,32,.1) 0%,rgba(10,14,32,.94) 68%)}
.card .in{position:relative;padding:20px;display:flex;flex-direction:column;gap:12px;width:100%}
.card .logo2{max-width:200px;max-height:50px;object-fit:contain;object-position:left bottom;display:block}
.card h3{margin:0;font-size:22px;font-weight:800;letter-spacing:-.01em}
.card .trio{display:flex;gap:6px;flex-wrap:wrap}
.card .trio i{font-style:normal;font-size:14px;text-transform:uppercase;font-weight:700;padding:5px 11px;border-radius:4px;
  font-variant-numeric:tabular-nums;background:rgba(255,255,255,.08);color:rgba(255,255,255,.75)}
/* A finished series says so once, in the line underneath, and its chips stay
   quiet. The cards that still owe something are the ones carrying colour. */
.card .trio i.y{background:none;color:rgba(255,255,255,.42);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)}
.card .trio i.p{background:var(--warn-bg);color:var(--warn)}
.card .trio i.n{background:var(--miss-bg);color:var(--miss)}
.card .gap{margin:0;font-size:14px;text-transform:uppercase;font-weight:600;color:var(--dim)}

/* ---- series banner ---- */
.banner{position:relative;border-radius:24px;overflow:hidden;margin:20px 0 6px;background:var(--panel);
  min-height:200px;display:flex;align-items:flex-end;box-shadow:var(--lift)}
.banner .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 32%}
.banner .veil{position:absolute;inset:0;background:linear-gradient(90deg,rgba(10,14,32,.94) 0%,rgba(10,14,32,.78) 50%,rgba(10,14,32,.3) 100%)}
.banner .in{position:relative;display:flex;gap:22px;align-items:flex-end;padding:22px;width:100%}
.banner .poster{width:88px;height:132px;object-fit:cover;border-radius:2px;flex:none;
  outline:1px solid rgba(255,255,255,.1);outline-offset:-1px}
.banner .txt{min-width:0;display:flex;flex-direction:column;gap:9px;flex:1}
.banner .logo2{max-width:240px;max-height:58px;object-fit:contain;object-position:left bottom;display:block}
.banner h2{margin:0;font-size:26px;font-weight:800;letter-spacing:-.015em}
.banner p{margin:0;font-size:15px;color:rgba(255,255,255,.78);max-width:96ch;text-wrap:pretty}
.banner .facts{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:14px;text-transform:uppercase;font-weight:600;color:var(--dim)}
.banner .facts code{font:inherit;text-transform:none;font-weight:600}

/* ---- motion ----
   Two speeds. Anything you touch answers in 120ms and names the properties it
   changes; anything that enters uses the landing page's rise at 700ms. Presses
   scale to 0.96. Nothing loops except the status dot. */
.nav,.filters button,.jump button,.card,.t a,.thumb img,.find input,.card::after,.pips i,.q .held{
  transition-property:color,background-color,border-color,outline-color,box-shadow,scale;
  transition-duration:120ms;transition-timing-function:cubic-bezier(0.2,0,0,1)}
.filters button:active:not(:disabled),.jump button:active,.card:active{scale:.96}
:is(.nav,.filters button,.jump button,.card,.t a,.thumb a):focus-visible{outline:2px solid var(--go);outline-offset:2px}
.thumb a:focus-visible{border-radius:3px}
/* Reduced motion keeps every colour and opacity change and drops the movement,
   including the looping dot and the bars that sweep out in the rail. */
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{transition-duration:0.01ms !important;animation-duration:0.01ms !important;
    animation-iteration-count:1 !important}
  .rise,.pane.enter,.pane.enter *{animation:none !important}
  .side.ready .nav .track i{animation:none}
  .state i{animation:none}
}
.hide,[hidden]{display:none !important}
.none{padding:56px 0;color:var(--mute);font-size:16px;text-align:center}

/* Under this width eight columns stop being columns and start being slivers.
   The description drops to its own row spanning the width, and the three
   quality facts share a line, each still labelled by its own prefix. */
/* Between 1180 and 900 the columns narrow rather than drop. With two quality
   facts instead of three there is nothing left that can be spared without
   losing something the row exists to say. */
@media (max-width:1180px){
  .pane{--cols:40px minmax(190px,1.25fr) minmax(165px,1.4fr) 108px 146px 76px}
}
/* Below 900 seven columns are slivers, so the row becomes a card: everything
   still shown, nothing truncated, each quality fact carrying its own label
   because there is no longer a heading above it to do that job. */
@media (max-width:1000px){
  .pane{--cols:none}
  .ephead{display:none}
  .ep{grid-template-columns:46px minmax(0,1fr) auto;
    grid-template-areas:"idx body pips" "idx desc desc" "idx q q";
    align-items:start;row-gap:4px;padding:12px 14px 12px 12px}
  .idx{grid-area:idx}.body{grid-area:body}.pips{grid-area:pips;justify-content:flex-end}
  .desc{grid-area:desc;-webkit-line-clamp:4}
  .q{grid-area:q;display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 14px}
  /* Room to wrap. In the column layout this line is clipped to one row, which
     is right when it holds a file name; in the card layout it also carries the
     note saying why an episode has no video, and truncating that on a phone
     throws away the only explanation on offer. */
  .meta{white-space:normal;overflow:visible;flex-wrap:wrap}
  .ep .cell{overflow:visible;display:block}
  .ep .cell.c-have::before{content:'held: ';color:var(--mute);font-weight:500}
  .ep .cell.c-found::before{content:'best found: ';color:var(--mute);font-weight:500}
  .ep .cell .when{display:inline;margin-left:6px}
}
@media (max-width:820px){
  .shell{flex-direction:column}
  .side{width:auto;flex-direction:row;overflow-x:auto;gap:6px;padding:10px 12px;border-right:0;border-bottom:1px solid var(--hair)}
  .side h4,.side .sep{display:none}
  .nav{grid-template-columns:1fr;gap:4px;min-width:150px}
  .nav .n{grid-column:1;grid-row:auto}
  .ep{grid-template-columns:minmax(0,1fr);grid-template-areas:"body" "pips" "q"}
  .thumb,.idx{display:none}
  .head-row,.tools,.pane{padding-left:16px;padding-right:16px}
  .head-row{flex-wrap:wrap;gap:14px}.find{order:3;width:100%;margin:0}.find input{width:100%}
  /* The banner stacks here, and its veil has to stack with it. The wide layout
     darkens from the left because the text sits in the left half; once the
     poster and the prose are above one another the same gradient leaves the
     description lying on the brightest part of the artwork. */
  .banner{min-height:0}
  .banner .in{flex-direction:column;align-items:flex-start;gap:14px;padding:18px}
  .banner .veil{background:linear-gradient(180deg,rgba(10,14,32,.55) 0%,rgba(10,14,32,.92) 46%,rgba(10,14,32,.97) 100%)}
  .banner .poster{width:64px;height:96px}
  .banner .logo2{max-width:180px;max-height:44px}
  .banner h2{font-size:22px}
  .banner p{font-size:14px}
}
"""

JS = """
var navs    = Array.prototype.slice.call(document.querySelectorAll('.nav'));
var panes   = Array.prototype.slice.call(document.querySelectorAll('.pane'));
var filters = Array.prototype.slice.call(document.querySelectorAll('#filters button'));
var box     = document.getElementById('q');
var count   = document.getElementById('count');
var want    = '';

function pane(){ return panes.filter(function(p){ return !p.hidden; })[0]; }
function passes(el){ return !want || (' ' + el.dataset.f + ' ').indexOf(' ' + want + ' ') !== -1; }

function apply(){
  var p = pane(); if (!p) return;
  var q = box.value.trim().toLowerCase();
  var rows = p.querySelectorAll('.ep'), shown = 0;
  for (var i = 0; i < rows.length; i++){
    var ok = passes(rows[i]) && (q === '' || rows[i].dataset.s.indexOf(q) !== -1);
    rows[i].classList.toggle('hide', !ok); if (ok) shown++;
  }
  var groups = p.querySelectorAll('.grp');
  for (var g = 0; g < groups.length; g++){
    var n = 0, el = groups[g].nextElementSibling;
    while (el && el.classList.contains('ep')){ if (!el.classList.contains('hide')) n++; el = el.nextElementSibling; }
    groups[g].classList.toggle('hide', n === 0);
    var c = groups[g].querySelector('.c'); if (c) c.textContent = n + (n === 1 ? ' episode' : ' episodes');
  }
  var empty = p.querySelector('.none'); if (empty) empty.classList.toggle('hide', shown !== 0);
  var cards = p.querySelectorAll('.card').length;
  count.textContent = cards ? cards + ' series' : shown + (shown === 1 ? ' episode' : ' episodes');
  tally();
}

/* The size of each filter, for the pane in view, printed on its button. */
function tally(){
  var p = pane(); if (!p) return;
  var rows = p.querySelectorAll('.ep'), n = { '': rows.length };
  for (var i = 0; i < rows.length; i++){
    var f = (rows[i].dataset.f || '').split(' ');
    for (var j = 0; j < f.length; j++) n[f[j]] = (n[f[j]] || 0) + 1;
  }
  filters.forEach(function(b){ var v = n[b.dataset.w] || 0; b.querySelector('b').textContent = v; b.disabled = b.dataset.w !== '' && v === 0; });
}

function select(key){
  if (!panes.some(function(p){ return p.dataset.key === key; })) key = 'overview';
  navs.forEach(function(t){ t.classList.toggle('on', t.dataset.key === key); });
  panes.forEach(function(p){ p.hidden = p.dataset.key !== key; });
  var p = pane(); if (p) p.scrollTop = 0;
  /* The state filters act on episode rows; the overview has none. */
  document.getElementById('filters').hidden = (key === 'overview');
  if (location.hash.slice(1) !== key) history.replaceState(null, '', '#' + key);
  if (p) measure(p);
  /* Replay the entrance. Removing the class and reading offsetWidth forces the
     style change to land before it is added back, which is what restarts a CSS
     animation that has already finished. */
  if (p){ p.classList.remove('enter'); void p.offsetWidth; p.classList.add('enter'); }
  apply();
}
filters.forEach(function(b){ b.addEventListener('click', function(){
  want = b.dataset.w; filters.forEach(function(x){ x.setAttribute('aria-pressed', String(x === b)); }); apply(); }); });

/* Searching from the overview means searching everything, so move to the
   complete order, which holds every episode of every series. */
box.addEventListener('input', function(){
  var p = pane();
  if (p && p.dataset.key === 'overview' && box.value.trim()) select('all-who');
  else apply();
});

/* How much of the pane the sticky furniture covers. Read rather than assumed:
   the season strip wraps to two lines on Classic Who and to one on Class, and
   the column titles are what the season headings have to clear. */
function measure(p){
  var j = p.querySelector('.jump');
  var h = p.querySelector('.ephead');
  p.style.setProperty('--jump', (j ? j.offsetHeight : 0) + 'px');
  p.style.setProperty('--head', (h ? h.offsetHeight : 0) + 'px');
}
window.addEventListener('resize', function(){ var p = pane(); if (p) measure(p); });

/* The season strip scrolls to that heading.

   scrollIntoView cannot do this: the headings are sticky, so once one is stuck
   to the top the browser reads its position as already in view and scrolling
   up to it does nothing. That is why the buttons only ever went down. Work out
   where the heading sits in the scrolled content instead — its offset from the
   pane's own top, less the furniture above it — and scroll there directly,
   which is a position and so works in both directions. */
document.addEventListener('click', function(e){
  var b = e.target.closest && e.target.closest('.jump button');
  if (!b) return;
  var p = pane(); if (!p) return;
  measure(p);
  var heads = p.querySelectorAll('.grp h2');
  for (var i = 0; i < heads.length; i++){
    if (heads[i].textContent.trim() !== b.dataset.go) continue;
    var grp = heads[i].parentNode;
    var cover = (parseFloat(getComputedStyle(p).getPropertyValue('--jump')) || 0)
              + (parseFloat(getComputedStyle(p).getPropertyValue('--head')) || 0);
    /* Measure the first row of the season, not the heading. The heading is
       sticky, and a stuck element reports its stuck position rather than where
       it sits in the content, so reading it gave a target a few pixels from
       wherever you already were. The row below it is never sticky and is
       honest. Scroll so that row clears the furniture and the heading's own
       height, which puts the heading immediately under the column titles. */
    var row = grp.nextElementSibling;
    while (row && !row.classList.contains('ep')) row = row.nextElementSibling;
    var anchor = row || grp;
    /* Measure, scroll, measure again. One pass lands short going downwards
       because rows below the fold settle as they come into view and move the
       target after it was read. Correcting twice costs nothing and puts the
       heading where it was asked for either way. */
    var settleTo = function(tries){
      var delta = anchor.getBoundingClientRect().top - p.getBoundingClientRect().top;
      var want = p.scrollTop + delta - cover - grp.offsetHeight;
      want = Math.max(0, Math.min(want, p.scrollHeight - p.clientHeight));
      if (Math.abs(want - p.scrollTop) < 2 || tries <= 0) return;
      p.scrollTop = want;
      requestAnimationFrame(function(){ settleTo(tries - 1); });
    };
    settleTo(4);
    return;
  }
});

/* Click a row to read its whole summary. Delegated, so it costs one listener
   rather than 1,093, and a click on the episode link still opens the file. */
document.addEventListener('click', function(e){
  if (e.target.closest('a,button')) return;
  var row = e.target.closest && e.target.closest('.ep');
  if (row) row.classList.toggle('open');
});

document.addEventListener('keydown', function(e){
  if (e.key === '/' && document.activeElement !== box){ e.preventDefault(); box.focus(); }
  if (e.key === 'Escape' && document.activeElement === box){ box.value = ''; apply(); }
});

select(location.hash.slice(1) || 'overview');
window.addEventListener('hashchange', function(){ select(location.hash.slice(1) || 'overview'); });

/* A still that is already in the cache never fires load, so mark those done
   now or they sit at opacity 0 forever. The same guard the landing page uses. */
function settle(root){
  (root || document).querySelectorAll('img.fade').forEach(function(i){
    if (i.complete && i.naturalWidth) { i.classList.add('ok'); return; }
    /* An error counts as settled too. A still that 404s should leave its empty
       frame behind rather than a permanently invisible box. */
    i.addEventListener('load', function(){ i.classList.add('ok'); }, { once: true });
    i.addEventListener('error', function(){ i.classList.add('ok'); }, { once: true });
  });
}
settle();

/* The rail's bars start flat and sweep out to their real share once the first
   frame is on screen. */
requestAnimationFrame(function(){
  requestAnimationFrame(function(){ document.querySelector('.side').classList.add('ready'); });
});

/* ---------------- starfield ----------------
   The landing page's field, at roughly half the brightness because this page
   puts small text over it. Drawn on a canvas rather than styled for the reason
   recorded there: Firefox rounds a composited layer's offset to whole pixels,
   so a slow CSS drift steps about once a second instead of moving. A canvas
   takes fractional coordinates everywhere.

   Nothing here reads the scroll position. The panes scroll inside themselves,
   so the field belongs to the window and simply drifts. */
(function(){
  var cv = document.querySelector('canvas.stars');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d', { alpha: true });
  var still = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* Deterministic, so the sky is identical on every build and every load. */
  var seed = 20260914;
  function rnd(){ seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

  var BANDS = [
    { n: 90, speed: 2.2, wrap: 900,  r: [0.5, 1.0], a: [0.16, 0.40], hue: '255,255,255' },
    { n: 42, speed: 5.0, wrap: 1300, r: [0.7, 1.2], a: [0.14, 0.34], hue: '198,220,255' },
    { n: 18, speed: 9.5, wrap: 1800, r: [0.9, 1.6], a: [0.14, 0.32], hue: '255,238,214' }
  ];
  var stars = [];
  BANDS.forEach(function(b, bi){
    for (var i = 0; i < b.n; i++)
      stars.push({ b: bi, x: rnd(), y: rnd() * b.wrap,
                   r: b.r[0] + rnd() * (b.r[1] - b.r[0]),
                   a: b.a[0] + rnd() * (b.a[1] - b.a[0]),
                   ph: rnd() * Math.PI * 2, sp: 0.5 + rnd() * 1.1,
                   speed: b.speed / 1000 });
  });

  var w = 0, h = 0, dpr = 1;
  function size(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = cv.clientWidth; h = cv.clientHeight;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw(t){
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < stars.length; i++){
      var s = stars[i], b = BANDS[s.b];
      var y = s.y - (still ? 0 : t * s.speed);
      y = y % b.wrap; if (y < 0) y += b.wrap;
      if (y > h) continue;
      ctx.globalAlpha = still ? s.a : s.a * (0.72 + 0.28 * Math.sin(t * 0.0011 * s.sp + s.ph));
      ctx.fillStyle = 'rgb(' + b.hue + ')';
      ctx.beginPath(); ctx.arc(s.x * w, y, s.r, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  var running = true, raf = 0;
  function frame(t){ if (!running) return; draw(t); raf = requestAnimationFrame(frame); }
  size();
  if (still) draw(0);
  else {
    raf = requestAnimationFrame(frame);
    /* Nothing to animate while the tab is in the background. */
    document.addEventListener('visibilitychange', function(){
      if (document.hidden){ running = false; cancelAnimationFrame(raf); }
      else if (!running){ running = true; raf = requestAnimationFrame(frame); }
    });
  }
  var rt;
  window.addEventListener('resize', function(){
    clearTimeout(rt); rt = setTimeout(function(){ size(); if (still) draw(0); }, 150);
  });
})();
"""


def esc(s):
    return html.escape(str(s), quote=True)


def render():
    tabs, series, allwho = build.load()
    errs = build.validate(tabs, series, allwho)
    if errs:
        sys.exit('ledger does not check out, run build.py to see why')
    build.number(tabs, series)
    tabs = [t for t in tabs if t['key'] in series]

    by_tab = {t['key']: t for t in tabs}
    lookup = {}
    for t in tabs:
        for r in series[t['key']]:
            lookup[(t['key'], r['season'], r['category'], r['title'])] = r
    running, all_rows = {}, []
    for a in allwho:
        src = lookup[(a['series'], a['season'], a['category'], a['title'])]
        key = (a['series'], a['season'])
        if a['season'] != '-' and key not in running:
            running[key] = len(running) + 1
        row = dict(src)
        row['sn'] = running.get(key) if a['season'] != '-' else None
        row['from'] = by_tab[a['series']]['name'].replace(' ✅', '')
        row['from_key'] = a['series']
        row['from_folder'] = by_tab[a['series']].get('folder')
        all_rows.append(row)

    views = []
    for t in tabs:
        rows = [dict(r, sn=(None if r['season'] == '-' else int(r['season']))) for r in series[t['key']]]
        views.append((t['key'], t['name'].replace(' ✅', ''), t, rows, False))
    views.append(('all-who', 'Complete order',
                  dict(key='all-who', name='Complete order', numbered=True, cats=build.CATEGORY_ORDER),
                  all_rows, True))

    def fname(tab, r):
        if r.get('ep') is None:
            return ''
        text = build.cell_text(r)
        return (build.slug(text) if not tab['numbered']
                else 'S%02d_E%02d_%s' % (int(r['season']), r['ep'], build.slug(text)))

    def assets(folder, r, fn):
        return episode_assets(folder, r['season'], fn) if fn else {}

    def tally_rows(folder, tab, rows):
        t = {'video': [0, 0], 'still': [0, 0], 'subs': [0, 0]}
        for r in rows:
            fn = fname(tab, r)
            if not fn:
                continue
            a = assets(folder, r, fn)
            for k in t:
                t[k][1] += 1
                if a.get(k):
                    t[k][0] += 1
        return t

    def recon(r):
        """Does anything of this wiped episode survive to watch?

        Every Classic episode the BBC junked still has John Cura's telesnaps and
        an off-air soundtrack, and those cut together into a watchable
        reconstruction, so calling those rows "no source" was simply wrong. The
        rows that really have nothing are New Who's: the thirteen Tardisodes,
        which exist only as AI-upscaled fan uploads, and Attack of the Graske,
        which was interactive and has no linear version at all.

        The best-found column already carries the distinction and is the one
        place it is stated, so read it there rather than keeping a second list
        in step by hand. A value that opens with "none" means nothing survives;
        anything else names what does.
        """
        return not (r.get('best') or '').lower().startswith('none')

    def survives(r):
        """What a wiped episode left behind, for the badge on its row. Mission
        to the Unknown is the one that has stills rather than telesnaps."""
        return 'telesnaps' if 'telesnap' in (r.get('best') or '').lower() else 'stills'

    def trio(t):
        out = []
        for k, lab in (('video', 'video'), ('still', 'stills'), ('subs', 'subs')):
            got, tot = t[k]
            cls = 'y' if tot and got == tot else ('n' if got == 0 else 'p')
            out.append('<i class="%s">%s %d/%d</i>' % (cls, lab, got, tot))
        return ''.join(out)

    # ------------------------------------------------------------ overview
    cards = []
    for k, n, t, rows, is_all in views:
        if is_all:
            continue
        bg, lo = art(t.get('folder'), 'background'), art(t.get('folder'), 'logo')
        tl = tally_rows(t.get('folder'), t, rows)
        wiped = [r for r in rows if r['status'] == 'missing']
        recons = sum(1 for r in wiped if recon(r))
        gone = len(wiped) - recons
        below = sum(1 for r in rows if build.quality(r, k)[0] != 'ok' and r['status'] != 'missing')
        miss_v = tl['video'][1] - tl['video'][0]
        gap = ('%d not in the bucket' % miss_v if miss_v else 'everything in the bucket')
        if below:
            gap += ' &middot; %d below best' % below
        if recons:
            gap += ' &middot; %d telesnaps only' % recons
        if gone:
            gap += ' &middot; %d with no source' % gone
        cards.append(
            '<a class="card" data-key="%s" href="#%s" style="--i:%d">%s<div class="veil"></div><div class="in">%s'
            '<div class="trio">%s</div><p class="gap">%s</p></div></a>'
            % (k, k, len(cards), ('<img class="bg fade" alt="" loading="lazy" src="%s">' % bg) if bg else '',
               ('<img class="logo2 fade" alt="%s" loading="lazy" src="%s">' % (esc(n), lo)) if lo else '<h3>%s</h3>' % esc(n),
               trio(tl), gap))
    overview = ('<div class="pane" data-key="overview"><div class="cards">%s</div>'
                '<p class="none hide">Nothing matches.</p></div>' % ''.join(cards))

    # --------------------------------------------------------------- panes
    parts = [overview]
    for key, name, tab, rows, is_all in views:
        chunks = []
        if not is_all:
            bg, po, lo = (art(tab.get('folder'), k) for k in ('background', 'poster', 'logo'))
            facts = []
            if tab.get('release_info'):
                facts.append('<span>%s</span>' % esc(tab['release_info']))
            g = tab.get('genres')
            if g:
                facts.append('<span>%s</span>' % (' &middot; '.join(esc(x) for x in g) if isinstance(g, (list, tuple)) else esc(g)))
            if tab.get('stremio_id'):
                facts.append('<code>%s</code>' % esc(tab['stremio_id']))
            # No series banner. It was 236px of poster and blurb above every
            # list, which is a page's worth of furniture on a tool whose whole
            # job is the rows underneath it: the rail already names the series
            # and counts it, so the banner repeated what was on screen and
            # pushed the episodes below the fold on every visit.

            # season strip, each number coloured by how complete that season is
            per = {}
            order = []
            for r in rows:
                lab = 'Season %s' % r['season'] if r['season'] != '-' else 'Films'
                if lab not in per:
                    per[lab] = []
                    order.append(lab)
                per[lab].append(r)
            if len(order) > 2:
                btns = []
                for lab in order:
                    tl = tally_rows(tab.get('folder'), tab, per[lab])
                    got, tot = tl['video']
                    cls = 'full' if tot and got == tot else ('none' if got == 0 else 'part')
                    btns.append('<button class="%s" data-go="%s" title="%d of %d in the bucket">%s</button>'
                                % (cls, esc(lab), got, tot, esc(lab.replace('Season ', ''))))
                chunks.append('<div class="jump">%s</div>' % ''.join(btns))

        # Column titles, immediately after the season strip and before the
        # first row. Order in the DOM is what makes the two stick one under the
        # other rather than on top of each other: the header used to sit above
        # the strip, so scrolling hid it behind the season buttons and left the
        # list running on with nothing naming its columns.
        chunks.append(
            '<div class="ephead"><span>#</span><span>Episode</span>'
            '<span>Description</span><span>Held</span><span>Best found</span>'
            '<span>Files</span></div>')

        group = None
        for r in rows:
            gone = r['status'] == 'missing'
            kind = 'gone' if gone else KIND[r['category']]
            folder = r.get('from_folder') if is_all else tab.get('folder')
            label = r['from'] if is_all else ('Season %s' % r['season'] if r['season'] != '-' else 'Films')
            if label != group:
                group = label
                # the season's own tally sits in its heading
                grp_rows = [x for x in rows if (x.get('from') if is_all else
                            ('Season %s' % x['season'] if x['season'] != '-' else 'Films')) == label]
                tl = tally_rows(folder, tab if not is_all else by_tab.get(r.get('from_key'), tab), grp_rows)
                chunks.append('<div class="grp"><h2>%s</h2><span class="c"></span>%s</div>'
                              % (esc(label), '' if is_all else '<span class="sum">%s</span>' % trio(tl)))

            fn = fname(tab if not is_all else by_tab.get(r.get('from_key'), tab), r)
            status, why = build.quality(r, r.get('from_key') or tab['key'])
            got = r.get('have') or ''
            a = assets(folder, r, fn)
            search = ' '.join([str(r['title']), r['category'], fn, r.get('from') or '',
                               r['note'] or '', r.get('best') or '', got or 'nothing held', status]).lower()

            img = still(folder, r['season'], fn) if not is_all else ''
            cls = ['ep', 'k-' + kind] + (['plain'] if is_all else [])
            thumb = '' if is_all else ('<div class="thumb">%s</div>' % (
                ('<a href="%s" target="_blank" rel="noopener"><img class="fade" loading="lazy" decoding="async" width="64" height="36" alt="" src="%s"></a>' % (img, img)) if img else '<span class="ph"></span>'))
            idx = '<div class="idx">%s<span>%s</span></div>' % (
                ('%02d' % r['ep']) if r.get('ep') else '&mdash;',
                ('S%s' % r['sn']) if r['sn'] is not None else '')

            title = esc(r['title'])
            if a.get('video') and folder and fn:
                title = '<a href="%s/%s/season_%s/%s%s" target="_blank" rel="noopener">%s</a>' % (
                    CDN, folder, r['season'], fn, a['ext'], title)
            if gone:
                title += ('<span class="why recon">%s</span>' % survives(r) if recon(r)
                          else '<span class="why">no source</span>')
            kindlabel = ('<span class="kind">%s</span>' % esc(r['category'])) if r['category'] != 'Main Show' else ''
            meta = []
            if is_all:
                meta.append('<span>%s</span>' % esc(r['from']))
            if fn:
                meta.append('<code>%s</code>' % esc(fn))
            if gone and r['note']:
                meta.append('<span>%s</span>' % esc(r['note']))

            pips = ''
            for k2, lab in (('video', 'V'), ('still', 'S'), ('subs', 'T')):
                v = a.get(k2)
                state = 'in the bucket' if v else ('missing' if v is False else 'not known')
                pips += ('<i class="%s" title="%s: %s"><span class="vh">%s %s.</span>'
                         '<span aria-hidden="true">%s</span></i>'
                         % ('y' if v else ('n' if v is False else 'u'),
                            k2, state, k2, state, lab))
            # Two quality facts, read left to right: what we hold, and the
            # best copy worth getting. A third used to name the finest copy in
            # existence, which for most of the catalogue is a disc remux and so
            # a target nobody would ever download; the column spent its width
            # disagreeing with the one beside it.
            worth, why_hunt = build.hunt(r)
            if r.get('best'):
                best_txt = ('%s%s' % (esc(r['best']),
                            ('<span class="when">checked %s</span>' % esc(r['checked']))
                            if r.get('checked')
                            else '<span class="when">never checked</span>'))
            else:
                best_txt = 'never checked'
            # Wrapped, but the wrapper is display:contents in the wide layout so
            # the three cells sit in the grid as their own columns. Stacked, the
            # wrapper becomes a real box and they share one line inside it.
            q = ('<div class="q">'
                 '<div class="cell c-have"><span class="vh">Held: </span>'
                 '<span class="held %s">%s</span></div>'
                 '<div class="cell c-found%s"><span class="vh">Best found: </span>%s</div>'
                 '</div>'
                 % (status, esc(got) or 'nothing held',
                    ' hunt' if worth else '', best_txt))

            bpath = ('%s/season_%s/%s' % (folder, r['season'], fn)) if fn and folder else ''
            flags = ' '.join(filter(None, [
                'has-v' if a.get('video') else 'no-v', 'has-t' if a.get('still') else 'no-t',
                'has-s' if a.get('subs') else 'no-s', 'below' if status != 'ok' else '',
                'hunt' if worth else '', 'unsearched' if not r.get('checked') else '',
                ('recon' if recon(r) else 'gone') if gone else '']))
            chunks.append(
                '<article class="%s" data-s="%s" data-p="%s" data-f="%s" title="%s">%s'
                '<div class="body">%s<div class="who"><h3 class="t">%s%s</h3>'
                '<p class="meta">%s</p></div></div>'
                '<div class="desc" title="%s">%s</div>%s<span class="pips">%s</span></article>'
                % (' '.join(cls), esc(search), esc(bpath), flags, esc(why), idx,
                   thumb, title, kindlabel, ''.join(meta),
                   esc(r.get('description') or ''),
                   esc(r.get('description') or ''), q, pips))
        # Column headings, so a value is read under the name of what it is
        # rather than guessed at from its position.
        parts.append('<div class="pane" data-key="%s" data-folder="%s" hidden>%s'
                     '<p class="none hide">Nothing matches.</p></div>'
                     % (key, esc(tab.get('folder') or ''), ''.join(chunks)))

    # ---------------------------------------------------------------- rail
    def uploaded(t, r):
        fn = fname(t, r)
        return bool(fn and assets(t.get('folder'), r, fn).get('video'))

    total = sum(len(series[t['key']]) for t in tabs)
    held = sum(1 for t in tabs for r in series[t['key']] if uploaded(t, r))
    atbest = sum(1 for t in tabs for r in series[t['key']] if build.quality(r, t['key'])[0] == 'ok')

    # Every bar is written as a share rather than a width, because the CSS
    # scales it out from nothing on load and a transform costs no layout.
    # --i staggers the rail the way the cards stagger on the landing page.
    rail = ['<a class="nav all on rise" data-key="overview" href="#overview" style="--i:0">'
            '<span class="nm">All series</span><span class="n">%d<em>/%d</em></span>'
            '<span class="track"><i style="--p:%.4f"></i></span></a>'
            % (held, total, held / float(max(total, 1))), '<div class="sep"></div>']
    step = 1
    for k, n, t, rows, is_all in views:
        if is_all:
            continue
        up = sum(1 for r in rows if uploaded(t, r))
        rail.append('<a class="nav rise" data-key="%s" href="#%s" style="--i:%d"><span class="nm">%s</span>'
                    '<span class="n">%d<em>/%d</em></span>'
                    '<span class="track"><i style="--p:%.4f"></i></span></a>'
                    % (k, k, step, esc(n), up, len(rows), up / float(max(len(rows), 1))))
        step += 1
    rail.append('<div class="sep"></div>')
    rail.append('<a class="nav all rise" data-key="all-who" href="#all-who" style="--i:%d">'
                '<span class="nm">Complete order</span>'
                '<span class="n">%d</span></a>' % (step, len(all_rows)))

    # ----------------------------------------------------------- the page
    version = '?'
    try:
        import json as _json
        with io.open(os.path.join(HERE, '..', 'package.json'), encoding='utf-8') as fh:
            version = _json.load(fh).get('version', '?')
    except Exception:
        pass
    page = (
        # A real document, not a fragment. With no doctype the browser falls
        # back to quirks mode — this page was rendering in BackCompat, under
        # legacy box-model and line-height rules — and with no lang a screen
        # reader has to guess which language to pronounce 1,093 titles in.
        '<!doctype html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n'
        '<title>Whoniverse Ledger</title>\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
        # Both say "this surface is dark": the first so native scrollbars and
        # form controls are drawn dark instead of light-on-dark, the second so
        # a mobile browser tints its own chrome to match rather than framing
        # the page in white.
        '<meta name="color-scheme" content="dark">\n'
        '<meta name="theme-color" content="#0A0E20">\n'
        '<link rel="icon" type="image/png" href="/art/icon.png">\n'
        '<style>%s</style>\n</head>\n<body>\n'
        '<canvas class="stars" aria-hidden="true"></canvas>\n'
        # Straight to the list. Without it, reaching the episodes by keyboard
        # means tabbing through the whole series rail every time.
        '<a class="skip" href="#list">Skip to the episode list</a>\n'
        '<header class="head"><div class="head-row rise">'
        '<h1 class="vh">Whoniverse Ledger</h1>'
        '<span class="logo"><img src="/art/logo.png" alt="Doctor Who" width="412" height="120"></span>'
        '<div class="find"><input type="search" id="q" placeholder="Search" aria-label="Search"></div>'
        '<span class="state caps"><i></i>Ledger &middot; v%s</span></div><div class="hr"></div></div>\n'
        '<div class="shell"><nav class="side" aria-label="Series">%s</nav>'
        '<main class="main" id="list"><div class="tools rise" style="--d:.15s"><div class="filters" id="filters" hidden>'
        '<button data-w="" aria-pressed="true">Everything<b></b></button>'
        '<button data-w="no-v" aria-pressed="false">No video<b></b></button>'
        '<button data-w="no-t" aria-pressed="false">No still<b></b></button>'
        '<button data-w="no-s" aria-pressed="false">No subtitles<b></b></button>'
        '<button data-w="below" aria-pressed="false">Below best<b></b></button>'
        '<button data-w="hunt" aria-pressed="false">Keep searching<b></b></button>'
        '<button data-w="unsearched" aria-pressed="false">Never searched<b></b></button>'
        '<button data-w="recon" aria-pressed="false">Telesnaps<b></b></button>'
        '<button data-w="gone" aria-pressed="false">No source<b></b></button>'
        '</div><span class="count" id="count"></span></div>\n%s\n</main></div>\n'
        '<script>%s</script>\n</body>\n</html>\n'
    ) % (CSS, esc(version), ''.join(rail), ''.join(parts), JS)

    os.makedirs(OUT, exist_ok=True)
    print('  %d rows across %d views' % (total + len(all_rows), len(views)))
    public = os.path.join(HERE, '..', 'public', 'ledger.html')
    for path in (os.path.join(OUT, 'ledger.html'), public):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w', encoding='utf8', newline='\n') as fh:
            fh.write(page)
        print('  wrote %s (%.0f KB)' % (os.path.relpath(path, os.path.join(HERE, '..')), os.path.getsize(path) / 1024))


if __name__ == '__main__':
    render()
