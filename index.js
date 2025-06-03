const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');
const episodeData = require('./episodeData');

const NEW_WHO_SERIES_STREMIO_ID = `nucabe_new_who`;

const ADDON_LOGO_URL = "https://i.imgur.com/zQ9Btju.png";
const SERIES_POSTER_URL = "https://i.imgur.com/dTBW22b.png";
const SERIES_BACKGROUND_URL = "https://i.imgur.com/250Ix4s.jpeg";

const manifest = {
    "id": "dev.nucabe.new.who",
    "version": "1.0.0",
    "name": "New Who",
    "description": "New Who (Doctor Who 2005-Present) episodes, specials, minisodes and prequels in original UK broadcast order.",
    "logo": ADDON_LOGO_URL,
    "types": ["series"],
    "resources": [
        "catalog",
        "meta",
        "stream"
    ],
    "catalogs": [
        {
            "type": "series",
            "id": "new_who_catalog",
            "name": "New Who"
        }
    ],
    "behaviorHints": {
        "configurable": false,
        "adult": false
    }
};

const builder = new addonBuilder(manifest);

const allEpisodes = [...episodeData].sort((a, b) => {
    const dateA = new Date(a.released);
    const dateB = new Date(b.released);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    if (a.season !== b.season) return a.season - b.season;
    return a.episode - b.episode;
});

builder.defineCatalogHandler(async (args) => {
    if (args.type === 'series' && args.id === manifest.catalogs[0].id) {
        const seriesForCatalog = [{
            id: NEW_WHO_SERIES_STREMIO_ID,
            type: 'series',
            name: manifest.name,
            poster: SERIES_POSTER_URL,
            description: manifest.description,
            logo: ADDON_LOGO_URL,
            genres: ["Sci-Fi", "Adventure", "Drama"],
            releaseInfo: "2005-Present",
            runtime: "45 min",
            imdbRating: "10",
        }];
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
            name: manifest.name,
            poster: SERIES_POSTER_URL,
            background: SERIES_BACKGROUND_URL,
            logo: ADDON_LOGO_URL,
            description: manifest.description,
            releaseInfo: "2005-Present",
            genres: ["Sci-Fi", "Adventure", "Drama"],
            runtime: "45 min",
            imdbRating: "10",
            videos: allEpisodes.map(ep => {
                return {
                    id: ep.id,
                    title: ep.title,
                    season: ep.season,
                    episode: ep.episode,
                    released: ep.released,
                    overview: ep.overview,
                    thumbnail: ep.thumbnail,
                };
            })
        };
        return Promise.resolve({ meta: seriesMetaObject });
    }
    return Promise.resolve({ meta: null });
});

builder.defineStreamHandler(async (args) => {
    console.log("Stream request for:", args); // For debugging

    // args.type will be 'series'
    // args.id will be the episode ID, e.g., "tt0436992:0:6"
    if (args.type === 'series' && args.id) {
        const episode = allEpisodes.find(ep => ep.id === args.id);

        if (episode && episode.streamUrl) {
            const streams = [{
                url: episode.streamUrl,
                title: "Play (Archive.org)", // Displayed in Stremio's stream selection
                name: "Internet Archive" // Source name
            }];
            return Promise.resolve({ streams: streams });
        }
    }
    // If no stream found for this ID
    return Promise.resolve({ streams: [] });
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: port });
