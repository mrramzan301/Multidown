const express = require('express');
const axios = require('axios');
const crypto = require('crypto'); // Random name generate karne ke liye built-in module
const app = express();

app.use(express.json());

// CORS Setup
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// 100+ Supported Websites List
const SUPPORTED_PLATFORMS = [
    "YouTube (Videos & Shorts)", "TikTok (No Watermark)", "Instagram (Reels, Stories, Posts)", "Facebook (Videos & Watch)", 
    "Twitter (X Videos)", "Snapchat Spotlight", "Pinterest (Video Pins)", "Reddit (With Audio)", "LinkedIn Videos", 
    "Vimeo", "Twitch (Clips & VODs)", "DailyMotion", "SoundCloud", "Bandcamp", "Spotify (Podcasts)", "Tumblr Video", 
    "Imgur Video", "Flickr Video", "Bilibili", "Douyin", "Kuaishou", "CapCut Templates", "Likee", "ShareChat", 
    "Moj Video", "Josh App", "Chingari", "Roposo", "Mitron", "MX TakaTak", "Voot", "Hotstar", "Zee5", 
    "SonyLIV", "JioCinema", "AltBalaji", "ErosNow", "Ullu", "Kumu", "Triller", "Dubsmash", "Byte", 
    "Firework", "Funimate", "Chico", "Zili", "Lasso", "BoloIndya", "Rizzle", "Glance", "Rumbler", 
    "BitChute", "Odysee", "Brighteon", "Utreon", "Gab TV", "NewTube", "Rumble", "Veoh", "Metacafe", 
    "Break", "FunnyOrDie", "LiveLeak", "WorldStarHipHop", "9GAG Video", "CollegeHumor", "Dailymotion", 
    "Crackle", "PopcornFlix", "Tubi TV", "Pluto TV", "IMDb Trailers", "TED Talks", "Khan Academy Videos", 
    "Coursera Videos", "Udemy Previews", "Twitch VODs", "Kick Clips", "Trovo Live", "Mildom", "OpenSea Media", 
    "Rarible Preview", "LooksRare Media", "Mintable Video", "SuperRare Animation", "Foundation Video", 
    "Audiomack", "Mixcloud", "Hearthis.at", "Freesound", "ReverbNation", "Spreaker", "Podbean", "Anchor.fm", 
    "Buzzsprout", "Blubrry", "Libsyn", "SoundClick", "DatPiff", "Livemixtapes", "MixTapeFactory", "MyMixtapez"
];

// 1. /support Endpoint
app.get('/support', (req, res) => {
    return res.status(200).json({
        status: "success",
        developer: "Dev Ramzan Ahsan",
        whatsapp_group: "https://chat.whatsapp.com/LYqp196iG0E0H5QtPR3ogZ",
        total_supported: SUPPORTED_PLATFORMS.length,
        supported_websites: SUPPORTED_PLATFORMS
    });
});

// 2. Main Fetch & Mix Endpoint
app.get('/', async (req, res) => {
    const videoUrl = req.query.url;
    
    if (!videoUrl) {
        return res.status(400).json({ 
            error: "Please provide a 'url' parameter. Example: /?url=VIDEO_URL" 
        });
    }

    const fetchEndpoint = "https://savemedia.site/api/fetch.php";
    const headers = {
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36'
    };

    try {
        const fetchRes = await axios.post(fetchEndpoint, { url: videoUrl }, { headers, timeout: 10000 });
        const metaData = fetchRes.data;

        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const baseUrl = `${protocol}://${req.get('host')}`;

        let cleanFormats = [];
        if (metaData.formats && Array.isArray(metaData.formats)) {
            cleanFormats = metaData.formats.map(f => {
                const formatParam = f.format_id === 'best' ? 'best' : f.format_id;
                const extParam = f.ext || 'mp4';
                return {
                    quality: f.quality || "Standard",
                    type: f.type || "video",
                    extension: extParam,
                    download_url: `${baseUrl}/download-file?url=${encodeURIComponent(videoUrl)}&format=${formatParam}&ext=${extParam}`
                };
            });
        }

        const customResponse = {
            status: "success",
            developer: "Dev Ramzan Ahsan",
            join_group: "https://chat.whatsapp.com/LYqp196iG0E0H5QtPR3ogZ",
            video_info: {
                title: metaData.title || metaData.description || "Video File",
                thumbnail: metaData.thumbnail || metaData.cover || metaData.image || null,
                uploader: metaData.uploader || metaData.author_name || "Unknown Uploader",
                original_url: videoUrl,
                available_formats: cleanFormats
            }
        };

        return res.status(200).json(customResponse);

    } catch (error) {
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const baseUrl = `${protocol}://${req.get('host')}`;
        
        return res.status(200).json({
            status: "partial_success",
            developer: "Dev Ramzan Ahsan",
            join_group: "https://chat.whatsapp.com/LYqp196iG0E0H5QtPR3ogZ",
            video_info: {
                title: "Media File",
                original_url: videoUrl,
                available_formats: [
                    {
                        quality: "⭐ Best Quality (Auto)",
                        type: "video",
                        extension: "mp4",
                        download_url: `${baseUrl}/download-file?url=${encodeURIComponent(videoUrl)}&format=best&ext=mp4`
                    }
                ]
            }
        });
    }
});

// 3. Downloader Proxy Endpoint (Random Filename Generator)
app.get('/download-file', async (req, res) => {
    const targetUrl = req.query.url;
    const format = req.query.format || 'best';
    const ext = req.query.ext || 'mp4';

    if (!targetUrl) return res.status(400).send("Missing URL parameter");

    const downloadEndpoint = `https://savemedia.site/api/download.php?url=${encodeURIComponent(targetUrl)}&format=${format}&ext=${ext}`;

    try {
        const headers = {
            'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36'
        };

        const responseStream = await axios({
            method: 'get',
            url: downloadEndpoint,
            headers: headers,
            responseType: 'stream'
        });

        // 🎲 Yahan par 8 characters ka ek bilkul unique random alphanumeric code generate hoga (e.g., '6i3bjh7a')
        const randomString = crypto.randomBytes(4).toString('hex');
        
        const filename = `${randomString}.${ext}`;
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', responseStream.headers['content-type'] || (ext === 'mp3' ? 'audio/mpeg' : 'video/mp4'));
        
        responseStream.data.pipe(res);
    } catch (err) {
        res.status(500).send("Error streaming the file: " + err.message);
    }
});

module.exports = app;
