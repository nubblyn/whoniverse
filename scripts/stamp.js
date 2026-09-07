// Record when this build happened.
//
// Runs as Vercel's build step (npm run build), so the ticker's "Updated" is
// the date the catalogue was last deployed rather than the time of the request.
// The file is gitignored; locally the page falls back to today.

const fs = require('node:fs');
const path = require('node:path');

const file = path.join(__dirname, '..', 'data', 'updated.json');
fs.writeFileSync(file, JSON.stringify({ updated: new Date().toISOString() }) + '\n');
console.log('stamped', new Date().toISOString());
