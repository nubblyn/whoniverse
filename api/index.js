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

module.exports = (req, res) => {
  const path = (req.url || '/').split('?')[0];

  if (path === '/' || path === '/index.html' || path === '/configure') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.end(landingPage(manifest, originOf(req)));
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
