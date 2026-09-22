// Local development server: the Vercel handler in api/index.js, run under
// node's own http server so the addon and the site can be tested without a
// deploy.
//
// Named server.js rather than index.js because Vercel serves root files
// statically, and an index.js at the project root is picked up as the document
// for "/", shadowing the handler and returning this file's source as text.
//
// It adds only what Vercel does outside the handler: files under public/ are
// served as they are. Every route lives in api/index.js, so the two cannot
// drift apart. The dev server caches data/*.js like any require(), so restart
// it after changing data.

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const handler = require('./api/index');
const { manifest } = require('./lib/addon');
const { playableSeries, toSeriesMeta } = require('./lib/catalog');

const port = process.env.PORT || 7000;
const PUBLIC = path.join(__dirname, 'public');
const TYPES = {
  '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.html': 'text/html; charset=utf-8',
};

http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  const file = path.join(PUBLIC, url);
  if (file.startsWith(PUBLIC + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) {
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(fs.readFileSync(file));
    return;
  }
  // The handler builds the install link from the forwarded protocol, which
  // Vercel sets and a plain local request does not.
  req.headers['x-forwarded-proto'] = 'http';
  handler(req, res);
}).listen(port, () => {
  const counts = playableSeries().map((s) => `${s.name} (${toSeriesMeta(s).videos.length})`).join(', ');
  console.log(`Whoniverse ${manifest.version} on http://localhost:${port}`);
  console.log(`Serving: ${counts || 'nothing yet'}`);
  console.log(`Install: http://127.0.0.1:${port}/manifest.json`);
});
