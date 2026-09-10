#!/usr/bin/env python3
"""Render the ledger as a single HTML page that looks like the sheet.

    python ledger/viewer.py

Writes out/ledger.html. Open it locally, or publish it as an artifact to read
the catalogue without opening Google Sheets.
"""
import base64
import html
import io
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import build  # noqa: E402

OUT = os.path.join(HERE, 'out')
DOWNLOADS = os.path.join(os.path.expanduser('~'), 'Downloads')
FOLDER = {
    'classic-who': '1. Classic Who',
    'wilderness-years': '2. Wilderness Years',
    'the-movie': '3. Doctor Who - The Movie',
    'torchwood': '4. Torchwood ✅',
    'sarah-jane': '5. The Sarah Jane Adventures ✅',
    'class': '6. Class ✅',
    'war-between-land-and-sea': '7. The War Between the Land and the Sea ✅',
}
_still_cache = {}


def still(series_key, file_name):
    """A tiny inline copy of the episode still, so the page carries its own
    pictures. The full 1280x720 versions live beside the videos."""
    if not file_name or series_key not in FOLDER:
        return ''
    if (series_key, file_name) in _still_cache:
        return _still_cache[(series_key, file_name)]
    root = os.path.join(DOWNLOADS, FOLDER[series_key])
    found = ''
    for dirpath, _, names in os.walk(root):
        if file_name + '.jpg' in names:
            found = os.path.join(dirpath, file_name + '.jpg')
            break
    data = ''
    if found:
        try:
            from PIL import Image
            im = Image.open(found).convert('RGB')
            im.thumbnail((160, 90))
            buf = io.BytesIO()
            im.save(buf, 'WEBP', quality=68, method=4)
            data = 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()
        except Exception:
            data = ''
    _still_cache[(series_key, file_name)] = data
    return data
SWATCH = {
    'Main Show': 'main', 'Special': 'spec', 'Minisode': 'mini',
    'Animated Series': 'anim', 'Prequel': 'preq',
    'Animated Restoration': 'anim', 'Movie': 'main',
}

CSS = """
:root{
  --ground:#f6f7fa; --surface:#fff; --surface-2:#eef1f6; --ink:#13171e;
  --ink-2:#4d5768; --ink-3:#7b8698; --line:#dce1ea; --line-2:#c6cedc;
  --accent:#1e4bb8; --accent-soft:#e7edfb;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --ground:#0d1015; --surface:#161b23; --surface-2:#1d232d; --ink:#e7ebf2;
  --ink-2:#9aa6b8; --ink-3:#7b8698; --line:#242c38; --line-2:#333d4d;
  --accent:#84a6ff; --accent-soft:#182440;
}}
:root[data-theme="dark"]{
  --ground:#0d1015; --surface:#161b23; --surface-2:#1d232d; --ink:#e7ebf2;
  --ink-2:#9aa6b8; --ink-3:#7b8698; --line:#242c38; --line-2:#333d4d;
  --accent:#84a6ff; --accent-soft:#182440;
}
*{box-sizing:border-box}
html{height:100%}
body{background:var(--ground);color:var(--ink);
  font-family:"IBM Plex Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased;
  height:100%;display:flex;flex-direction:column}
.top{flex:0 0 auto;background:var(--ground);
  border-bottom:1px solid var(--line);padding:18px 22px 0}
h1{font-family:Newsreader,Georgia,serif;font-weight:600;font-size:25px;margin:0;
  letter-spacing:-.01em}
.sub{color:var(--ink-2);font-size:13px;margin:4px 0 0}
.bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:14px 0 0}
.tabs{display:flex;flex-wrap:wrap;gap:2px;flex:1;min-width:260px}
.tab{border:1px solid transparent;border-bottom:none;background:none;color:var(--ink-2);
  font:inherit;font-size:12.5px;padding:7px 11px;border-radius:4px 4px 0 0;cursor:pointer;
  white-space:nowrap}
.tab:hover{background:var(--surface-2);color:var(--ink)}
.tab[aria-selected="true"]{background:var(--surface);border-color:var(--line);
  color:var(--ink);font-weight:600;margin-bottom:-1px;padding-bottom:8px}
.tab .n{color:var(--ink-3);font-variant-numeric:tabular-nums;font-weight:400;margin-left:5px}
input[type=search]{font:inherit;font-size:13px;padding:6px 10px;border-radius:5px;
  border:1px solid var(--line-2);background:var(--surface);color:var(--ink);width:210px}
input[type=search]:focus{outline:2px solid var(--accent);outline-offset:1px}
.count{font-size:12px;color:var(--ink-3);font-variant-numeric:tabular-nums;white-space:nowrap}
.pane{flex:1 1 auto;min-height:0;display:flex;padding:0 22px}
.tw{flex:1 1 auto;min-height:0;overflow:auto;border:1px solid var(--line);
  border-top:none;background:var(--surface)}
table{border-collapse:separate;border-spacing:0;width:100%;font-size:13px}
thead th{position:sticky;top:0;z-index:20;background:var(--surface-2);text-align:left;
  font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-3);
  font-weight:600;padding:9px 12px;border-bottom:1px solid var(--line-2);white-space:nowrap}
td{padding:5px 12px;border-bottom:1px solid var(--line);vertical-align:middle;color:var(--ink)}
tbody tr:last-child td{border-bottom:none}
td.num{font-variant-numeric:tabular-nums;color:var(--ink-2);width:52px;
  background:var(--surface-2);text-align:right}
td.file{font-family:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:11.5px;color:var(--ink-3);white-space:nowrap}
td.src{font-size:12px;color:var(--ink-2);white-space:nowrap}
td.still{width:92px;padding:3px 8px}
td.still img{display:block;width:84px;height:47px;object-fit:cover;border-radius:3px;
  background:var(--surface-2)}
td.still span{display:block;width:84px;height:47px;border-radius:3px;
  background:var(--surface-2);border:1px dashed var(--line-2)}
td.when{font-variant-numeric:tabular-nums;color:var(--ink-3);white-space:nowrap;font-size:12px}
td.desc{color:var(--ink-2);font-size:12.5px;min-width:280px;max-width:420px}
td.desc em{color:var(--ink-3);font-style:normal;opacity:.7}
td.have{font-size:12px;white-space:nowrap;font-variant-numeric:tabular-nums}
td.have.ok{color:#1d6b46}td.have.missing{color:#a3402f}
td.have.below,td.have.cadence{color:#8a5a12}td.have.upscale{color:#1f5b8f}
.tag{font-size:10px;letter-spacing:.05em;text-transform:uppercase;margin-left:7px;
  padding:1px 5px;border-radius:2px;border:1px solid currentColor;opacity:.85}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --c-ok:#79c9a0;--c-warn:#e0b169;--c-up:#7fb2e8;--c-miss:#e9897c}
  :root:not([data-theme="light"]) td.have.ok{color:var(--c-ok)}
  :root:not([data-theme="light"]) td.have.missing{color:var(--c-miss)}
  :root:not([data-theme="light"]) td.have.below,
  :root:not([data-theme="light"]) td.have.cadence{color:var(--c-warn)}
  :root:not([data-theme="light"]) td.have.upscale{color:var(--c-up)}}
:root[data-theme="dark"] td.have.ok{color:#79c9a0}
:root[data-theme="dark"] td.have.missing{color:#e9897c}
:root[data-theme="dark"] td.have.below,:root[data-theme="dark"] td.have.cadence{color:#e0b169}
:root[data-theme="dark"] td.have.upscale{color:#7fb2e8}
td.cell{color:#1a1d22}
.main{background:#b6d7a8}.spec{background:#f4cccc}.mini{background:#a4c2f4}
.anim{background:#f9cb9c}.preq{background:#ffe599}.gone{background:#b4a7d6}
td.cell.empty{background:transparent}
.why{color:#3a3340;font-size:12px}
tr.hide{display:none}
.none{padding:22px;color:var(--ink-3);font-size:13px}
.legend{display:flex;flex-wrap:wrap;gap:14px;padding:12px 0 0;font-size:11.5px;color:var(--ink-2)}
.legend span{display:flex;align-items:center;gap:6px}
.legend i{width:13px;height:13px;border-radius:2px;border:1px solid rgba(0,0,0,.12);display:block}
footer{flex:0 0 auto;padding:12px 22px 16px;color:var(--ink-3);font-size:12px;max-width:82ch}
@media (max-width:640px){.pane,.top,footer{padding-left:12px;padding-right:12px}}
"""

JS = """
var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));
var panes = Array.prototype.slice.call(document.querySelectorAll('.pane'));
var box = document.getElementById('q');
var count = document.getElementById('count');
function shown(){
  var pane = panes.filter(function(p){ return !p.hidden; })[0];
  if (!pane) return;
  var rows = pane.querySelectorAll('tbody tr');
  var n = 0;
  for (var i = 0; i < rows.length; i++) if (!rows[i].classList.contains('hide')) n++;
  count.textContent = n + (n === 1 ? ' row' : ' rows');
}
function select(key){
  tabs.forEach(function(t){ t.setAttribute('aria-selected', String(t.dataset.key === key)); });
  panes.forEach(function(p){ p.hidden = p.dataset.key !== key; });
  filter();
}
function filter(){
  var q = box.value.trim().toLowerCase();
  panes.forEach(function(p){
    if (p.hidden) return;
    var rows = p.querySelectorAll('tbody tr');
    for (var i = 0; i < rows.length; i++)
      rows[i].classList.toggle('hide', q !== '' && rows[i].dataset.s.indexOf(q) === -1);
  });
  shown();
}
tabs.forEach(function(t){ t.addEventListener('click', function(){ select(t.dataset.key); }); });
box.addEventListener('input', filter);
shown();
"""


def esc(s):
    return html.escape(str(s), quote=True)


def render():
    tabs, series, allwho = build.load()
    errs = build.validate(tabs, series, allwho)
    if errs:
        sys.exit('ledger does not check out, run build.py to see why')
    build.number(tabs, series)

    by_tab = {t['key']: t for t in tabs}
    lookup = {}
    for t in tabs:
        for r in series[t['key']]:
            lookup[(t['key'], r['season'], r['category'], r['title'])] = r
    running = {}
    all_rows = []
    for a in allwho:
        src = lookup[(a['series'], a['season'], a['category'], a['title'])]
        key = (a['series'], a['season'])
        if a['season'] != '-' and key not in running:
            running[key] = len(running) + 1
        row = dict(src)
        row['sn'] = running.get(key) if a['season'] != '-' else None
        row['from'] = by_tab[a['series']]['name'].replace(' ✅', '')
        all_rows.append(row)

    views = []
    for t in tabs:
        rows = [dict(r, sn=(None if r['season'] == '-' else int(r['season']))) for r in series[t['key']]]
        views.append((t['key'], t['name'].replace(' ✅', ''), t, rows, False))
    views.append(('all-who', 'All Who',
                  dict(key='all-who', name='All Who', numbered=True, cats=build.CATEGORY_ORDER),
                  all_rows, True))

    parts = []
    for key, name, tab, rows, is_all in views:
        head = ['<th>Sn.</th><th>Ep.</th>'] if tab['numbered'] else ['<th>Movie</th>']
        if not is_all:
            head.append('<th>Still</th>')
        if tab['numbered']:
            head.append('<th>Title</th><th>Category</th>')
        if not is_all:
            head.append('<th>Aired</th><th>Description</th>')
        if is_all:
            head.append('<th>Series</th>')
        head.append('<th>File name</th>')
        if not is_all:
            head.append('<th>Best available</th><th>We have</th>')
        body = []
        for r in rows:
            gone = r['status'] == 'missing'
            cls = 'gone' if gone else SWATCH[r['category']]
            title = esc(r['title'])
            if gone:
                title += ' <span class="why">&#9888;&#65039; (' + esc(r['note']) + ')</span>'
            fn = ''
            if r.get('ep') is not None:
                text = build.cell_text(r)
                fn = (build.slug(text) if not tab['numbered']
                      else 'S%02d_E%02d_%s' % (int(r['season']), r['ep'], build.slug(text)))
            search = (str(r['title']) + ' ' + r['category'] + ' ' + fn + ' ' +
                      (r.get('from') or '') + ' ' + (r['note'] or '') + ' ' +
                      (r.get('ceiling') or '') + ' ' +
                      (r.get('have') or 'not downloaded') + ' ' +
                      build.quality(r, tab['key'])[0]).lower()
            tds = []
            if not is_all:
                img = still(tab['key'], fn)
                tds.append('<td class="still">%s</td>'
                           % ('<img loading="lazy" alt="" src="%s">' % img if img else '<span></span>'))
            if tab['numbered']:
                tds.append('<td class="num">%s</td><td class="num">%s</td>'
                           % (r['sn'] if r['sn'] is not None else '', r['ep'] or ''))
                tds.append('<td class="cell %s">%s</td>' % (cls, title))
                tds.append('<td class="cell %s">%s</td>' % (cls, esc(r['category'])))
            else:
                tds.append('<td class="cell %s">%s</td>' % (cls, title))
            if not is_all:
                tds.append('<td class="when">%s</td>' % esc(r.get('released') or ''))
                d = r.get('description') or ''
                tds.append('<td class="desc">%s</td>'
                           % (esc(d) if d else '<em>not written yet</em>'))
            if is_all:
                tds.append('<td>%s</td>' % esc(r['from']))
            tds.append('<td class="file">%s</td>' % esc(fn))
            if not is_all:
                tds.append('<td class="src">%s</td>' % esc(r.get('ceiling') or ''))
                got = r.get('have') or ''
                status, why = build.quality(r, tab['key'])
                tag = ('' if status == 'ok'
                       else '<span class="tag">%s</span>' % esc(status))
                tds.append('<td class="have %s" title="%s">%s%s</td>'
                           % (status, esc(why), esc(got) or 'not downloaded', tag))
            body.append('<tr data-s="%s">%s</tr>' % (esc(search), ''.join(tds)))
        parts.append(
            '<div class="pane" data-key="%s"%s><div class="tw"><table>'
            '<thead><tr>%s</tr></thead><tbody>%s</tbody></table></div></div>'
            % (key, '' if key == views[0][0] else ' hidden', ''.join(head), ''.join(body)))

    buttons = ''.join(
        '<button class="tab" data-key="%s" aria-selected="%s">%s<span class="n">%d</span></button>'
        % (k, 'true' if k == views[0][0] else 'false', esc(n), len(rows))
        for k, n, t, rows, is_all in views)
    legend = ''.join('<span><i class="%s"></i>%s</span>' % (c, esc(n)) for n, c in [
        ('Main Show', 'main'), ('Special', 'spec'), ('Minisode', 'mini'),
        ('Animated', 'anim'), ('Prequel', 'preq'), ('No source', 'gone')])
    legend += ('<span style="margin-left:6px;color:var(--ink-3)">We have:</span>'
               '<span style="color:#1d6b46">ok</span>'
               '<span style="color:#8a5a12">below / cadence</span>'
               '<span style="color:#1f5b8f">upscale</span>'
               '<span style="color:#a3402f">missing</span>')
    total = sum(len(series[t['key']]) for t in tabs)
    held = sum(1 for t in tabs for r in series[t['key']] if r.get('have'))

    page = (
        '<title>Whoniverse Ledger</title>\n'
        '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
        'family=Newsreader:opsz,wght@6..72,600&family=IBM+Plex+Mono:wght@400&'
        'family=IBM+Plex+Sans:wght@400;600&display=swap">\n'
        '<style>%s</style>\n'
        '<div class="top"><h1>Whoniverse Ledger</h1>'
        '<p class="sub">%d items across eight series, %d of them downloaded, and %d rows in the combined running order. '
        'Built from the ledger in the repo, which is the source the Google Sheet is published from.</p>'
        '<div class="legend">%s</div>'
        '<div class="bar"><div class="tabs">%s</div>'
        '<input type="search" id="q" placeholder="Filter this tab" aria-label="Filter rows">'
        '<span class="count" id="count"></span></div></div>\n'
        '%s\n'
        '<footer>Purple rows have no legitimate source and carry the reason inline. '
        'Everything else is expected to be downloadable. File names are generated from the '
        'season, episode and title, and are what the media files are matched on.</footer>\n'
        '<script>%s</script>\n'
    ) % (CSS, total, held, len(all_rows), legend, buttons, ''.join(parts), JS)

    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, 'ledger.html')
    with open(path, 'w', encoding='utf8', newline='\n') as fh:
        fh.write(page)
    print('  %d rows across %d tabs' % (total + len(all_rows), len(views)))
    print('  wrote %s (%.0f KB)' % (path, os.path.getsize(path) / 1024))


if __name__ == '__main__':
    render()
