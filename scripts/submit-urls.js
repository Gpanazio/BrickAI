#!/usr/bin/env node
/**
 * submit-urls.js — Submit URLs via IndexNow (Bing, Yandex, Naver) + ping Google
 *
 * Usage:
 *   node scripts/submit-urls.js                         # Submit all static pages
 *   node scripts/submit-urls.js --url /transmissions/123  # Submit a specific URL
 *
 * Environment:
 *   BING_API_KEY  — Used as IndexNow key (required)
 *   BASE_URL      — Site base URL (defaults to https://ai.brick.mov)
 *
 * Setup: Place a file at public/{BING_API_KEY}.txt containing the key itself.
 *        This is required by the IndexNow protocol for verification.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL || 'https://ai.brick.mov';
const INDEXNOW_KEY = process.env.BING_API_KEY;

const STATIC_URLS = [
    '/',
    '/works',
    '/about',
    '/transmissions',
    '/chat',
    '/llms.txt',
    '/llms-full.txt',
    '/sitemap.xml',
    '/rss.xml',
];

// Parse CLI args
const args = process.argv.slice(2);
const specificUrl = args.includes('--url') ? args[args.indexOf('--url') + 1] : null;

function ensureKeyFile() {
    if (!INDEXNOW_KEY) return;
    const keyFilePath = path.join(__dirname, '..', 'public', `${INDEXNOW_KEY}.txt`);
    if (!fs.existsSync(keyFilePath)) {
        fs.writeFileSync(keyFilePath, INDEXNOW_KEY);
        console.log(`✓ Created IndexNow key file: public/${INDEXNOW_KEY}.txt`);
    }
}

async function submitIndexNow(urls) {
    if (!INDEXNOW_KEY) {
        console.log('⚠ BING_API_KEY not set — skipping IndexNow submission');
        return;
    }

    const host = new URL(BASE_URL).host;
    const endpoint = 'https://api.indexnow.org/IndexNow';

    console.log(`\n>> IndexNow: Submitting ${urls.length} URL(s) to Bing, Yandex, Naver...`);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify({
                host,
                key: INDEXNOW_KEY,
                keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
                urlList: urls,
            }),
        });

        if (response.ok || response.status === 202) {
            console.log(`✓ IndexNow: ${urls.length} URL(s) submitted successfully (${response.status})`);
            urls.forEach(u => console.log(`  → ${u}`));
        } else {
            const text = await response.text();
            console.error(`✗ IndexNow error (${response.status}): ${text.substring(0, 200)}`);
        }
    } catch (err) {
        console.error(`✗ IndexNow request failed: ${err.message}`);
    }
}

async function pingGoogle() {
    console.log(`\n>> Google: Pinging sitemap...`);
    try {
        const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${BASE_URL}/sitemap.xml`)}`;
        const response = await fetch(pingUrl);
        if (response.ok) {
            console.log(`✓ Google: Sitemap ping successful`);
        } else {
            // Google deprecated the ping endpoint but may still accept it
            console.log(`⚠ Google: Ping returned ${response.status} (may be deprecated — use Search Console instead)`);
        }
    } catch (err) {
        console.error(`✗ Google ping failed: ${err.message}`);
    }
}

async function main() {
    console.log('=== Brick AI — URL Submission Tool (IndexNow) ===');
    console.log(`Base URL: ${BASE_URL}`);

    ensureKeyFile();

    let urls;
    if (specificUrl) {
        urls = [`${BASE_URL}${specificUrl.startsWith('/') ? specificUrl : '/' + specificUrl}`];
    } else {
        urls = STATIC_URLS.map(p => `${BASE_URL}${p}`);
    }

    await submitIndexNow(urls);
    await pingGoogle();

    console.log('\n✓ Done');
}

main().catch(console.error);
