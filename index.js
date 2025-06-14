const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const allNewWhoEpisodesPreSorted = require('./episodeData');

// --- IDs for your series items ---
const NEW_WHO_SERIES_STREMIO_ID = `whoniverse_new_who`;

// --- URLs ---
const ADDON_LOGO_URL = "https://i.imgur.com/zQ9Btju.png";
const NEW_WHO_SERIES_POSTER_URL = "https://i.imgur.com/dTBW22b.png";
const NEW_WHO_SERIES_BACKGROUND_URL = "https://i.imgur.com/250Ix4s.jpeg";

const manifest = {
  "id": "community.whoniverse.addon",
  "version": "1.1.2", // Bumping version for display improvement
  "name": "Whoniverse",
  "description": "The complete Doctor Who universe, including Classic and New Who episodes, specials, minisodes, prequels, and spinoffs in original UK broadcast order.",
  "logo": ADDON_LOGO_URL,
  "types": ["series"],
  "resources": ["catalog", "meta", "stream"],
  "catalogs": [
    {
      "type": "series",
      "id": "whoniverse_catalog",
      "name": "Whoniverse"
    }
  ],
  "behaviorHints": {
    "configurable": false,
    "adult": false
  },
  "stremioAddonsConfig": {
    "issuer": "https://stremio-addons.net",
    "signature": "eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2In0..gTvVWDhy-2sJkHP0suaDVg.DyQoj_Hr8tq-zvSJIfx8JeK_s1DCI81ypxyouv5fyGVktTkJMQsnxTlX8m3XF4Vbtf0nqvGAT7JsdvZNvxLscbof-YSRxelrWMl89X95jAE7M7z7wFXD2nid_rg0fY-C.GauSecXP5voj_lhR6K0Nkg"
  }
};

const builder = new addonBuilder(manifest);

const allNewWhoEpisodes = [...allNewWhoEpisodesPreSorted].sort((a, b) => {
    const dateA = new Date(a.released);
    const dateB = new Date(b.released);
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        console.warn('Invalid date found during sort:', a.released, b.released);
        return 0;
    }
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    if (a.season !== b.season) return a.season - b.season;
    return a.episode - b.episode;
});

builder.defineCatalogHandler(async (args) => {
    if (args.type === 'series' && args.id === manifest.catalogs[0].id) {
        const seriesForCatalog = [
            {
                id: NEW_WHO_SERIES_STREMIO_ID,
                type: 'series',
                name: "New Who",
                poster: NEW_WHO_SERIES_POSTER_URL,
                description: "The revival of Doctor Who, chronicling the adventures of the Doctor from 2005 onwards.",
                logo: ADDON_LOGO_URL,
                genres: ["Sci-Fi", "Adventure", "Drama"],
                releaseInfo: "2005-Present",
            }
        ];
        return Promise.resolve({ metas: seriesForCatalog });
    } else {
        return Promise.resolve({ metas: [] });
    }
});

builder.defineMetaHandler(async (args) => {
    if (args.type === 'series' && args.id === NEW_WHO_SERIES_STREMIO_ID) {
        const seriesMetaObject = {
            id: NEW_WHO_SERIES_STREMIO_ID,
            type: 'series',
            name: "New Who",
            poster: NEW_WHO_SERIES_POSTER_URL,
            background: NEW_WHO_SERIES_BACKGROUND_URL,
            logo: ADDON_LOGO_URL,
            description: "The revival of Doctor Who, chronicling the adventures of the Doctor from 2005 onwards. Includes main episodes, specials, minisodes, and prequels in chronological viewing order.",
            releaseInfo: "2005-Present",
            genres: ["Sci-Fi", "Adventure", "Drama"],
            videos: allNewWhoEpisodes.map(ep => {
                const videoId = `${NEW_WHO_SERIES_STREMIO_ID}:${ep.season}:${ep.episode}`;
                return {
                    id: videoId,
                    title: ep.title,
                    season: ep.season,
                    episode: ep.episode,
                    released: ep.released,
                    overview: ep.overview,
                    thumbnail: ep.thumbnail || ADDON_LOGO_URL,
                    available: !!ep.streamUrl
                };
            })
        };
        return Promise.resolve({ meta: seriesMetaObject });
    }
    return Promise.resolve({ meta: null });
});

// THIS IS THE RELEVANT SECTION
builder.defineStreamHandler(async (args) => {
    console.log("Stream request for ID:", args.id, "Type:", args.type);

    if (args.type === 'series' && args.id) {
        const [seriesId, seasonStr, episodeStr] = args.id.split(':');
        
        if (seriesId !== NEW_WHO_SERIES_STREMIO_ID) {
            return Promise.resolve({ streams: [] });
        }
        
        const season = parseInt(seasonStr, 10);
        const episodeNum = parseInt(episodeStr, 10);

        const episode = allNewWhoEpisodes.find(ep => ep.season === season && ep.episode === episodeNum);

        if (episode && episode.streamUrl) {
            const subtitles = [];
            if (episode.subtitleUrl) {
                subtitles.push({
                    id: 'archive_en_sub',
                    url: episode.subtitleUrl,
                    lang: 'en'
                });
            }

            const stream = {
                url: episode.streamUrl,
                name: "Play",
                subtitles: subtitles
            };
            
            return Promise.resolve({ streams: [stream] });

        } else {
            console.log("No episode or streamUrl found for ID:", args.id);
        }
    }
    return Promise.resolve({ streams: [] });
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: port });
console.log(`Whoniverse Addon active on http://localhost:${port}`);
console.log(`Install by copying this URL to Stremio's Addon search bar: http://127.0.0.1:${port}/manifest.json`);
