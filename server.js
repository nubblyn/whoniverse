// Local development server.
//
// Named server.js rather than index.js because Vercel serves root files
// statically, and an index.js at the project root is picked up as the document
// for "/" — shadowing the rewrite and returning this file's source as text.
//
// Vercel does not run this file — it uses api/index.js, which serves the same
// addon and the same landing page as a request handler. This exists so both
// can be run and tested without deploying.

const http = require('node:http');
const fsp = require('node:fs');
const pathMod = require('node:path');
const { getRouter } = require('stremio-addon-sdk');
const { manifest, addonInterface } = require('./lib/addon');
const { landingPage } = require('./lib/landing');
const { playableSeries, toSeriesMeta } = require('./lib/catalog');
const { isSubtitlePath, serveSubtitle } = require('./lib/subtitles');
const { bucketIndex, generatedAt } = require('./lib/bucket');

const port = process.env.PORT || 7000;
const router = getRouter(addonInterface);

http.createServer(async (req, res) => {
  const path = (req.url || '/').split('?')[0];

  // Vercel serves public/ statically; locally we have to do it ourselves.
  // /fonts/ belongs here as much as /art/ — without it the page falls back to
  // a system face locally and every spacing judgement is made against the
  // wrong metrics.
  if (path.startsWith('/art/') || path.startsWith('/fonts/')) {
    const file = pathMod.join(__dirname, 'public', path);
    if (fsp.existsSync(file)) {
      const ext = pathMod.extname(file).toLowerCase();
      const types = {
        '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
        '.jpg': 'image/jpeg', '.woff2': 'font/woff2',
      };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      res.end(fsp.readFileSync(file));
      return;
    }
  }

  // The ledger, matching api/index.js so the links work locally too: the board
  // from ledger/board.py at /ledger, and the old /ledger-v2 address redirected
  // to it now that the board is the only ledger.
  if (path === '/ledger-v2' || path === '/ledger-v2.html') {
    res.writeHead(301, { Location: '/ledger' });
    res.end();
    return;
  }
  const LEDGERS = {
    '/ledger': ['ledger.html', 'python ledger/board.py'],
    '/ledger.html': ['ledger.html', 'python ledger/board.py'],
  };
  if (LEDGERS[path]) {
    const [name, how] = LEDGERS[path];
    const file = pathMod.join(__dirname, 'public', name);
    if (!fsp.existsSync(file)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`That ledger has not been built. Run: ${how}`);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(fsp.readFileSync(file));
    return;
  }

  if (path === '/' || path === '/index.html' || path === '/configure') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(landingPage(manifest, `http://127.0.0.1:${port}`, await bucketIndex()));
    return;
  }

  if (path === '/api/bucket') {
    const index = await bucketIndex();
    res.writeHead(index ? 200 : 503, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    });
    let subs = {};
    try { subs = require('./data/subtitles.json'); } catch { /* not probed yet */ }
    res.end(JSON.stringify(index
      ? { generated: generatedAt(), count: index.size, files: [...index], subs }
      : { error: 'bucket listing unavailable' }));
    return;
  }

  if (isSubtitlePath(path)) {
    serveSubtitle(path, res);
    return;
  }

  router(req, res, () => {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ err: 'not found' }));
  });
}).listen(port, () => {
  const counts = playableSeries()
    .map((s) => `${s.name} (${toSeriesMeta(s).videos.length})`)
    .join(', ');
  console.log(`Whoniverse ${manifest.version} on http://localhost:${port}`);
  console.log(`Serving: ${counts || 'nothing yet'}`);
  console.log(`Landing: http://127.0.0.1:${port}/`);
  console.log(`Install: http://127.0.0.1:${port}/manifest.json`);
});
