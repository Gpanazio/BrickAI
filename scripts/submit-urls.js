#!/usr/bin/env node
/**
 * submit-urls.js — Submit URLs to Bing and Google for instant indexing
 *
 * Usage:
 *   node scripts/submit-urls.js                    # Submit all static pages
 *   node scripts/submit-urls.js --url /transmissions/123  # Submit a specific URL
 *   node scripts/submit-urls.js --sitemap           # Submit sitemap URL
 *
 * Environment:
 *   BING_API_KEY       — Bing Webmaster Tools API key (required for Bing)
 *   GOOGLE_INDEXING_KEY — Google Indexing API JSON key path (optional)
 *   BASE_URL           — Site base URL (defaults to https://ai.brick.mov)
 */

import 'dotenv/config';

const BASE_URL = process.env.BASE_URL || 'https://ai.brick.mov';
const BING_API_KEY = process.env.BING_API_KEY;

const STATIC_URLS = [
    '/',
    '/works',
    '/about',
    '/transmissions',
    '/chat',
];

// Parse CLI args
const args = process.argv.slice(2);
const specificUrl = args.includes('--url') ? args[args.indexOf('--url') + 1] : null;
const submitSitemap = args.includes('--sitemap');

async function submitToBing(urls) {
    if (!BING_API_KEY) {
        console.log('⚠ BING_API_KEY not set — skipping Bing submission');
        return;
    }

    const siteUrl = BASE_URL;
    const endpoint = `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey=${BING_API_KEY}`;

    console.log(`\n>> Bing: Submitting ${urls.length} URL(s)...`);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                siteUrl,
                urlList: urls,
            }),
        });

        if (response.ok) {
            console.log(`✓ Bing: ${urls.length} URL(s) submitted successfully`);
            urls.forEach(u => console.log(`  → ${u}`));
        } else {
            const text = await response.text();
            console.error(`✗ Bing error (${response.status}): ${text}`);
        }
    } catch (err) {
        console.error(`✗ Bing request failed: ${err.message}`);
    }
}

async function submitBingSitemap() {
    if (!BING_API_KEY) {
        console.log('⚠ BING_API_KEY not set — skipping Bing sitemap submission');
        return;
    }

    const sitemapUrl = `${BASE_URL}/sitemap.xml`;
    const endpoint = `https://ssl.bing.com/webmaster/api.svc/json/SubmitSitemap?apikey=${BING_API_KEY}`;

    console.log(`\n>> Bing: Submitting sitemap...`);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                siteUrl: BASE_URL,
                feedpath: sitemapUrl,
            }),
        });

        if (response.ok) {
            console.log(`✓ Bing: Sitemap submitted → ${sitemapUrl}`);
        } else {
            const text = await response.text();
            console.error(`✗ Bing sitemap error (${response.status}): ${text}`);
        }
    } catch (err) {
        console.error(`✗ Bing sitemap request failed: ${err.message}`);
    }
}

async function submitToGoogle(urls) {
    // Google Indexing API requires a service account JSON key
    // For now, we use the simple ping method (no auth required)
    console.log(`\n>> Google: Pinging sitemap for re-crawl...`);

    try {
        const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`;
        const response = await fetch(pingUrl);

        if (response.ok) {
            console.log(`✓ Google: Sitemap ping successful`);
        } else {
            console.error(`✗ Google ping error (${response.status})`);
        }
    } catch (err) {
        console.error(`✗ Google ping failed: ${err.message}`);
    }
}

async function main() {
    console.log('=== Brick AI — URL Submission Tool ===');
    console.log(`Base URL: ${BASE_URL}`);

    if (submitSitemap) {
        await submitBingSitemap();
        await submitToGoogle([]);
        return;
    }

    let urls;
    if (specificUrl) {
        urls = [`${BASE_URL}${specificUrl.startsWith('/') ? specificUrl : '/' + specificUrl}`];
    } else {
        urls = STATIC_URLS.map(path => `${BASE_URL}${path}`);
    }

    await submitToBing(urls);
    await submitToGoogle(urls);

    console.log('\n✓ Done');
}

main().catch(console.error);
