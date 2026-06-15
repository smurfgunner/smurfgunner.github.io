export default {
    async fetch(request) {
        const url = new URL(request.url);

        if (url.pathname === '/.well-known/apple-app-site-association') {
            return serveAASA();
        }

        return serveSharePage(url);
    }
};

function serveAASA() {
    const aasa = {
        applinks: {
            details: [{
                appIDs: ['A5EKHJ2X2S.vahidgr.movieroulette'],
                components: [
                    { '/': '/movie/*', comment: 'Matches all movie share links' }
                ]
            }]
        }
    };
    return new Response(JSON.stringify(aasa), {
        headers: { 'Content-Type': 'application/json' }
    });
}

function serveSharePage(url) {
    const params = url.searchParams;
    const title = params.get('t') ?? 'A movie';
    const posterPath = params.get('p');
    const year = params.get('y');
    const genre = params.get('g');

    const ogImage = posterPath
        ? `https://image.tmdb.org/t/p/w500${posterPath}`
        : null;

    const metaDescription = [year, genre].filter(Boolean).join(' · ') || 'Add it to your watchlist.';

    const ogImageTags = ogImage ? `
    <meta property="og:image" content="${h(ogImage)}" />
    <meta property="og:image:width" content="500" />
    <meta property="og:image:height" content="750" />
    <meta name="twitter:image" content="${h(ogImage)}" />` : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="apple-itunes-app" content="app-id=6774653276">
    <title>${h(title)} — The Watchlist</title>

    <meta property="og:type" content="website" />
    <meta property="og:title" content="${h(title)}" />
    <meta property="og:description" content="${h(metaDescription)}" />
    <meta property="og:url" content="${h(url.toString())}" />${ogImageTags}

    <meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}" />
    <meta name="twitter:title" content="${h(title)}" />
    <meta name="twitter:description" content="${h(metaDescription)}" />

    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #1c1c1e;
            color: #fff;
            text-align: center;
            padding: 24px;
        }
        .icon { font-size: 64px; margin-bottom: 16px; }
        h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
        p { color: #8e8e93; font-size: 17px; margin-bottom: 36px; line-height: 1.5; }
        a {
            display: inline-block;
            background: #0a84ff;
            color: #fff;
            padding: 14px 32px;
            border-radius: 14px;
            text-decoration: none;
            font-size: 17px;
            font-weight: 600;
            letter-spacing: -0.2px;
        }
        a:hover { background: #0070d8; }
    </style>
</head>
<body>
    <div class="icon">🎬</div>
    <h1>The Watchlist</h1>
    <p>Someone shared a movie with you.<br>Get the app to add it to your watchlist.</p>
    <a href="https://apps.apple.com/app/id6774653276">Download on the App Store</a>
</body>
</html>`;

    return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    });
}

function h(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
