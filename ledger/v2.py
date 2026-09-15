#!/usr/bin/env python3
"""The ledger, rebuilt. Writes public/ledger-v2.html.

    python ledger/v2.py

Independent of viewer.py: same facts, different instrument. That one is a long
printed table you scroll; this one is a board you read at a glance and then
interrogate.

Three decisions shape it.

**The matrix is the page.** Every episode of a series is one tile, laid out
season by season, coloured by what is wrong with it. Seven hundred and sixteen
Classic Who episodes fit on a screen and a half, so the gaps have a shape — a
whole missing season reads as a bar of red, a patchy one as speckle. The old
page could only tell you that in a counter.

**Nothing is truncated.** Selecting a tile fills a detail panel with the entire
record: the full summary, the three quality facts as a ladder you can see the
rungs of, the files, the note, the name. The old page clipped all 1,085
summaries to two lines out of five, which is a teaser rather than a summary.

**The rows are data, not markup.** The payload is one compact JSON array and
the list renders only the rows in view, so the file is a fraction of the old
one's four megabytes and filtering is instant rather than a walk over 3,000
DOM nodes.

Style follows the Swiss/grid direction: strict columns, hairlines, tabular
numerals, no card kit, and the type doing the work. Its palette suggestion
(indigo and violet) is not used — this catalogue has its own colours and a
generated dashboard palette would make it look like every other dashboard.
"""

import csv
import io
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import build  # noqa: E402  (path is set immediately above)

ROOT = os.path.join(HERE, '..')
OUT = os.path.join(HERE, 'out')
CDN = os.environ.get('WHONIVERSE_CDN', 'https://cdn.nubblyn.com/file/whoniverse')

SERIES_ORDER = [
    ('classic-who', 'Classic Who', 'classic_who', '1963-1989'),
    ('wilderness-years', 'Wilderness Years', 'wilderness_years', '1993-2003'),
    ('new-who', 'New Who', 'new_who', '2005-'),
    ('torchwood', 'Torchwood', 'torchwood', '2006-2011'),
    ('sarah-jane', 'The Sarah Jane Adventures', 'the_sarah_jane_adventures', '2007-2011'),
    ('class', 'Class', 'class', '2016'),
    ('land-and-sea', 'The War Between the Land and the Sea',
     'the_war_between_the_land_and_the_sea', '2025'),
]

CATS = ['Main Show', 'Special', 'Minisode', 'Animated Series', 'Prequel',
        'Animated Restoration', 'Movie']


def bucket_index():
    """Every path in the B2 bucket, from scripts/bucket-index.sh."""
    p = os.path.join(OUT, 'bucket-index.txt')
    if not os.path.exists(p):
        return set()
    return {ln.strip() for ln in io.open(p, encoding='utf8') if ln.strip()}


def subtitle_probe():
    """Episodes whose subtitles are inside the video rather than beside it."""
    p = os.path.join(ROOT, 'data', 'subtitles.json')
    if not os.path.exists(p):
        return {}
    return json.load(io.open(p, encoding='utf8'))


def rank(text):
    """The vertical resolution a quality string means, via build.py's rule.

    This is deliberately a call into the builder rather than a second copy.
    The first version here was its own implementation and got three things
    wrong that build.py already had right: it read "1920x960" as 960 rather
    than as the 1080-class frame it is (Flux and Land and Sea are framed 2:1,
    so the letterbox is baked out, not missing), it matched only "1080p" and
    never "1080i", so 42 Torchwood ceilings came back as zero, and it did not
    know "SD" at all. Those are the kind of mistakes a duplicated rule makes
    quietly, so there is now one rule and this defers to it.
    """
    return build._height(text) or 0


def state_of(row, assets):
    """One word for what is wrong with this episode, or 'ok'.

    Two of these are jobs and the rest are facts, which is the distinction the
    page is built around:

    absent   a copy exists and is not in the bucket          — a job
    upgrade  a better copy is worth getting and is not held  — a job
    recon    the film is wiped; what is held is a reconstruction
    gone     nothing survives and nothing is held
    ok       held, at the best worth getting

    There used to be a sixth, `blocked`: short of a "ceiling" recording the
    finest copy in existence anywhere. It covered 523 rows and not one of them
    was actionable, because those ceilings are disc remuxes and everything here
    is re-encoded for streaming before it ships. One target now, and it is the
    one worth downloading rather than the one that would win an argument.
    """
    if row['status'] == 'missing':
        # A wiped episode usually still has a reconstruction — telesnaps cut to
        # the surviving soundtrack — and 42 of those are held. Calling that "no
        # source" filed a copy we have beside one that does not exist, and the
        # row gave it away by reporting a resolution for it.
        return 'recon' if assets['video'] else 'gone'
    if not assets['video']:
        return 'absent'
    got, best = rank(row.get('have')), rank(row.get('best'))
    if best and got and best > got:
        return 'upgrade'
    return 'ok'


def build_rows():
    names = os.path.join(OUT, 'file-names.tsv')
    bucket, probe = bucket_index(), subtitle_probe()
    by_series = {k: [] for k, _, _, _ in SERIES_ORDER}
    folders = {k: f for k, _, f, _ in SERIES_ORDER}

    for r in csv.DictReader(io.open(names, encoding='utf8'), delimiter='\t'):
        key = r['series']
        if key not in by_series:
            continue
        folder, fn = folders[key], r.get('file_name') or ''
        base = '%s/season_%s/%s' % (folder, r['season'], fn) if fn else ''
        video = still = subs = False
        ext = ''
        if base:
            for e in ('.mp4', '.mkv', '.m4v'):
                if base + e in bucket:
                    video, ext = True, e
                    break
            still = (base + '.jpg') in bucket
            subs = (base + '.srt') in bucket
            pr = probe.get(base)
            if pr and (pr.get('sidecar') or (pr.get('embedded') or 0) > 0):
                subs = True
        assets = {'video': video, 'still': still, 'subs': subs}
        st = state_of(r, assets)
        by_series[key].append([
            r['season'],
            int(r['episode']) if r['episode'].isdigit() else 0,
            r['title'],
            CATS.index(r['category']) if r['category'] in CATS else 0,
            st,
            r.get('best') or '',
            r.get('checked') or '',
            r.get('have') or '',
            r.get('released') or '',
            r.get('description') or '',
            fn,
            ext,
            (1 if video else 0) | (2 if still else 0) | (4 if subs else 0),
            r.get('note') or '',
        ])
    return by_series


CSS = """
/* ===========================================================================
   Ledger V2 — a board, not a printout.

   Swiss discipline, at dashboard density: one strict grid, hairlines instead
   of boxes, tabular numerals everywhere a number is compared, and no rounded
   card kit. The page carries three regions and nothing else — which series,
   which episode, and everything known about it.

   Colour says one thing only: what is wrong. A satisfied episode is a quiet
   outline, so the gaps are the only things that carry fill. That rule is
   inherited from the first ledger and is the single best idea in it.
   =========================================================================== */
@font-face{font-family:"Hanken Grotesk";font-style:normal;font-weight:400 900;font-display:swap;
  src:url("/fonts/hanken-grotesk-latin.woff2") format("woff2")}
:root{
  color-scheme:dark;
  --bg:#080B18; --panel:#10142A; --sunk:#05070F;
  --hair:rgba(255,255,255,.09); --line:rgba(255,255,255,.16);
  --ink:#fff; --mid:rgba(255,255,255,.66); --dim:rgba(255,255,255,.58);
  --ok:#1BC38C; --below:#E3A505; --absent:#E34805; --gone:#8C97B3;
  --sel:#5AA9FF;
  /* Dense scale, 4px base. Density dial at 9 of 10. */
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:24px; --s6:32px;
  --f:"Hanken Grotesk",ui-sans-serif,system-ui,-apple-system,sans-serif;
  --ease:cubic-bezier(.2,.7,.2,1);
}
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--f);
  font-size:14px;line-height:1.45;-webkit-font-smoothing:antialiased;
  display:flex;flex-direction:column;overflow:hidden}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
.vh{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;
  clip:rect(0 0 0 0);white-space:nowrap;border:0}
.skip{position:absolute;left:var(--s3);top:-60px;z-index:30;background:var(--panel);
  padding:10px 16px;font-weight:700;box-shadow:inset 0 0 0 1px var(--line);
  transition:top .16s var(--ease)}
.skip:focus{top:var(--s3)}
:focus-visible{outline:2px solid var(--sel);outline-offset:2px}

/* ---- masthead ---- */
.top{flex:none;display:flex;align-items:center;gap:var(--s5);
  padding:var(--s3) var(--s5);border-bottom:1px solid var(--line);background:var(--bg)}
.wordmark{margin:0;font-size:15px;font-weight:800;letter-spacing:-.01em;white-space:nowrap}
.wordmark b{color:var(--ok)}
.top form{margin-left:auto;display:flex;gap:var(--s2);align-items:center}
.top input{font:inherit;min-height:44px;padding:0 var(--s3);width:300px;
  background:var(--sunk);border:1px solid var(--hair);color:#fff}
.top input::placeholder{color:var(--dim)}
.tally{font-variant-numeric:tabular-nums;color:var(--mid);white-space:nowrap}
.tally b{color:#fff;font-size:17px;font-weight:800}

/* ---- three regions ---- */
/* Two columns until an episode is picked, three after. An empty panel holding
   400px open to say "pick something" was spending a quarter of the window on
   an instruction. */
.frame{flex:1 1 auto;min-height:0;display:grid;
  grid-template-columns:232px minmax(0,1fr)}
.frame.picked{grid-template-columns:232px minmax(0,1fr) 400px}
.detail{display:none}
.frame.picked .detail{display:block}
.rail{border-right:1px solid var(--line);overflow-y:auto;padding:var(--s3) 0}
.work{min-width:0;overflow-y:auto;position:relative}
.detail{border-left:1px solid var(--line);overflow-y:auto;background:var(--panel)}
.detail .close{position:absolute;top:var(--s3);right:var(--s3);width:44px;height:44px;
  display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--mid)}
.detail .close:hover{color:#fff}
.detail .pad{position:relative}
.hint{margin:var(--s4) 0 0;font-size:12px;color:var(--dim)}

/* ---- series rail ---- */
.rail button{display:block;width:100%;text-align:left;padding:var(--s2) var(--s4);
  min-height:44px;border-left:2px solid transparent}
.rail button:hover{background:rgba(255,255,255,.04)}
.rail button[aria-current="true"]{background:rgba(255,255,255,.06);border-left-color:var(--ok)}
.rail .nm{display:block;font-weight:700;font-size:13px}
.rail .fig{display:block;font-size:12px;color:var(--mid);font-variant-numeric:tabular-nums}
.rail .bar{display:flex;height:3px;margin-top:6px;background:var(--hair)}
.rail .bar i{display:block;height:100%}
.rail .bar i.ok{background:var(--ok)}
.rail .bar i.upgrade{background:var(--below)}
.rail .bar i.recon{background:var(--gone)}
.rail h2{margin:var(--s4) var(--s4) var(--s2);font-size:11px;font-weight:700;
  color:var(--dim);letter-spacing:.08em}

/* ---- filters ---- */
/* The series' own facts, as a strip rather than a hero. The first ledger gave
   this a 236px poster panel above every list, which was a page's worth of
   furniture on a tool; the same information fits on two lines. */
/* The series' own artwork, at the weight a tool can carry: the poster as a
   small plate, the background as a wash behind the text rather than a hero
   image with the text sitting on top of it. */
.about{position:relative;padding:var(--s4) var(--s5) var(--s3);
  border-bottom:1px solid var(--hair);display:flex;gap:var(--s4);align-items:flex-start;
  isolation:isolate;overflow:hidden}
.about .bg{position:absolute;inset:0;z-index:-1;object-fit:cover;width:100%;height:100%;
  opacity:.16;mask-image:linear-gradient(90deg,#000 0%,transparent 78%)}
.about .poster{flex:none;width:54px;height:81px;object-fit:cover;background:var(--sunk);
  box-shadow:inset 0 0 0 1px var(--hair)}
.about .body{min-width:0}
.about h2{margin:0;font-size:17px;font-weight:800;letter-spacing:-.01em}
.about .facts{margin:var(--s1) 0 0;font-size:12px;color:var(--mid);
  display:flex;flex-wrap:wrap;gap:var(--s1) var(--s3);font-variant-numeric:tabular-nums}
.about .facts code{font:inherit;color:var(--dim)}
.about p{margin:var(--s2) 0 0;font-size:13px;line-height:1.5;color:var(--dim);max-width:78ch}
.focus{display:flex;flex-wrap:wrap;gap:var(--s2);padding:var(--s3) var(--s5);
  border-bottom:1px solid var(--hair)}
.focus button{display:flex;flex-direction:column;gap:1px;padding:var(--s2) var(--s4);
  min-height:44px;text-align:left;box-shadow:inset 0 0 0 1px var(--absent)}
.focus button:nth-child(3){box-shadow:inset 0 0 0 1px var(--below)}
.focus button:hover{background:rgba(255,255,255,.05)}
.focus b{font-size:16px;font-weight:800;font-variant-numeric:tabular-nums}
.focus small{font-size:11.5px;color:var(--mid)}
.focus .done{margin:0;font-size:13px;color:var(--ok)}
.filters{position:sticky;top:0;z-index:4;display:flex;flex-wrap:wrap;gap:var(--s2);
  padding:var(--s3) var(--s5);background:var(--bg);border-bottom:1px solid var(--hair)}
.filters button{min-height:44px;padding:0 var(--s3);border:1px solid var(--hair);
  font-size:12px;font-weight:700;color:var(--mid);display:inline-flex;align-items:center;gap:6px}
.filters button[aria-pressed="true"]{background:#fff;color:#000;border-color:#fff}
.filters button i{font-style:normal;font-variant-numeric:tabular-nums;opacity:.65}
.filters .dot{width:8px;height:8px;display:inline-block}
.dot.ok{background:var(--ok)}.dot.upgrade{background:var(--below)}
.dot.absent{background:var(--absent)}.dot.gone{background:var(--gone);opacity:.45}.dot.recon{background:var(--gone)}

/* ---- the matrix ----
   One tile per episode. Fixed 14px cells so a season's length is legible as a
   length, and a gap is legible as a hole. */
.matrix{padding:var(--s4) var(--s5) var(--s5)}
.mrow{display:grid;grid-template-columns:64px 1fr;gap:var(--s3);
  align-items:start;margin-bottom:var(--s2)}
.mrow .lab{font-size:12px;font-weight:700;color:var(--mid);text-align:right;
  font-variant-numeric:tabular-nums;padding-top:2px}
.cells{display:flex;flex-wrap:wrap;gap:3px}
.cell{width:14px;height:14px;padding:0;border:1px solid transparent;position:relative}
.cell.ok{box-shadow:inset 0 0 0 1px rgba(27,195,140,.45)}
.cell.upgrade{background:var(--below)}
.cell.absent{background:var(--absent)}
.cell.gone{background:var(--gone);opacity:.45}
.cell.recon{background:repeating-linear-gradient(45deg,var(--gone) 0 2px,transparent 2px 4px)}
.cell:hover{outline:2px solid #fff;outline-offset:1px;z-index:2}
.cell[aria-pressed="true"]{outline:2px solid var(--sel);outline-offset:1px;z-index:2}
.legend{display:flex;gap:var(--s4);flex-wrap:wrap;margin:var(--s5) 0 0;
  font-size:12px;color:var(--mid)}
.legend span{display:inline-flex;align-items:center;gap:6px}
.legend i{width:12px;height:12px;display:inline-block}
.legend i.ok{box-shadow:inset 0 0 0 1px rgba(27,195,140,.45)}
.legend i.upgrade{background:var(--below)}
.legend i.absent{background:var(--absent)}
.legend i.gone{background:var(--gone);opacity:.45}
.legend i.recon{background:repeating-linear-gradient(45deg,var(--gone) 0 2px,transparent 2px 4px)}

/* ---- the list ---- */
.listwrap{border-top:1px solid var(--line);padding:0 var(--s5) var(--s6)}
.listhead{position:sticky;top:0;z-index:3;display:grid;gap:var(--s3);
  grid-template-columns:var(--cols);padding:var(--s3) 0 var(--s2);
  background:var(--bg);border-bottom:1px solid var(--line);
  font-size:11px;font-weight:700;color:var(--dim);letter-spacing:.06em}
.rows,.listhead{--cols:32px minmax(180px,1.2fr) minmax(220px,1.5fr) 120px 150px 58px}
/* Once an episode is open the panel carries the summary in full, so the list
   gives that column up rather than squeezing the quality columns to fit. */
.frame.picked .rows,.frame.picked .listhead{--cols:32px minmax(180px,1fr) 120px 150px 58px}
.frame.picked .row .sub,.frame.picked .listhead span:nth-child(3){display:none}
.row{display:grid;gap:var(--s3);grid-template-columns:var(--cols);
  align-items:center;width:100%;text-align:left;padding:var(--s2) 0;
  border-bottom:1px solid var(--hair);min-height:44px}
.row:hover{background:rgba(255,255,255,.04)}
.row[aria-pressed="true"]{background:rgba(90,169,255,.12)}
.row .n{font-variant-numeric:tabular-nums;color:var(--mid);font-size:12px}
.row .ti{font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.row .ti em{font-style:normal;color:var(--dim);font-weight:500;font-size:12px;margin-left:6px}
.row .sub{color:var(--mid);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.row .q{font-size:12px;font-variant-numeric:tabular-nums;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.row .q.two b{display:block;font-weight:600;overflow:hidden;text-overflow:ellipsis}
.row .q.two small{display:block;font-size:11px;color:var(--dim)}
.row .q.two b.nil{color:var(--dim);font-weight:500}
.row .q.ceil{color:var(--mid)}
.row .q.upgrade{color:var(--below)}
.row .q.absent{color:var(--absent)}
.row .q.gone,.row .q.recon{color:var(--gone)}.row .q.ok{color:var(--mid)}
.row .files{display:flex;gap:3px}
.row .files i{font-style:normal;font-size:10px;font-weight:800;width:18px;
  line-height:16px;text-align:center;color:var(--dim);
  box-shadow:inset 0 0 0 1px var(--hair)}
.row .files i.no{color:var(--absent);box-shadow:inset 0 0 0 1px rgba(227,72,5,.5)}
#sentinel{height:1px}

/* ---- detail ---- */
.detail .pad{padding:var(--s5)}
.detail .empty{color:var(--dim);font-size:13px}
.kicker{font-size:11px;font-weight:700;color:var(--dim);letter-spacing:.08em}
.detail h3{margin:var(--s2) 0 var(--s1);font-size:20px;line-height:1.2;font-weight:800}
.detail .where{color:var(--mid);font-size:12px;font-variant-numeric:tabular-nums}
.detail .state{margin:var(--s2) 0 0;font-size:12.5px;font-weight:700;display:flex;gap:8px;align-items:center}
.detail .state i{width:10px;height:10px;flex:none}
.detail .state.absent i{background:var(--absent)}.detail .state.upgrade i{background:var(--below)}
.detail .state.ok i{box-shadow:inset 0 0 0 1px var(--ok)}
.detail .state.recon i{background:repeating-linear-gradient(45deg,var(--gone) 0 2px,transparent 2px 4px)}
.detail .state.gone i{background:var(--gone);opacity:.45}
.detail .state.absent{color:var(--absent)}.detail .state.upgrade{color:var(--below)}
.detail .state.recon,.detail .state.gone{color:var(--mid)}
.detail .state.ok{color:var(--ok)}
.detail .prose{margin:var(--s4) 0 0;font-size:13.5px;line-height:1.55;color:rgba(255,255,255,.80)}
.detail .note{margin:var(--s3) 0 0;font-size:12.5px;color:var(--below);
  border-left:2px solid var(--below);padding-left:var(--s3)}
.ladder{margin:var(--s5) 0 0;border-top:1px solid var(--hair)}
.rung{display:grid;grid-template-columns:76px 1fr;gap:var(--s3);align-items:baseline;
  padding:var(--s3) 0;border-bottom:1px solid var(--hair)}
.rung dt{font-size:11px;font-weight:700;color:var(--dim);letter-spacing:.06em}
.rung dd{margin:0;font-size:13px;font-variant-numeric:tabular-nums}
.rung dd small{display:block;color:var(--dim);font-size:11.5px;margin-top:2px}
.rung.gap dd{color:var(--below)}
.detail .grid2{display:grid;grid-template-columns:76px 1fr;gap:var(--s3);
  padding:var(--s3) 0;border-bottom:1px solid var(--hair);font-size:12.5px}
.detail .grid2 dt{font-size:11px;font-weight:700;color:var(--dim);letter-spacing:.06em}
.detail .grid2 dd{margin:0;overflow-wrap:anywhere}
.detail .shot{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;
  background:var(--sunk);margin-top:var(--s4);box-shadow:inset 0 0 0 1px var(--hair)}
.detail .open{display:inline-flex;align-items:center;min-height:44px;margin-top:var(--s4);
  padding:0 var(--s4);box-shadow:inset 0 0 0 1px var(--line);font-weight:700;font-size:13px}
.detail .open:hover{background:#fff;color:#000}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{transition-duration:.01ms !important;animation-duration:.01ms !important}
}
/* Detail becomes a bottom sheet, then the matrix loses its labels column. */
@media (max-width:1180px){
  .frame{grid-template-columns:200px minmax(0,1fr)}
  .frame,.frame.picked{grid-template-columns:200px minmax(0,1fr)}
  .frame.picked .detail{position:fixed;inset:auto 0 0 0;max-height:62vh;z-index:20;
    border-left:0;border-top:1px solid var(--line);box-shadow:0 -12px 40px rgba(0,0,0,.5)}
}
@media (max-width:760px){
  .frame,.frame.picked{grid-template-columns:minmax(0,1fr)}
  .rail{position:static;display:flex;overflow-x:auto;border-right:0;
    border-bottom:1px solid var(--line);padding:var(--s2)}
  .rail h2{display:none}
  .rail button{width:auto;white-space:nowrap;border-left:0;border-bottom:2px solid transparent}
  .rail button[aria-current="true"]{border-left-color:transparent;border-bottom-color:var(--ok)}
  .rail .bar{display:none}
  .rows,.listhead{--cols:30px minmax(0,1fr) 84px}
  .row .sub,.listhead span:nth-child(3),.listhead span:nth-child(5),
  .row .q.two,.row .files,.listhead span:nth-child(6){display:none}
  .top{flex-wrap:wrap;gap:var(--s2)}
  .top form{margin-left:0;width:100%}
  .top input{width:100%}
}
"""


JS = r"""
(function(){
'use strict';
var D = window.__LEDGER__;
var CATS = D.cats, SERIES = D.series, CDN = D.cdn;
var state = { s: SERIES[0].key, want: '', q: '', sel: null, shown: 120 };

var rail = document.getElementById('rail');
var filters = document.getElementById('filters');
var about = document.getElementById('about');
var focus = document.getElementById('focus');
var matrix = document.getElementById('matrix');
var rows = document.getElementById('rows');
var listhead = document.getElementById('listhead');
var detail = document.getElementById('detail');
var tally = document.getElementById('tally');
var box = document.getElementById('q');
var sentinel = document.getElementById('sentinel');

function series(){ return SERIES.filter(function(s){ return s.key === state.s; })[0]; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){
  return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

/* A row is an array; these name its slots so the rest reads as English. */
var SEASON=0, EP=1, TITLE=2, CAT=3, STATE=4, BEST=5, CHECKED=6,
    HAVE=7, RELEASED=8, DESC=9, FILE=10, EXT=11, ASSETS=12, NOTE=13,
    SRC=14, SRCFOLDER=15;

/* The name as the catalogue shows it. A season list mixes the run with the
   specials, minisodes and prequels filed between its episodes, and by title
   alone there is nothing to tell them apart. Wiped episodes say so too, since
   what plays is a reconstruction rather than the programme. */
function shown(r){
  var tags = [];
  if (r[CAT]) tags.push(CATS[r[CAT]]);
  if (r[STATE] === 'recon') tags.push('Telesnaps');
  if (!tags.length) return r[TITLE];
  return /\)$/.test(r[TITLE]) ? r[TITLE] + ' \u00b7 ' + tags.join(', ')
                               : r[TITLE] + ' (' + tags.join(', ') + ')';
}

/* The best copy worth getting, and the day the indexers were last asked. The
   date is half the value: a target written months ago and never rechecked is a
   guess, and this is the column you scan to decide what to search next. */
function bestCell(r){
  if (r[BEST]) return '<b>' + esc(r[BEST]) + '</b>' +
    (r[CHECKED] ? '<small>checked ' + esc(r[CHECKED]) + '</small>'
                : '<small class="nil">never checked</small>');
  return '<b class="nil">never checked</b>';
}

function matches(r){
  if (state.want && r[STATE] !== state.want) return false;
  if (state.q){
    var hay = (shown(r) + ' ' + r[FILE] + ' ' + CATS[r[CAT]] + ' ' +
               r[HAVE] + ' ' + r[BEST] + ' ' + r[DESC]).toLowerCase();
    if (hay.indexOf(state.q) === -1) return false;
  }
  return true;
}
function visible(){ return series().rows.filter(matches); }

/* ---- rail ---- */
function drawRail(){
  rail.innerHTML = '<h2>Series</h2>' + SERIES.map(function(s){
    if (s.byseries) return '';
    /* Three segments, not one. "659 of 716 held" was true and unhelpful,
       because a held copy below the one worth getting is not finished work. */
    var n = s.rows.length || 1;
    var at = s.rows.filter(function(r){ return r[STATE] === 'ok'; }).length;
    var up = s.rows.filter(function(r){ return r[STATE] === 'upgrade'; }).length;
    var ab = s.rows.filter(function(r){ return r[STATE] === 'absent'; }).length;
    var rc = s.rows.filter(function(r){ return r[STATE] === 'recon'; }).length;
    return '<button type="button" data-s="' + s.key + '" aria-current="' + (s.key === state.s) + '">' +
      '<span class="nm">' + esc(s.name) + '</span>' +
      '<span class="fig">' + (up + ab) + ' to do · ' + at + ' at best</span>' +
      '<span class="bar">' +
        '<i class="ok" style="width:' + (100 * at / n) + '%"></i>' +
        '<i class="upgrade" style="width:' + (100 * up / n) + '%"></i>' +
        '<i class="absent" style="width:' + (100 * ab / n) + '%"></i>' +
        '<i class="recon" style="width:' + (100 * rc / n) + '%"></i>' +
      '</span></button>';
  }).join('') +
    '<h2>All of it</h2>' + SERIES.filter(function(s){ return s.byseries; })
      .map(function(s){
        return '<button type="button" data-s="' + s.key + '" aria-current="' +
          (s.key === state.s) + '"><span class="nm">' + esc(s.name) +
          '</span><span class="fig">' + s.rows.length + ' episodes, in air date order' +
          '</span></button>'; }).join('');
}

/* ---- filters ---- */
var STATES = [['','Everything'],['absent','Not uploaded'],['upgrade','Worth re-fetching'],
              ['ok','At best'],
              ['recon','Reconstruction'],['gone','No source']];
function drawFilters(){
  var all = series().rows;
  filters.innerHTML = STATES.map(function(f){
    var n = f[0] ? all.filter(function(r){ return r[STATE] === f[0]; }).length : all.length;
    var dot = f[0] ? '<span class="dot ' + f[0] + '"></span>' : '';
    if (!n && f[0] && state.want !== f[0]) return '';
    return '<button type="button" data-w="' + f[0] + '" aria-pressed="' +
      (state.want === f[0]) + '">' + dot + f[1] + ' <i>' + n + '</i></button>';
  }).join('');
}

/* ---- matrix ---- */
function drawMatrix(){
  var byGroup = {}, order = [], all = series().byseries;
  visible().forEach(function(r){
    var k = all ? r[SRC] : r[SEASON];
    if (!byGroup[k]) { byGroup[k] = []; order.push(k); }
    byGroup[k].push(r);
  });
  var bySeason = byGroup;
  if (!order.length){ matrix.innerHTML = '<p class="detail empty">Nothing matches.</p>'; return; }
  var seenFirst = false;
  matrix.innerHTML = order.map(function(k){
    var cells = bySeason[k].map(function(r){
      var id = (all ? r[SRC] + '/' : '') + r[SEASON] + ':' + r[EP];
      var stop = (state.sel === id) || (!state.sel && !seenFirst); seenFirst = true;
      return '<button type="button" class="cell ' + r[STATE] + '" data-id="' + id +
        '" tabindex="' + (stop ? 0 : -1) + '"' +
        ' aria-pressed="' + (state.sel === id) + '" title="' + esc(shown(r)) +
        ' — ' + label(r[STATE]) + '"><span class="vh">' + esc(shown(r)) + ', ' +
        label(r[STATE]) + '</span></button>';
    }).join('');
    var lab = all ? (D.names[k] || k) : (k === '-' ? 'Films' : 'S' + k);
    return '<div class="mrow"><span class="lab">' + esc(lab) +
      '</span><div class="cells">' + cells + '</div></div>';
  }).join('') +
  '<p class="legend">' +
    '<span><i class="ok"></i>At the best obtainable</span>' +
    '<span><i class="upgrade"></i>Upgrade worth getting</span>' +
    '<span><i class="absent"></i>Not in the bucket</span>' +
    '<span><i class="recon"></i>Reconstruction</span>' +
    '<span><i class="gone"></i>No source exists</span>' +
  '</p><p class="hint">Select any episode for its full record.</p>';
}
function label(s){
  return {ok:'at the best worth getting', upgrade:'a better copy is worth getting',
          absent:'not in the bucket', recon:'reconstruction from telesnaps',
          gone:'no source exists'}[s] || s;
}

/* ---- list, rendered a slice at a time ---- */
function drawList(){
  var v = visible();
  var slice = v.slice(0, state.shown);
  rows.innerHTML = slice.map(function(r){
    var a = r[ASSETS];
    var f = [[1,'V'],[2,'S'],[4,'T']].map(function(p){
      return '<i class="' + ((a & p[0]) ? '' : 'no') + '">' + p[1] + '</i>'; }).join('');
    var id = r[SEASON] + ':' + r[EP];
    return '<button type="button" class="row" data-id="' + id + '" aria-pressed="' +
      (state.sel === id) + '">' +
      '<span class="n">' + (r[SEASON] === '-' ? '—' : r[SEASON] + '.' + r[EP]) + '</span>' +
      '<span class="ti">' + esc(shown(r)) + '</span>' +
      '<span class="sub" title="' + esc(r[DESC]) + '">' + esc(r[DESC]) + '</span>' +
      '<span class="q ' + r[STATE] + '" title="' + esc(r[HAVE] || label(r[STATE])) + '">' +
        esc(r[HAVE] || label(r[STATE])) + '</span>' +
      '<span class="q two">' + bestCell(r) + '</span>' +
      '<span class="files">' + f + '</span></button>';
  }).join('');
  // The sentinel sits under the last rendered row; reaching it loads the next
  // block. Still only a slice in the DOM, without asking you to press anything.
  sentinel.hidden = v.length <= state.shown;
  tally.innerHTML = '<b>' + v.length + '</b> of ' + series().rows.length + ' shown';
}

/* ---- detail ---- */
function drawDetail(){
  if (!state.sel){
    detail.innerHTML = '';
    document.querySelector('.frame').classList.remove('picked');
    return;
  }
  document.querySelector('.frame').classList.add('picked');
  var pre = series().byseries;
  var r = series().rows.filter(function(x){
    return (pre ? x[SRC] + '/' : '') + x[SEASON] + ':' + x[EP] === state.sel; })[0];
  if (!r) return;
  var s = series();
  var base = (s.byseries ? r[SRCFOLDER] : s.folder) +
             '/season_' + r[SEASON] + '/' + r[FILE];
  var gap = r[STATE] === 'below' || r[STATE] === 'absent';
  var rung = function(k, v, sub, isGap){
    return '<div class="rung' + (isGap ? ' gap' : '') + '"><dt>' + k + '</dt><dd>' +
      esc(v || '—') + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</dd></div>';
  };
  detail.innerHTML = '<div class="pad">' +
    '<button class="close" type="button" id="shut" aria-label="Close">&times;</button>' +
    '<p class="kicker">' + esc(s.byseries ? D.names[r[SRC]] : s.name) +
      ' · ' + esc(CATS[r[CAT]]) + '</p>' +
    '<h3>' + esc(shown(r)) + '</h3>' +
    '<p class="state ' + r[STATE] + '"><i></i>' + esc(verdict(r)) + '</p>' +
    '<p class="where">' + (r[SEASON] === '-' ? 'Unplaced' : 'Season ' + r[SEASON] +
      ', episode ' + r[EP]) + (r[RELEASED] ? ' · first shown ' + esc(r[RELEASED]) : '') + '</p>' +
    ((r[ASSETS] & 2) ? '<img class="shot" alt="" loading="lazy" width="400" height="225" src="' +
        CDN + '/' + base + '.jpg">' : '') +
    (r[DESC] ? '<p class="prose">' + esc(r[DESC]) + '</p>' : '') +
    (r[NOTE] ? '<p class="note">' + esc(r[NOTE]) + '</p>' : '') +
    (r[STATE] === 'gone' ? '<p class="note">No copy of this episode survives.</p>' : '') +
    (r[STATE] === 'recon' ? '<p class="note">The film was wiped. What is held is a '
      + 'reconstruction: telesnaps cut to the surviving soundtrack.</p>' : '') +
    '<dl class="ladder">' +
      rung('Held', r[HAVE], r[STATE] === 'absent' ? 'not in the bucket' : '', gap) +
      rung('Best found', r[BEST] || 'nothing recorded',
           r[CHECKED] ? 'checked ' + r[CHECKED] : 'the indexers have never been asked',
           false) +
    '</dl>' +
    '<div class="grid2"><dt>Files</dt><dd>' +
      [[1,'video'],[2,'still'],[4,'subtitles']].map(function(p){
        return ((r[ASSETS] & p[0]) ? '' : 'no ') + p[1]; }).join(' · ') +
    '</dd></div>' +
    (r[FILE] ? '<div class="grid2"><dt>Name</dt><dd>' + esc(r[FILE]) + '</dd></div>' : '') +
    ((r[ASSETS] & 1) ? '<a class="open" href="' + CDN + '/' + base + r[EXT] +
      '" target="_blank" rel="noopener">Open the video file</a>' : '') +
    '</div>';
}

function drawAbout(){
  var s = series();
  var facts = [];
  if (s.years) facts.push(esc(s.years));
  if (s.genres && s.genres.length) facts.push(esc(s.genres.join(' · ')));
  facts.push(s.rows.length + ' episodes');
  if (s.sid) facts.push('<code>' + esc(s.sid) + '</code>');
  var art = s.art
    ? '<img class="bg" alt="" loading="lazy" src="' + CDN + '/' + s.art + '/' + s.art + '_background.jpg">' +
      '<img class="poster" alt="" loading="lazy" width="54" height="81" src="' +
        CDN + '/' + s.art + '/' + s.art + '_poster.jpg">'
    : '';
  about.innerHTML = art + '<div class="body"><h2>' + esc(s.name) + '</h2>' +
    '<p class="facts">' + facts.map(function(f){ return '<span>' + f + '</span>'; }).join('') + '</p>' +
    (s.about ? '<p>' + esc(s.about) + '</p>' : '') + '</div>';
}

/* What is left to do, stated before anything else. Two jobs only: put a copy
   in the bucket, or fetch a better one that has been found. Everything else on
   the page is the state of the archive, which is worth knowing and is not a
   task. */
function drawFocus(){
  var all = series().rows;
  var miss = all.filter(function(r){ return r[STATE] === 'absent'; }).length;
  var up = all.filter(function(r){ return r[STATE] === 'upgrade'; }).length;
  if (!miss && !up){
    focus.innerHTML = '<p class="done">Nothing outstanding in ' + esc(series().name) +
      '. Every episode held is at the best anyone has found.</p>';
    return;
  }
  var bits = [];
  if (miss) bits.push('<button type="button" data-go="absent"><b>' + miss +
    '</b> to upload<small>a copy exists and is not in the bucket</small></button>');
  if (up) bits.push('<button type="button" data-go="upgrade"><b>' + up +
    '</b> to re-fetch<small>a better copy is worth getting</small></button>');
  focus.innerHTML = '<h2 class="vh">What to do next</h2>' + bits.join('');
}

/* One sentence on what this episode's state means, and whether it is a job. */
function verdict(r){
  return {
    absent:  'To upload: a copy exists and is not in the bucket.',
    upgrade: 'To re-fetch: a better copy is worth getting than the one held.',
    ok:      'At the best worth getting.',
    recon:   'Reconstruction: the film was wiped; telesnaps cut to the soundtrack.',
    gone:    'No source exists.'
  }[r[STATE]] || '';
}

function draw(){ drawAbout(); drawFocus(); drawFilters(); drawMatrix(); drawList(); drawDetail(); }

function select(id){ state.sel = id; drawMatrix(); drawList(); drawDetail(); sync(); }

/* State lives in the URL, so a view can be sent to somebody. */
function sync(){
  var h = state.s + (state.want ? '/' + state.want : '') +
          (state.sel ? '@' + state.sel : '');
  if (location.hash.slice(1) !== h) history.replaceState(null, '', '#' + h);
}
function fromHash(){
  var h = decodeURIComponent(location.hash.slice(1));
  if (!h) return;
  var at = h.split('@'); var parts = at[0].split('/');
  if (SERIES.some(function(s){ return s.key === parts[0]; })) state.s = parts[0];
  state.want = parts[1] || '';
  state.sel = at[1] || null;
}

rail.addEventListener('click', function(e){
  var b = e.target.closest('button[data-s]'); if (!b) return;
  state.s = b.dataset.s; state.sel = null; state.shown = 120;
  drawRail(); draw(); sync();
});
focus.addEventListener('click', function(e){
  var b = e.target.closest('button[data-go]'); if (!b) return;
  state.want = b.dataset.go; state.shown = 120; draw(); sync();
});
filters.addEventListener('click', function(e){
  var b = e.target.closest('button[data-w]'); if (!b) return;
  state.want = b.dataset.w; state.shown = 120; draw(); sync();
});
matrix.addEventListener('click', function(e){
  var b = e.target.closest('.cell'); if (b) select(b.dataset.id);
});
rows.addEventListener('click', function(e){
  var b = e.target.closest('.row'); if (b) select(b.dataset.id);
});
if ('IntersectionObserver' in window){
  new IntersectionObserver(function(hits){
    if (hits[0].isIntersecting && !sentinel.hidden){ state.shown += 200; drawList(); }
  }, { root: document.getElementById('work'), rootMargin: '400px' }).observe(sentinel);
} else {
  // Older engines: fall back to watching the scroll position directly.
  document.getElementById('work').addEventListener('scroll', function(){
    var w = this;
    if (!sentinel.hidden && w.scrollTop + w.clientHeight > w.scrollHeight - 500){
      state.shown += 200; drawList();
    }
  });
}
box.addEventListener('input', function(){
  state.q = box.value.trim().toLowerCase(); state.shown = 120; draw();
});
detail.addEventListener('click', function(e){
  if (e.target.closest('#shut')) select(null);
});

document.addEventListener('keydown', function(e){
  if (e.key === '/' && document.activeElement !== box){ e.preventDefault(); box.focus(); }
  if (e.key === 'Escape'){
    if (document.activeElement === box){ box.value = ''; state.q = ''; draw(); }
    else if (state.sel){ select(null); }
  }
});
/* Arrow keys walk the grid, which is the point of laying it out as one. */
matrix.addEventListener('keydown', function(e){
  if (e.key.indexOf('Arrow') !== 0) return;
  var cells = [].slice.call(matrix.querySelectorAll('.cell'));
  var i = cells.indexOf(document.activeElement);
  if (i === -1) return;
  e.preventDefault();
  var move = function(el){ cells.forEach(function(c){ c.tabIndex = -1; }); el.tabIndex = 0; el.focus(); };
  var step = (e.key === 'ArrowRight') ? 1 : (e.key === 'ArrowLeft') ? -1 : 0;
  if (!step){
    var here = document.activeElement.getBoundingClientRect();
    var want = e.key === 'ArrowDown' ? 1 : -1;
    for (var j = i + want; j >= 0 && j < cells.length; j += want){
      var r = cells[j].getBoundingClientRect();
      if (Math.abs(r.left - here.left) < 9 && r.top !== here.top){ move(cells[j]); return; }
    }
    return;
  }
  var n = cells[i + step]; if (n) move(n);
});

fromHash();
drawRail(); draw();
window.addEventListener('hashchange', function(){ fromHash(); drawRail(); draw(); });
})();
"""


def render():
    by_series = build_rows()
    # The series' own facts — years, genres, the addon id and the standing
    # description — come from the ledger's tab definitions, so this page and the
    # addon cannot describe the same series differently.
    tabs = {t['key']: t for t in build.load()[0]}

    views = []
    for k, name, folder, years in SERIES_ORDER:
        if not by_series.get(k):
            continue
        t = tabs.get(k, {})
        views.append({
            'key': k, 'name': name, 'folder': folder,
            'years': t.get('release_info') or years,
            'genres': t.get('genres') or [],
            'sid': t.get('stremio_id') or '',
            'about': t.get('description') or '',
            'art': folder,
            'rows': by_series[k],
        })

    # Everything, interleaved by UK air date the way all-who.tsv orders it.
    # Its matrix groups by series rather than by season, so the whole catalogue
    # is seven bars and you can see which series is carrying the gaps.
    order = {}
    aw = os.path.join(HERE, 'all-who.tsv')
    if os.path.exists(aw):
        for i, row in enumerate(csv.DictReader(io.open(aw, encoding='utf8'),
                                               delimiter='	')):
            order[(row['series'], row['season'], row['category'], row['title'])] = i
    every = []
    for v in views:
        for r in v['rows']:
            key = (v['key'], r[0], CATS[r[3]], r[2])
            every.append((order.get(key, 10 ** 6), v['key'], v['folder'], r))
    every.sort(key=lambda x: x[0])
    # The chronology is a series in its own right — it has its own artwork,
    # description and Stremio id in the registry — so it is described from the
    # same source as the rest rather than from a hand-written line here.
    ch = tabs.get('complete-chronology', {})
    views.append({
        'key': 'everything',
        'name': ch.get('name') or 'Complete Chronology',
        'folder': ch.get('folder') or 'complete_chronology',
        'art': ch.get('folder') or 'complete_chronology',
        'years': ch.get('release_info') or '1963-Present',
        'genres': ch.get('genres') or [],
        'sid': ch.get('stremio_id') or '',
        'about': ch.get('description') or '',
        'byseries': True,
        'rows': [r + [src, folder] for _, src, folder, r in every],
    })

    payload = {'cdn': CDN, 'cats': CATS, 'series': views,
               'names': {k: name for k, name, _, _ in SERIES_ORDER}}
    total = sum(len(v) for v in by_series.values())

    page = (
        '<!doctype html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n'
        '<title>Whoniverse Ledger V2</title>\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
        '<meta name="color-scheme" content="dark">\n'
        '<meta name="theme-color" content="#080B18">\n'
        '<link rel="icon" type="image/png" href="/art/icon.png">\n'
        '<style>%s</style>\n</head>\n<body>\n'
        '<a class="skip" href="#work">Skip to the episodes</a>\n'
        '<header class="top">'
        '<h1 class="wordmark">Whoniverse <b>Ledger</b> V2</h1>'
        '<span class="tally" id="tally"></span>'
        '<form role="search" onsubmit="return false">'
        '<label class="vh" for="q">Search episodes</label>'
        '<input id="q" type="search" placeholder="Search titles, files, quality"'
        ' autocomplete="off" spellcheck="false"></form>'
        '</header>\n'
        '<div class="frame">'
        '<nav class="rail" id="rail" aria-label="Series"></nav>'
        '<main class="work" id="work">'
        '<div class="about" id="about"></div>'
        '<div class="focus" id="focus" aria-label="What to do next"></div>'
        '<div class="filters" id="filters" aria-label="Filter by state"></div>'
        '<section class="matrix" id="matrix" aria-label="Completeness grid"></section>'
        '<section class="listwrap" aria-label="Episode list">'
        '<div class="listhead" id="listhead"><span>#</span><span>Episode</span>'
        '<span>Summary</span><span>Held</span><span>Best found</span>'
        '<span>Files</span></div>'
        '<div class="rows" id="rows"></div>'
        '<div id="sentinel" hidden aria-hidden="true"></div>'
        '</section></main>'
        '<aside class="detail" id="detail" aria-live="polite" aria-label="Episode detail"></aside>'
        '</div>\n'
        '<script>window.__LEDGER__=%s;</script>\n'
        '<script>%s</script>\n</body>\n</html>\n'
    ) % (CSS, json.dumps(payload, separators=(',', ':'), ensure_ascii=False), JS)

    os.makedirs(OUT, exist_ok=True)
    for path in (os.path.join(OUT, 'ledger-v2.html'),
                 os.path.join(ROOT, 'public', 'ledger-v2.html')):
        io.open(path, 'w', encoding='utf8', newline='\n').write(page)
        print('  wrote %s (%.0f KB)' % (os.path.relpath(path, ROOT),
                                        os.path.getsize(path) / 1024))
    print('  %d episodes across %d series' % (total, len(payload['series'])))


if __name__ == '__main__':
    render()
