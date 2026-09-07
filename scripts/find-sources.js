// Search indexers for an episode and rank the releases.
//
// Torrentio is the indexer here. It is a public Stremio addon, so its stream
// endpoint is already a free search API over the trackers it aggregates: no
// key, no account, and it answers with everything a pick needs — infohash,
// the exact filename inside the torrent, its index, seeders, size and tracker.
//
// This runs at build time, not per request. It proposes; you dispose. The
// output is meant to be eyeballed and overridden before it reaches data/.
//
//   node scripts/find-sources.js tt0436992 1 1
//   node scripts/find-sources.js tt0436992 1 1 --json
//   node scripts/find-sources.js tt0436992 1 1 --quality 2160p

const BASE = 'https://torrentio.strem.fun';

// Release groups worth trusting, best first. Scores are additive, so a group
// listed here beats an unknown one at equal quality without overriding a big
// difference in seeders.
const PREFERRED_GROUPS = ['KONTRAST', 'QxR', 'OFT', 'NTb', 'FLUX', 'RARBG'];

const QUALITY_RANK = { '2160p': 5, '4k': 5, '1080p': 4, '720p': 3, '576p': 2, '480p': 1 };

/**
 * Torrentio splits a release across two fields, both newline-separated — not
 * pipes, which is easy to get wrong because clients render them on one line.
 *
 *   name:  "Torrentio\n1080p"
 *   title: "<torrent name>\n<path inside torrent>\n👤 244 💾 739.45 MB ⚙️ EZTV"
 *
 * The middle line is absent on single-file torrents. `behaviorHints.filename`
 * carries the same filename directly and is always present, so prefer it over
 * reading it back out of the title.
 */
function parseStream(s) {
  const quality = (s.name || '').split('\n')[1]?.trim().toLowerCase() || '';
  const lines = (s.title || '').split('\n').map((p) => p.trim()).filter(Boolean);

  const stats = lines.find((p) => p.includes('👤') || p.includes('💾')) || '';
  const release = lines[0] || '';
  const filename = s.behaviorHints?.filename || '';

  const seeders = Number((/👤\s*(\d+)/.exec(stats) || [])[1] || 0);
  const sizeMatch = /💾\s*([\d.]+)\s*(GB|MB)/i.exec(stats);
  let sizeGB = 0;
  if (sizeMatch) {
    sizeGB = Number(sizeMatch[1]) / (sizeMatch[2].toUpperCase() === 'MB' ? 1024 : 1);
  }
  const tracker = (/⚙️\s*(.+)$/.exec(stats) || [])[1] || '';

  // Read the group off the filename rather than the torrent name: a season
  // pack is often named without its group, while the files inside carry it.
  const tag = filename || release;
  const group =
    (/-([A-Za-z0-9]{2,})\.(?:mkv|mp4|avi)$/i.exec(tag) || [])[1] ||
    (/-([A-Za-z0-9]{2,})\s*$/.exec(release) || [])[1] ||
    (/\[([A-Za-z0-9]{2,})\]/.exec(tag) || [])[1] ||
    '';

  // A pack names a season without an episode. Torrentio still points fileIdx at
  // the right file, and packs tend to be better cached on debrid because many
  // people pulled the whole season — so this is recorded, not penalised.
  const isPack = !/S\d{1,2}\s*E\d{1,2}/i.test(release) &&
    /\bS\d{1,2}\b|season|complete|collection/i.test(release);

  return {
    infoHash: s.infoHash,
    fileIdx: s.fileIdx ?? 0,
    quality, release, filename, seeders, sizeGB, tracker, group, isPack,
  };
}

/**
 * Does the chosen file actually look like the episode asked for?
 *
 * Torrentio will happily return an Extras or Bonus disc whose fileIdx points at
 * something that is not the episode at all. Without this check that pack can
 * outrank every real release, which is exactly what happened on the first run.
 */
function matchesEpisode(r, season, episode) {
  const hay = r.filename || r.release;
  if (/\b(extras?|bonus|sample|trailer|featurette|deleted)\b/i.test(hay)) return false;
  // A single-file torrent naming the episode in the torrent title is fine.
  const pat = new RegExp(`s0?${season}\\s*[.\\-_ ]?\\s*e0?${episode}(?!\\d)`, 'i');
  if (pat.test(hay)) return true;
  // Some packs use "1x01" or a bare "Episode 1" inside a season folder.
  if (new RegExp(`\\b${season}x0?${episode}(?!\\d)`, 'i').test(hay)) return true;
  // No episode marker anywhere means we cannot verify it — treat as unknown
  // rather than reject, but score() docks it below anything verified.
  return !/s\d{1,2}\s*e\d{1,2}/i.test(hay);
}

function score(r, wantQuality, verified) {
  let n = 0;

  // A file we could not match to this episode is usable, but never preferred
  // over one we could.
  if (!verified) n -= 60;

  // Quality first: an exact match on what was asked for outranks everything.
  if (wantQuality) n += r.quality === wantQuality ? 100 : -40;
  n += (QUALITY_RANK[r.quality] || 0) * 10;

  const gi = PREFERRED_GROUPS.findIndex((g) => g.toLowerCase() === r.group.toLowerCase());
  if (gi >= 0) n += 30 - gi * 4;

  // Seeders as a proxy for "will still exist in six months", flattened so a
  // huge swarm can't outweigh a quality gap.
  n += Math.min(Math.log10(r.seeders + 1) * 12, 30);

  // Packs tend to be cached on debrid because many people pulled the season.
  if (r.isPack) n += 8;

  // Nothing sensible is under 200MB for a 45-minute episode, or over 20GB
  // unless it is a remux nobody asked for.
  if (r.sizeGB > 0 && r.sizeGB < 0.2) n -= 50;
  if (r.sizeGB > 20) n -= 20;

  return n;
}

async function findSources(imdbId, season, episode, { quality, limit = 5 } = {}) {
  const id = `${imdbId}:${season}:${episode}`;
  const res = await fetch(`${BASE}/stream/series/${encodeURIComponent(id)}.json`);
  if (!res.ok) throw new Error(`Torrentio ${res.status} for ${id}`);

  const exact = new RegExp(
    `s0?${season}\\s*[.\\-_ ]?\\s*e0?${episode}(?!\\d)|\\b${season}x0?${episode}(?!\\d)`, 'i');

  const { streams = [] } = await res.json();
  return streams
    .filter((s) => s.infoHash)
    .map(parseStream)
    .filter((r) => matchesEpisode(r, season, episode))
    .map((r) => {
      const verified = exact.test(r.filename || r.release);
      return { ...r, verified, score: Math.round(score(r, quality, verified)) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

async function main() {
  const args = process.argv.slice(2);
  const flags = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith('--')) { positional.push(args[i]); continue; }
    // A flag takes the next token as its value, unless there isn't one or it is
    // itself a flag — then it is a boolean. Missing that last case leaves a
    // trailing `--json` set to undefined, which reads as false.
    const next = args[i + 1];
    flags[args[i].slice(2)] = next === undefined || next.startsWith('--') ? true : args[++i];
  }

  const [imdbId, season, episode] = positional;
  if (!imdbId || !season || !episode) {
    console.error('usage: node scripts/find-sources.js <imdbId> <season> <episode> [--quality 1080p] [--json]');
    process.exit(1);
  }

  const picks = await findSources(imdbId, Number(season), Number(episode), {
    quality: flags.quality ? String(flags.quality).toLowerCase() : '1080p',
    limit: flags.json ? 3 : 6,
  });

  if (flags.json) {
    // Shaped for pasting straight into an episode's `sources` array.
    console.log(JSON.stringify(
      picks.map((p) => ({
        infoHash: p.infoHash, fileIdx: p.fileIdx,
        group: p.group || null, quality: p.quality,
      })), null, 1));
    return;
  }

  console.log(`${imdbId} S${season}E${episode} — ${picks.length} ranked\n`);
  for (const p of picks) {
    console.log(`  ${String(p.score).padStart(4)}  ${p.quality.padEnd(6)} ${p.sizeGB.toFixed(2).padStart(6)}GB  ${String(p.seeders).padStart(5)}👤  ${p.isPack ? 'pack' : 'ep  '}  ${p.verified ? '✓' : '?'}  ${p.group || '—'}`);
    console.log(`        ${p.release.replace(/\s+/g, ' ').slice(0, 84)}`);
    console.log(`        ${(p.filename || '(single file)').slice(0, 84)}`);
    console.log(`        ${p.infoHash} idx=${p.fileIdx}`);
  }
}

if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });

module.exports = { findSources, parseStream, score };
