import pg from 'pg';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, 'uploads');

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

async function syncUploads() {
    try {
        const { rows } = await pool.query('SELECT data FROM works');
        let count = 0;
        
        for (const row of rows) {
            const work = row.data;
            // Arrays com chaves que possivelmente guardam URLs de imagem no JSON
            const imageKeys = ['imageHome', 'imageInner', 'video']; 
            
            for (const key of imageKeys) {
                if (work[key] && work[key].startsWith('/uploads/')) {
                    const filename = path.basename(work[key]);
                    const localPath = path.join(UPLOADS_DIR, filename);
                    // Como a gente não sabe de cor a URL de prod agora, vou usar a da Brick.
                    // Caso falhe, pelo menos temos os nomes dos arquivos.
                    const prodUrl = `https://brickai-production.up.railway.app/uploads/${filename}`; 
                    
                    try {
                        await downloadFile(prodUrl, localPath);
                        console.log(`[+] Downloaded: ${filename}`);
                        count++;
                    } catch (e) {
                        console.log(`[-] Failed: ${filename} (Maybe deleted in production)`);
                    }
                }
            }
        }
        console.log(`\nDONE. Downloaded ${count} files.`);
    } catch (e) {
        console.error("Error:", e.message);
    } finally {
        await pool.end();
    }
}

syncUploads();
