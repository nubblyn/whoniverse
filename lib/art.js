// Artwork URLs.
//
// Everything here comes from Stremio's own metahub CDN, which is keyed by IMDb
// id and needs no API key. It replaces the archive.org images the addon used to
// serve: those 302 to a datanode before returning bytes, which measured ~1.9s
// per thumbnail against ~0.3s here.
//
// Episode stills are the one case worth baking out ahead of time. metahub
// answers /tt.../s/e/w780.jpg with a 301 to the underlying TMDB file, so asking
// for it live costs a redirect on every tile. `npm run art` resolves them once
// and writes the image.tmdb.org URL straight into the episode data; these
// helpers are the fallback for anything it has not resolved yet.

const IMAGES = 'https://images.metahub.space';
const EPISODES = 'https://episodes.metahub.space';

/** Series poster, 2:3. `size` is metahub's own bucket name, not pixels. */
function poster(imdbId, size = 'medium') {
  return `${IMAGES}/poster/${size}/${imdbId}/img`;
}

/** 16:9 backdrop shown behind the series detail page. */
function background(imdbId, size = 'medium') {
  return `${IMAGES}/background/${size}/${imdbId}/img`;
}

/** Transparent PNG wordmark. Stremio overlays this on the background. */
function logo(imdbId, size = 'medium') {
  return `${IMAGES}/logo/${size}/${imdbId}/img`;
}

/**
 * Episode still. Takes the *upstream* season and episode numbers, not our
 * catalog's — metahub only knows how the episode was actually numbered on IMDb.
 */
function still(imdbId, season, episode, width = 'w780') {
  return `${EPISODES}/${imdbId}/${season}/${episode}/${width}.jpg`;
}

module.exports = { poster, background, logo, still };
