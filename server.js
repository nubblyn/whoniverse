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

const port = process.env.PORT || 7000;
const router = getRouter(addonInterface);

http.createServer((req, res) => {
  const path = (req.url || '/').split('?')[0];

  // Vercel serves public/ statically; locally we have to do it ourselves.
  if (path.startsWith('/art/')) {
    const file = pathMod.join(__dirname, 'public', path);
    if (fsp.existsSync(file)) {
      const ext = pathMod.extname(file).toLowerCase();
      const types = { '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg' };
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
      res.end(fsp.readFileSync(file));
      return;
    }
  }

  if (path === '/' || path === '/index.html' || path === '/configure') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(landingPage(manifest, `http://127.0.0.1:${port}`));
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
