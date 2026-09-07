// Doctor Who news into the Discord, once a day.
//
// Vercel runs this on a cron (see vercel.json) and it posts anything the feeds
// published since the last run to a Discord webhook. There is no database: the
// run posts what is newer than WINDOW_HOURS, which is a little longer than the
// gap between runs, so nothing is missed and a duplicate only happens if the
// endpoint is called twice by hand on the same day.
//
// The webhook URL is an environment variable, never committed: this repo is
// public and a webhook URL lets anyone post to that channel.
//
//   DISCORD_NEWS_WEBHOOK   the channel webhook to post into
//   CRON_SECRET            set by Vercel; the cron sends it as a Bearer token

const FEEDS = [
  { name: 'Doctor Who TV', url: 'https://www.doctorwhotv.co.uk/feed' },
  { name: 'Blogtor Who', url: 'https://blogtorwho.com/feed/' },
];

// Blogtor Who posts a "Video of the Day" most days. It is a YouTube embed of an
// old clip, not news, and it would be two thirds of everything this posts.
const SKIP = /^\s*(video of the day|photo of the day|competition)\b/i;

const WINDOW_HOURS = 26;
const MAX_PER_RUN = 6;

/** Text of the first <tag> in a block, stripped of CDATA and inner markup. */
function tag(block, name) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`));
  if (!m) return '';
  return m[1].replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, '').trim();
}

/** &#8211; and friends: feeds are full of them and Discord shows them raw. */
function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}

async function itemsFrom(feed) {
  const res = await fetch(feed.url, { headers: { 'User-Agent': 'whoniverse-addon' } });
  if (!res.ok) throw new Error(`${feed.name}: HTTP ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<item\b[\s\S]*?<\/item>/g)].map((m) => m[0]).map((block) => ({
    source: feed.name,
    title: decode(tag(block, 'title')),
    link: tag(block, 'link'),
    date: new Date(tag(block, 'pubDate')),
  })).filter((i) => i.title && i.link && !isNaN(i.date));
}

async function post(webhook, item) {
  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // The link on its own line lets Discord unfurl it into a preview card.
    body: JSON.stringify({
      content: `**${item.title}**\n${item.link}`,
      username: 'Doctor Who News',
      allowed_mentions: { parse: [] },
    }),
  });
  if (!res.ok) throw new Error(`webhook ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

module.exports = async (req, res) => {
  const webhook = process.env.DISCORD_NEWS_WEBHOOK;
  const secret = process.env.CRON_SECRET;

  // Vercel's cron sends the secret as a Bearer token. Without this the endpoint
  // is a public button that posts to the channel.
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    res.statusCode = 401;
    res.end('unauthorized');
    return;
  }
  if (!webhook) {
    res.statusCode = 500;
    res.end('DISCORD_NEWS_WEBHOOK is not set');
    return;
  }

  const since = Date.now() - WINDOW_HOURS * 3600 * 1000;
  const seen = new Set();
  const fresh = [];
  const failed = [];

  for (const feed of FEEDS) {
    try {
      for (const item of await itemsFrom(feed)) {
        if (item.date.getTime() < since) continue;
        if (SKIP.test(item.title)) continue;
        if (seen.has(item.link)) continue;
        seen.add(item.link);
        fresh.push(item);
      }
    } catch (err) {
      failed.push(err.message);
    }
  }

  // Oldest first, so the channel reads in the order things happened.
  fresh.sort((a, b) => a.date - b.date);
  const posting = fresh.slice(0, MAX_PER_RUN);

  for (const item of posting) {
    try {
      await post(webhook, item);
    } catch (err) {
      failed.push(err.message);
    }
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({
    posted: posting.length,
    found: fresh.length,
    skipped: fresh.length - posting.length,
    failed,
  }));
};
