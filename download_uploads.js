import pg from 'pg';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PROD_BASE_URL = process.env.PRODUCTION_UPLOADS_BASE_URL || 'https://brickai-production.up.railway.app';

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const downloadFile = (url, filepath) => {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filepath)) return resolve(true);
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to download ${url} - Status ${res.statusCode}`));
            }
            const fileStream = fs.createWriteStream(filepath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve(true);
            });
        }).on('error', reject);
    });
};

async function syncImagesFromTable(tableName, imageKeys) {
    let count = 0;
    const { rows } = await pool.query(`SELECT data FROM ${tableName}`);
    for (const row of rows) {
        const item = row.data;
        for (const key of imageKeys) {
            if (item[key] && item[key].startsWith('/uploads/')) {
                const filename = path.basename(item[key]);
                const localPath = path.join(UPLOADS_DIR, filename);
                const prodUrl = `${PROD_BASE_URL}/uploads/${filename}`;
                try {
                    await downloadFile(prodUrl, localPath);
                    console.log(`[+] Downloaded (${tableName}): ${filename}`);
                    count++;
                } catch (e) {
                    console.log(`[-] Failed: ${filename}. Error: ${e.message}`);
                }
            }
        }
    }
    return count;
}

async function syncUploads() {
    try {
        let count = 0;
        count += await syncImagesFromTable('works', ['imageHome', 'imageWorks', 'imageInner', 'video']);
        count += await syncImagesFromTable('transmissions', ['thumbnail', 'image']);
        console.log(`\nDONE. Downloaded ${count} files.`);
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await pool.end();
    }
}

syncUploads();
