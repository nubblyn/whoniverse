// Vercel serverless entry point.
//
// Same addon as index.js, reshaped from a long-running server into a request
// handler. getRouter returns a (req, res, next) router, which is exactly the
// shape Vercel wants — no express, no adapter.
//
// The episode data is require()d, so it is bundled at deploy time. Serverless
// has no persistent writable disk: changing a URL or a title means redeploying,
// not restarting.

const { getRouter } = require('stremio-addon-sdk');
const { manifest, addonInterface } = require('../lib/addon');
const { landingPage } = require('../lib/landing');
const { isSubtitlePath, serveSubtitle } = require('../lib/subtitles');
const { postNews } = require('../lib/news');
const { bucketIndex, generatedAt } = require('../lib/bucket');

const router = getRouter(addonInterface);

/**
 * The addon's own origin, derived per request rather than configured, so the
 * install link on the landing page is correct on a preview URL, on the
 * production alias and on a custom domain alike.
 */
function originOf(req) {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  return `${proto}://${host}`;
}

module.exports = async (req, res) => {
  const path = (req.url || '/').split('?')[0];

  if (path === '/' || path === '/index.html' || path === '/configure') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    // The bucket says what is really uploaded; the committed data only says
    // what a URL was written for. A failed read returns null and the page
    // falls back rather than showing everything as missing.
    res.end(landingPage(manifest, originOf(req), await bucketIndex()));
    return;
  }

  // The ledger. A static page built by ledger/viewer.py and committed to
  // public/ — the build runs node, so nothing regenerates it at deploy time.
  // Served from here rather than left to /ledger.html so the link is clean,
  // and so a missing file says so instead of falling through to the addon
  // router's JSON 404.
  // Two of them now: /ledger is the printed table from viewer.py, /ledger-v2
  // the board from v2.py. Separate scripts and separate addresses, so neither
  // can break the other.
  const LEDGERS = {
    '/ledger': ['ledger.html', 'python ledger/viewer.py'],
    '/ledger.html': ['ledger.html', 'python ledger/viewer.py'],
    '/ledger-v2': ['ledger-v2.html', 'python ledger/v2.py'],
    '/ledger-v2.html': ['ledger-v2.html', 'python ledger/v2.py'],
  };
  if (LEDGERS[path]) {
    const [name, how] = LEDGERS[path];
    const file = require('node:path').join(__dirname, '..', 'public', name);
    require('node:fs').readFile(file, (err, body) => {
      if (err) {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(`That ledger has not been built. Run: ${how}`);
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.end(body);
    });
    return;
  }

  // What the bucket holds, for the ledger page to read in the browser. Served
  // from here rather than fetched cross-origin so it shares this function's
  // cache instead of hitting B2 once per visitor.
  if (path === '/api/bucket') {
    const index = await bucketIndex();
    res.statusCode = index ? 200 : 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Access-Control-Allow-Origin', '*');
    // subtitles.json says which episodes carry an embedded track. Without it
    // the page would count only sidecar .srt files and report the Blu-ray
    // series as having no subtitles at all.
    let subs = {};
    try { subs = require('../data/subtitles.json'); } catch { /* not probed yet */ }
    res.end(JSON.stringify(index
      ? { generated: generatedAt(), count: index.size, files: [...index], subs }
      : { error: 'bucket listing unavailable' }));
    return;
  }

  // The daily news job. Vercel routes every path to this file, so the cron's
  // endpoint has to be dispatched here rather than living in its own api/ file.
  if (path === '/api/news') {
    postNews(req, res);
    return;
  }

  // Subtitles relayed from the CDN with the CORS header Stremio Web needs.
  if (isSubtitlePath(path)) {
    serveSubtitle(path, res);
    return;
  }

  router(req, res, () => {
    // The router calls next() for anything it does not recognise. Without this,
    // an unmatched path would hang until Vercel timed the function out.
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ err: 'not found' }));
  });
};
