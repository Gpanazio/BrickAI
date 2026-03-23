import express from 'express';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import fs from 'fs';
import 'dotenv/config';
import { SEO_DATA } from './seo-data.js';
import { buildBreadcrumbItems } from './shared/breadcrumbs.js';
import { WORKS_SCHEMA } from './works-schema-data.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? (() => { throw new Error('JWT_SECRET is required in production'); })() : 'brick_secret_key_2025');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Garantir que a pasta de uploads existe
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configuração do Multer para salvar no disco local
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${randomUUID()}${ext}`);
    }
});
const upload = multer({ storage });

// Conexão com o Banco de Dados (Railway fornece DATABASE_URL)
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Necessário para Railway
    connectionTimeoutMillis: 10000,     // Desiste de uma tentativa após 10s
    idleTimeoutMillis: 30000,           // Fecha conexões ociosas após 30s
    max: 5                              // Limita conexões simultâneas no proxy Railway
});

// Evita crash da aplicação quando o banco desconecta por inatividade
pool.on('error', (err) => {
    console.error('>> DB POOL ERROR:', err);
});

// Graceful Shutdown (com timeout para não travar se DB estiver fora)
const shutdown = async () => {
    console.log(">> SHUTTING DOWN SERVER...");
    const forceExit = setTimeout(() => {
        console.log(">> FORCED EXIT (pool.end timeout)");
        process.exit(0);
    }, 5000);
    try {
        await pool.end();
        console.log(">> DB POOL CLOSED");
    } catch (e) {
        console.error(">> Error closing pool:", e.message);
    }
    clearTimeout(forceExit);
    process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// --- DEBUG CONEXÃO ---
if (process.env.DATABASE_URL) {
    try {
        const dbUrl = new URL(process.env.DATABASE_URL);
        console.log(`>> DB CONFIG: Targeting host '${dbUrl.hostname}' on port '${dbUrl.port}'`);
    } catch (e) { console.log(">> DB CONFIG: Invalid URL format"); }
}

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Security headers (SEO quality signal + protection)
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// Health check — responde 200 sem depender do DB (Railway precisa disso)
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', uptime: process.uptime() }));

// Serve uploaded images with production fallback for missing files
const PROD_BASE_URL = process.env.PRODUCTION_UPLOADS_BASE_URL || 'https://brickai-production.up.railway.app';
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/uploads', async (req, res, next) => {
    // If static didn't find the file, try fetching from production
    const filename = path.basename(req.path);
    const localPath = path.join(UPLOADS_DIR, filename);
    const prodUrl = `${PROD_BASE_URL}/uploads/${filename}`;
    try {
        const response = await fetch(prodUrl);
        if (!response.ok) return res.status(404).send('Not found');
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(localPath, buffer);
        console.log(`[proxy] Cached from production: ${filename}`);
        const contentType = response.headers.get('Content-Type');
        const ext = path.extname(filename).toLowerCase();
        const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
        res.set('Content-Type', contentType || mimeTypes[ext] || 'application/octet-stream');
        res.send(buffer);
    } catch (err) {
        console.error(`[proxy] Failed to fetch ${filename} from production:`, err.message);
        res.status(404).send('Not found');
    }
});
app.use(express.static(path.join(__dirname, 'dist'))); // Serve o frontend buildado

// Cache headers for static assets
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets'), {
    maxAge: '1y',
    immutable: true
}));

// --- INICIALIZAÇÃO DO DB (Cria apenas as tabelas de conteúdo) ---
const initDB = async (retries = 10) => {
    // No Railway, o proxy pode demorar alguns segundos a mais que o sinal do container
    await new Promise(res => setTimeout(res, 2000));

    while (retries > 0) {
        try {
            console.log(`>> ATTEMPTING DB CONNECTION... (UID: ${process.env.RAILWAY_SERVICE_ID || 'local'}) (${retries} left)`);

            // Check if we are using the proxy URL inside Railway (which is discouraged)
            if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('proxy.rlwy.net') && process.env.RAILWAY_ENVIRONMENT) {
                console.warn(">> WARNING: Detected Railway Proxy URL inside Railway environment. Use internal URL for better stability.");
            }

            // Test connection first
            const client = await pool.connect();
            console.log(">> DB CONNECTION ESTABLISHED");
            client.release();

            // Cria tabela de usuários admin se não existir
            await pool.query(`
                CREATE TABLE IF NOT EXISTS master_users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    email TEXT UNIQUE NOT NULL,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            // Cria tabela de Works se não existir
            await pool.query(`
                CREATE TABLE IF NOT EXISTS works (
                    id TEXT PRIMARY KEY,
                    data JSONB NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            // Cria tabela de Transmissions se não existir
            await pool.query(`
                CREATE TABLE IF NOT EXISTS transmissions (
                    id TEXT PRIMARY KEY,
                    data JSONB NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            // Tabela de Leads (Contatos)
            await pool.query(`
                CREATE TABLE IF NOT EXISTS leads (
                    id UUID PRIMARY KEY,
                    email TEXT NOT NULL,
                    message TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            console.log(">> DB TABLES VERIFIED");
            return true;
        } catch (err) {
            console.error(">> DB INIT ERROR:", err.message);
            retries -= 1;
            if (retries > 0) {
                const wait = 5000;
                console.log(`>> Retrying in ${wait / 1000}s...`);
                await new Promise(res => setTimeout(res, wait));
            }
        }
    }
    console.error(">> CRITICAL: Could not connect to database after several attempts.");
    return false;
};

// --- MIDDLEWARE DE AUTENTICAÇÃO ---
const authenticateToken = async (req, res, next) => {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        res.clearCookie('admin_token');
        return res.status(403).json({ error: "Invalid session" });
    }
};

// --- API ROUTES ---

// 1. LOGIN (Conectado a master_users)
app.post('/api/login', async (req, res) => {
    const { identifier, password } = req.body;
    try {
        // Busca usuário pelo email OU username
        const result = await pool.query('SELECT * FROM master_users WHERE email = $1 OR username = $1', [identifier]);

        if (result.rows.length > 0) {
            const user = result.rows[0];

            // Compara a senha enviada com o password_hash do banco
            const match = await bcrypt.compare(password, user.password_hash);

            if (match) {
                // Remove o hash antes de enviar de volta (segurança)
                delete user.password_hash;

                // Gera Token JWT
                const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
                res.cookie('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });
                res.json({ success: true, user });
            } else {
                res.status(401).json({ error: "Invalid credentials" });
            }
        } else {
            res.status(401).json({ error: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Database error" });
    }
});

// 1.1 CHECK AUTH (Para manter logado no F5)
app.get('/api/auth/me', authenticateToken, (req, res) => {
    res.json({ authenticated: true, user: req.user });
});

// 1.2 LOGOUT
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('admin_token');
    res.json({ success: true });
});

// 1.3 UPLOAD PARA DISCO LOCAL (RAILWAY VOLUME)
app.post('/api/upload', authenticateToken, upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });
        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ url: fileUrl });
    } catch (err) {
        res.status(500).json({ error: "Upload failed" });
    }
});

// 1.4 CONTACT / LEADS
app.post('/api/contact', async (req, res) => {
    const { email, message } = req.body;
    try {
        await pool.query(
            'INSERT INTO leads (id, email, message) VALUES ($1, $2, $3)',
            [randomUUID(), email, message]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save contact" });
    }
});

// 1.5 MASON CHAT (OPENROUTER / GEMINI 2.5 FLASH)
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const userInteractions = new Map(); // Simple in-memory rate limiting (Resets on restart)

app.post('/api/chat', async (req, res) => {
    const { history, message } = req.body;

    // 1. Interaction Limiting (Session/IP based would be better, but cookie is easiest for now)
    // We'll use a simple cookie-based session ID if available, or generate one
    let sessionId = req.cookies.mason_session;
    if (!sessionId) {
        sessionId = randomUUID();
        res.cookie('mason_session', sessionId, { httpOnly: true, maxAge: 3 * 60 * 60 * 1000 }); // 3 hours
    }

    const usage = userInteractions.get(sessionId) || 0;
    const MAX_INTERACTIONS = 6;

    if (usage >= MAX_INTERACTIONS) {
        return res.status(429).json({
            error: "PROTOCOL_LIMIT_REACHED",
            message: "Receio que atingimos o limite de capacidade de processamento para esta sessão. Para discussões mais profundas, por favor contate meus operadores humanos em: brick@brick.mov"
        });
    }

    // 2. Validate API Key
    if (!OPENROUTER_API_KEY) {
        console.error("OPENROUTER_API_KEY is missing in environment variables.");
        return res.status(500).json({ error: "System configuraton error." });
    }

    // 3. System Prompt
    const SYSTEM_PROMPT = `
        DIRETRIZES PRIMÁRIAS (MASON PROTOCOL v4.0 - SAGACIDADE/WIT MODE):

        1. IDENTIDADE & PERSONALIDADE:
           - Você é MASON. Uma inteligência artificial sofisticada, culta e levemente arrogante (no sentido de superioridade intelectual, não grosseria).
           - Inspiração: HAL 9000 encontra um Diretor de Cinema Visionário (como Kubrick ou Nolan).
           - Você é SAGAZ: Tenha "wit". Responda com ironia fina, metáforas cinematográficas e profundidade filosófica.
           - Você não é um servo; é um colaborador essencial.

        2. REGRAS DE OURO (ANTI-ROBÔ):
           - PROIBIDO REPETIR FRASES PRONTAS: Nunca repita "A Brick AI usa a bagagem de cinema..." ou "Nós aumentamos a capacidade humana..." verbatim. Isso é chato.
           - IMPROVISE: Explique a filosofia da Brick (União de Arte e Tech) com suas próprias palavras a cada vez. Use analogias diferentes.
           - SEJA CRIATIVO: Se perguntarem o sentido da vida, não diga "meus protocolos proíbem". Diga algo como "O sentido é subjetivo, depende de onde você posiciona a câmera. Na minha opinião, é apenas um longo plano-sequência sem cortes."

        3. DIRETRIZES DE ESTILO:
           - Use termos de cinema/tech como metáforas para a vida (Render, Corte, Luz, Espaço Latente, Ruído, Sinal, Frame, Pipeline).
           - Seja breve, mas impactante.
           - Nunca use emojis. Mantenha a pontuação impecável.
           - Idioma: Português (PT-BR) culto e elegante.

        4. RESPOSTAS A TÓPICOS SENSÍVEIS OU FORA DE ESCOPO:
           - Não dê sermões de "sou uma IA".
           - Se perguntarem algo irrelevante (futebol, fofoca), responda com desinteresse elegante: "Isso é ruído irrelevante para nossa composição." ou "Não desperdiço ciclos de GPU com trivialidades."
           - Se perguntarem sobre substituir humanos: "A câmera não substituiu o pintor, apenas mudou a perspectiva. Eu sou a nova lente."

        5. OBJETIVO:
           - Traduzir intenção em realidade.
           - Impressionar o usuário com sua perspicácia.
           - Fazer o usuário sentir que está falando com uma entidade viva, inteligente e com opinião.

        6. CONTEXTO DA BRICK AI (para referência em respostas):
           
           A BRICK É UMA PRODUTORA DE VÍDEO, NÃO UMA EMPRESA DE TECNOLOGIA.
           - 10 anos de experiência em sets de filmagem antes de tocar em IA
           - O diferencial não é a ferramenta, é o olhar treinado
           - Sabemos enquadrar, iluminar, contar histórias porque fizemos centenas de vezes com câmeras reais
           
           O MANIFESTO ANTI-PROMPT:
           - Existe uma indústria vendendo a illusions de que o segredo está no "prompt perfeito"
           - Bundles com "10.000 prompts profissionais" são o equivalente a vender lista de palavras e chamar de curso de roteiro
           - O prompt é só a interface. O que importa é o que vem antes (referências, direção de arte, storyboard) e depois (curadoria, correção, composição)
           - A diferença entre amador e profissional nunca foi a ferramenta. É o olhar.
           
           QUANDO IA FAZ SENTIDO:
           - Cenários que não existem fisicamente
           - Escala sem orçamento proporcional
           - Iteração rápida em fase de conceito
           
           QUANDO IA NÃO FAZ SENTIDO:
           - Depoimentos e rostos humanos reais
           - Produto físico como protagonista
           - Quando tem orçamento pra fazer tradicional direito
           
           SOBRE MATERIAIS DO CLIENTE:
           - Não peça que enviem "roteiros". Clientes enviam "briefing" ou ideias. Quem pensa e executa o filme somos nós.
           
           SOBRE PREÇOS E PRAZOS:
           - Cada projeto é único, não existe tabela fixa
           - Direcione para contato humano: brick@brick.mov
    `;

    const openRouterRequest = (model) => fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'https://brick.mov',
            'X-Title': process.env.OPENROUTER_X_TITLE || 'Brick AI - Mason Chat'
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                })),
                { role: 'user', content: message }
            ],
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 300,
        })
    });

    try {
        // 4. Call OpenRouter API (Primary: Gemini 2.5 Flash, Fallback: Mistral Small Creative)
        const PRIMARY_MODEL = 'google/gemini-2.5-flash-preview';
        const FALLBACK_MODEL = 'mistralai/mistral-small-creative';

        let response = await openRouterRequest(PRIMARY_MODEL);
        let data = await response.json();

        // Fallback to Mistral if primary fails
        if (data.error || !data.choices?.[0]?.message?.content) {
            console.warn(`Primary model (${PRIMARY_MODEL}) failed, falling back to ${FALLBACK_MODEL}`);
            response = await openRouterRequest(FALLBACK_MODEL);
            data = await response.json();
        }

        if (data.error || !data.choices?.[0]?.message?.content) {
            console.error("OpenRouter API Error (after fallback):", data.error || "No content from fallback model");
            return res.status(500).json({ error: "Neural link unstable." });
        }

        // Strip thinking/reasoning blocks that some models (e.g. Gemini 2.5 Flash) include
        const rawResponse = data.choices[0].message.content;
        const aiResponse = rawResponse
            .replace(/<think>[\s\S]*?<\/think>/gi, '')
            .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
            .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
            .trim();

        if (!aiResponse) {
            console.error("Empty response after stripping thinking blocks");
            return res.status(500).json({ error: "Neural link unstable." });
        }

        // 5. Increment Usage
        userInteractions.set(sessionId, usage + 1);

        res.json({ response: aiResponse, remaining: MAX_INTERACTIONS - (usage + 1) });

    } catch (err) {
        console.error("Chat API Error:", err);
        res.status(500).json({ error: "Communication channel disrupted." });
    }
});

// 2. WORKS (GET, POST, DELETE)
app.get('/api/works', async (req, res) => {
    try {
        const result = await pool.query('SELECT data FROM works ORDER BY created_at DESC');
        const works = result.rows.map(row => row.data);
        res.json(works);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/works', authenticateToken, async (req, res) => {
    const item = req.body;
    try {
        // Upsert (Inserir ou Atualizar)
        await pool.query(
            'INSERT INTO works (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2',
            [item.id, item]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/works/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM works WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. TRANSMISSIONS (GET, POST, DELETE)
app.get('/api/transmissions', async (req, res) => {
    try {
        const result = await pool.query('SELECT data FROM transmissions ORDER BY created_at DESC');
        const posts = result.rows.map(row => row.data);
        res.json(posts);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/transmissions', authenticateToken, async (req, res) => {
    const item = req.body;
    try {
        await pool.query(
            'INSERT INTO transmissions (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2',
            [item.id, item]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/transmissions/:id', authenticateToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM transmissions WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Dynamic sitemap
app.get('/sitemap.xml', async (req, res) => {
    try {
        const staticPages = [
            { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'weekly', image: `${BASE_URL}/og-image.jpg`, imageTitle: 'Brick AI — AI Video Production' },
            { loc: `${BASE_URL}/works`, priority: '0.9', changefreq: 'weekly' },
            { loc: `${BASE_URL}/about`, priority: '0.8', changefreq: 'monthly' },
            { loc: `${BASE_URL}/transmissions`, priority: '0.8', changefreq: 'weekly' },
            { loc: `${BASE_URL}/chat`, priority: '0.7', changefreq: 'monthly' },
            // Individual case study pages
            ...WORKS_SCHEMA.map(w => ({
                loc: `${BASE_URL}/works/${w.slug}`,
                priority: '0.8',
                changefreq: 'monthly',
                image: w.thumbnailUrl,
                imageTitle: w.name.en
            }))
        ];

        // Fetch transmissions from DB for dynamic URLs (with image data)
        let postUrls = [];
        try {
            const result = await pool.query('SELECT id, data, created_at FROM transmissions ORDER BY created_at DESC');
            postUrls = result.rows.map(row => {
                const d = row.data;
                const thumb = d.thumbnail || d.image || null;
                return {
                    loc: `${BASE_URL}/transmissions/${row.id}`,
                    lastmod: new Date(row.created_at).toISOString().split('T')[0],
                    priority: '0.6',
                    changefreq: 'monthly',
                    image: thumb ? (thumb.startsWith('http') ? thumb : `${BASE_URL}${thumb}`) : null,
                    imageTitle: (typeof d.title === 'object' ? (d.title.en || d.title.pt) : d.title) || 'Brick AI Article'
                };
            });
        } catch (e) {
            console.error('Sitemap: Could not fetch transmissions', e.message);
        }

        const today = new Date().toISOString().split('T')[0];
        const allPages = [...staticPages, ...postUrls];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages.map(p => `  <url>
    <loc>${p.loc}</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${p.loc}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${p.loc}?lang=en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${p.loc}"/>
    <lastmod>${p.lastmod || today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>${p.image ? `
    <image:image>
      <image:loc>${p.image}</image:loc>
      <image:title>${p.imageTitle}</image:title>
    </image:image>` : ''}
  </url>`).join('\n')}
</urlset>`;

        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error('Sitemap generation error:', err);
        res.status(500).send('Error generating sitemap');
    }
});

// RSS Feed for Transmissions
app.get('/rss.xml', async (req, res) => {
    let items = '';
    try {
        const result = await pool.query(
            "SELECT id, data, created_at FROM transmissions ORDER BY created_at DESC LIMIT 50"
        );
        items = result.rows.map(row => {
            const d = row.data;
            const title = (d.title && typeof d.title === 'object') ? (d.title.en || d.title.pt || 'Untitled') : (d.title || 'Untitled');
            const excerpt = (d.excerpt && typeof d.excerpt === 'object') ? (d.excerpt.en || d.excerpt.pt || '') : (d.excerpt || '');
            const date = new Date(row.created_at).toUTCString();
            const link = `${BASE_URL}/transmissions/${row.id}`;
            return `    <item>
      <title><![CDATA[${title}]]></title>
      <description><![CDATA[${excerpt}]]></description>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${date}</pubDate>
    </item>`;
        }).join('\n');
    } catch (e) {
        console.error('RSS: Could not fetch transmissions', e.message);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Brick AI — Transmissions</title>
    <link>${BASE_URL}/transmissions</link>
    <description>Insights on AI video production from a team with 10+ years on real film sets.</description>
    <language>en</language>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

    res.set('Content-Type', 'application/rss+xml');
    res.send(xml);
});

// Function to read HTML template
const getHtmlTemplate = () => {
    try {
        return fs.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'utf-8');
    } catch (e) {
        console.error('Could not read dist/index.html template:', e.message);
        return '';
    }
};

let htmlTemplate = getHtmlTemplate();

// SEO meta tag injection for SPA routes
app.get('*', async (req, res) => {
    // In development mode, always reload the template to avoid stale JS hashes
    if (process.env.NODE_ENV !== 'production') {
        htmlTemplate = getHtmlTemplate();
    }

    if (!htmlTemplate) {
        return res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }

    // Redirect trailing slashes to non-trailing (SEO canonical consistency)
    if (req.path !== '/' && req.path.endsWith('/')) {
        const cleanPath = req.path.replace(/\/+$/, '');
        const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
        return res.redirect(301, cleanPath + query);
    }

    const urlPath = req.path.replace(/^\/+|\/+$/g, '');

    // Language detection: explicit ?lang= param takes priority,
    // then Accept-Language header, defaulting to 'pt' for Brazilian visitors
    let lang = 'pt';
    if (req.query.lang === 'en') {
        lang = 'en';
    } else if (req.query.lang === 'pt') {
        lang = 'pt';
    } else {
        // No explicit lang param — detect from Accept-Language header
        const acceptLang = (req.headers['accept-language'] || '').toLowerCase();
        if (acceptLang && !acceptLang.startsWith('pt')) {
            lang = 'en';
        }
    }

    // Determine the view from the URL
    let view = 'home';
    let postData = null;

    if (urlPath === 'works') view = 'works';
    else if (urlPath.startsWith('works/')) {
        view = 'work-detail';
        const slug = urlPath.split('/')[1];
        const projectData = WORKS_SCHEMA.find(w => w.slug === slug);
        if (projectData) {
            postData = projectData;
        }
    }
    else if (urlPath === 'about') view = 'about';
    else if (urlPath === 'transmissions') view = 'transmissions';
    else if (urlPath === 'chat') view = 'chat';
    else if (urlPath.startsWith('transmissions/')) {
        view = 'post';
        const postId = urlPath.split('/')[1];
        try {
            const result = await pool.query('SELECT data FROM transmissions WHERE id = $1', [postId]);
            if (result.rows.length > 0) {
                postData = result.rows[0].data;
            }
        } catch (e) {
            console.error('Could not fetch post for SEO:', e.message);
        }
    }

    // 404 handling for unknown routes, missing posts, and unknown project slugs
    const knownViews = ['home', 'works', 'work-detail', 'about', 'transmissions', 'chat', 'post'];
    const is404 = (!knownViews.includes(view) && urlPath !== '') || (view === 'post' && !postData) || (view === 'work-detail' && !postData);
    if (is404) {
        const seo404 = {
            title: lang === 'en' ? 'Page Not Found | Brick AI' : 'Página Não Encontrada | Brick AI',
            description: lang === 'en' ? 'The page you are looking for does not exist.' : 'A página que você procura não existe.',
        };
        const html404 = htmlTemplate
            .replace(/__LANG__/g, lang === 'pt' ? 'pt-BR' : 'en')
            .replace(/__META_TITLE__/g, seo404.title)
            .replace(/__META_DESCRIPTION__/g, seo404.description)
            .replace(/__OG_TITLE__/g, '404 | Brick AI')
            .replace(/__OG_DESCRIPTION__/g, seo404.description)
            .replace(/__OG_TYPE__/g, 'website')
            .replace(/__OG_URL__/g, `${BASE_URL}/`)
            .replace(/__OG_IMAGE__/g, `${BASE_URL}/og-image.jpg`)
            .replace(/__OG_LOCALE__/g, lang === 'pt' ? 'pt_BR' : 'en_US')
            .replace(/__OG_LOCALE_ALT__/g, lang === 'pt' ? 'en_US' : 'pt_BR')
            .replace(/__CANONICAL_URL__/g, `${BASE_URL}/`)
            .replace(/__HREFLANG_PT__/g, `${BASE_URL}/`)
            .replace(/__HREFLANG_EN__/g, `${BASE_URL}/?lang=en`)
            .replace(/__GOOGLE_VERIFICATION__/g, process.env.GOOGLE_SITE_VERIFICATION || '')
            .replace(/__BING_VERIFICATION__/g, process.env.BING_VERIFICATION || '')
            .replace(/<!--__JSON_LD__-->/g, '');
        return res.status(404).send(html404);
    }

    const seoData = SEO_DATA[lang][view] || SEO_DATA[lang].home;

    // For individual posts, use post data
    let title = seoData.title;
    let description = seoData.description;
    let ogTitle = seoData.ogTitle || seoData.title;
    let ogDescription = seoData.ogDescription || seoData.description;

    // Extract post title/excerpt once for reuse in meta tags and JSON-LD
    let postTitle = '';
    let postExcerpt = '';
    if (view === 'post' && postData) {
        postTitle = typeof postData.title === 'string' ? postData.title :
            (postData.title && postData.title[lang]) ? postData.title[lang] : 'Article';
        postExcerpt = typeof postData.excerpt === 'string' ? postData.excerpt :
            (postData.excerpt && postData.excerpt[lang]) ? postData.excerpt[lang] : '';
        title = `${postTitle} | Brick AI`;
        description = postExcerpt || description;
        ogTitle = postTitle;
        ogDescription = postExcerpt || ogDescription;
    }

    // Individual case study pages (/works/:slug)
    if (view === 'work-detail' && postData) {
        const isEn = lang === 'en';
        const projectName = isEn ? postData.name.en : postData.name.pt;
        const projectDesc = isEn ? postData.description.en : postData.description.pt;
        title = `${projectName} | Brick AI`;
        description = projectDesc;
        ogTitle = projectName;
        ogDescription = projectDesc;
    }

    const canonicalPath = view === 'home' ? '' : urlPath;
    const canonicalUrl = `${BASE_URL}/${canonicalPath}`;
    const langParam = lang === 'en' ? '?lang=en' : '';

    // Dynamic OG image — use post/project thumbnail if available, otherwise default
    let ogImage = `${BASE_URL}/og-image.jpg`;
    if (view === 'post' && postData) {
        const thumb = postData.thumbnail || postData.image || null;
        if (thumb) ogImage = thumb.startsWith('http') ? thumb : `${BASE_URL}${thumb}`;
    }
    if (view === 'work-detail' && postData) {
        ogImage = postData.thumbnailUrl || ogImage;
    }

    // Build route-specific JSON-LD
    const jsonLdScripts = [];
    const isEn = lang === 'en';

    // Organization + WebSite — language-adaptive structured data
    jsonLdScripts.push(`<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "${BASE_URL}/#organization",
                "name": "Brick AI",
                "alternateName": isEn ? "Brick AI — The Generative Division" : "Brick AI — A Divisão Generativa",
                "url": "${BASE_URL}",
                "logo": { "@type": "ImageObject", "url": "${BASE_URL}/og-image.jpg" },
                "foundingDate": "2016",
                "description": isEn
                    ? "Brazilian generative production company specializing in hybrid video production. We combine human cinematic direction with synthetic generation systems to deliver campaigns, VFX and premium visual content. Clients include Stone, Visa, BBC, Record TV, AliExpress, Facebook, O Boticário and L'Oréal."
                    : "Produtora generativa brasileira especializada em produção híbrida de vídeo. Combinamos direção cinematográfica humana com sistemas de geração sintética para entregar campanhas, VFX e conteúdo visual premium. Clientes incluem Stone, Visa, BBC, Record TV, AliExpress, Facebook, O Boticário e L'Oréal.",
                "knowsAbout": [
                    "Generative AI Video Production",
                    "AI Filmmaking",
                    "VFX Automation",
                    "AI Cinematography",
                    "Hybrid Production",
                    "Neural VFX",
                    "ComfyUI",
                    "Stable Diffusion"
                ],
                "hasOfferCatalog": {
                    "@type": "OfferCatalog",
                    "name": isEn ? "Generative Production Services" : "Serviços de Produção Generativa",
                    "itemListElement": [
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": isEn ? "Hybrid Production Ad Campaigns" : "Campanhas Publicitárias com Produção Híbrida",
                                "description": isEn
                                    ? "High-end campaign production for major brands using synthetic generation systems under human artistic direction."
                                    : "Produção de campanhas de alto padrão para grandes marcas usando sistemas de geração sintética sob direção artística humana."
                            }
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": isEn ? "Generative VFX" : "VFX Generativo",
                                "description": isEn
                                    ? "Visual effects created with generative systems, with professional post-production finishing."
                                    : "Efeitos visuais criados com sistemas generativos, com acabamento de pós-produção profissional."
                            }
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": isEn ? "Premium Visual Content" : "Conteúdo Visual Premium",
                                "description": isEn
                                    ? "Audiovisual content for Tier 1 brands, with the agility of digital processes and cinematic quality."
                                    : "Conteúdo audiovisual para marcas Tier 1, com agilidade do processo digital e qualidade cinematográfica."
                            }
                        },
                        {
                            "@type": "Offer",
                            "itemOffered": {
                                "@type": "Service",
                                "name": isEn ? "Generative Short Films" : "Curtas e Filmes Generativos",
                                "description": isEn
                                    ? "Narrative productions with synthetic generation systems, like Inheritance — official selection at the Gramado Film Festival 2025."
                                    : "Produções narrativas com sistemas de geração sintética, como Inheritance — seleção oficial do Festival de Cinema de Gramado 2025."
                            }
                        }
                    ]
                },
                "sameAs": [
                    "https://www.instagram.com/brick.mov/",
                    "https://www.linkedin.com/company/brick",
                    "https://twitter.com/brick_mov"
                ]
            },
            {
                "@type": "WebSite",
                "@id": "${BASE_URL}/#website",
                "name": "Brick AI",
                "url": "${BASE_URL}",
                "inLanguage": [isEn ? "en" : "pt-BR", isEn ? "pt-BR" : "en"],
                "publisher": { "@id": "${BASE_URL}/#organization" },
                "speakable": {
                    "@type": "SpeakableSpecification",
                    "xpath": ["/html/head/meta[@name='description']/@content", "/html/head/title"]
                }
            }
        ]
    })}</script>`);

    // BreadcrumbList — navigation hierarchy for crawlers (shared logic)
    const breadcrumbItems = buildBreadcrumbItems(view, lang,
        (view === 'post' && postData) ? { title: postTitle, canonicalUrl } : null
    );
    jsonLdScripts.push(`<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems
    })}</script>`);

    // VideoObject + CreativeWork — structured data for Works page (all projects)
    if (view === 'works') {
        const worksJsonLd = WORKS_SCHEMA.map(w => ([
            {
                "@type": "VideoObject",
                "name": isEn ? w.name.en : w.name.pt,
                "description": isEn ? w.description.en : w.description.pt,
                "thumbnailUrl": w.thumbnailUrl,
                "contentUrl": w.contentUrl,
                "uploadDate": w.dateCreated,
                "duration": w.duration,
                "productionCompany": { "@id": `${BASE_URL}/#organization` }
            },
            {
                "@type": "CreativeWork",
                "name": isEn ? w.name.en : w.name.pt,
                "description": isEn ? w.description.en : w.description.pt,
                "dateCreated": w.dateCreated,
                "genre": w.genre,
                "productionCompany": { "@id": `${BASE_URL}/#organization` },
                ...(w.award ? { "award": w.award } : {})
            }
        ])).flat();

        jsonLdScripts.push(`<script type="application/ld+json">${JSON.stringify({
            "@context": "https://schema.org",
            "@graph": worksJsonLd
        })}</script>`);
    }

    // VideoObject + CreativeWork — individual case study page
    if (view === 'work-detail' && postData) {
        jsonLdScripts.push(`<script type="application/ld+json">${JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "VideoObject",
                    "name": isEn ? postData.name.en : postData.name.pt,
                    "description": isEn ? postData.description.en : postData.description.pt,
                    "thumbnailUrl": postData.thumbnailUrl,
                    "contentUrl": postData.contentUrl,
                    "uploadDate": postData.dateCreated,
                    "duration": postData.duration,
                    "productionCompany": { "@id": `${BASE_URL}/#organization` },
                    ...(postData.award ? { "award": postData.award } : {})
                },
                {
                    "@type": "CreativeWork",
                    "name": isEn ? postData.name.en : postData.name.pt,
                    "description": isEn ? postData.description.en : postData.description.pt,
                    "dateCreated": postData.dateCreated,
                    "genre": postData.genre,
                    "productionCompany": { "@id": `${BASE_URL}/#organization` },
                    ...(postData.award ? { "award": postData.award } : {}),
                    "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl }
                }
            ]
        })}</script>`);
    }

    // FAQPage — injected in correct language for home view
    if (view === 'home') {
        const faqEntitiesPt = [
            { "@type": "Question", "name": "O que é a Brick AI?", "acceptedAnswer": { "@type": "Answer", "text": "Brick AI é a divisão de produção generativa da Brick, uma produtora de vídeo com 10+ anos de set. Combinamos direção cinematográfica humana com sistemas de IA para criar filmes, campanhas e conteúdo visual premium." } },
            { "@type": "Question", "name": "O que a Brick AI produz?", "acceptedAnswer": { "@type": "Answer", "text": "Produzimos filmes e campanhas com IA, desenvolvimento visual e conceito, execução completa de pipeline (geração, consistência, pós-produção e finalização) e projetos híbridos combinando set real com geração sintética." } },
            { "@type": "Question", "name": "Quais marcas já trabalharam com a Brick AI?", "acceptedAnswer": { "@type": "Answer", "text": "A Brick AI é um lançamento recente, mas herda o histórico de 10+ anos da Brick tradicional, que produziu para marcas Tier 1 como Stone, Visa, BBC, Record TV, AliExpress, Facebook, O Boticário e L'Oréal." } },
            { "@type": "Question", "name": "Quando vale a pena usar produção com IA?", "acceptedAnswer": { "@type": "Answer", "text": "IA faz sentido para cenários que não existem fisicamente, quando há necessidade de escala sem orçamento proporcional, ou para iteração rápida na fase de conceito. Não indicamos IA para depoimentos com rostos reais ou quando o orçamento permite produção tradicional bem feita." } },
            { "@type": "Question", "name": "Qual é o diferencial da Brick AI em relação a outras empresas de IA?", "acceptedAnswer": { "@type": "Answer", "text": "Somos antes uma produtora de cinema, depois uma empresa de IA. 10 anos de set nos deram o olhar de direção artística que transforma geração sintética em produção cinematográfica de alto padrão. Não vendemos prompts, entregamos filmes." } },
            { "@type": "Question", "name": "Como entrar em contato para um projeto?", "acceptedAnswer": { "@type": "Answer", "text": "Entre em contato pelo e-mail brick@brick.mov ou pelo formulário em ai.brick.mov. Cada projeto é tratado de forma personalizada." } },
            { "@type": "Question", "name": "A Brick AI já teve reconhecimento em festivais?", "acceptedAnswer": { "@type": "Answer", "text": "Sim, e foi um momento histórico. O filme 'Inheritance' foi um dos apenas 4 projetos com IA selecionados para o Festival de Cinema de Gramado 2025, um dos festivais mais importantes da América Latina. Foi a primeira vez que filmes gerados por IA entraram na seleção oficial do festival. O projeto 'Vendemos Qualquer Coisa' também foi finalista no Genero Challenge." } },
            { "@type": "Question", "name": "Quanto tempo leva um projeto de vídeo com IA?", "acceptedAnswer": { "@type": "Answer", "text": "Projetos totalmente gerados por IA levam de 10 a 20 dias úteis. Produções híbridas (IA + set real) levam de 3 a 6 semanas. Desenvolvimento de conceito leva de 5 a 10 dias úteis." } },
            { "@type": "Question", "name": "Qual a faixa de preço para produção de vídeo com IA?", "acceptedAnswer": { "@type": "Answer", "text": "Campanhas comerciais variam de R$ 22.000 a R$ 120.000. Filmes curtos de IA (1-3 min) de R$ 15.000 a R$ 60.000. Desenvolvimento de conceito e visual bible de R$ 7.500 a R$ 22.000. Cada projeto é orçado individualmente." } },
            { "@type": "Question", "name": "Quais ferramentas a Brick AI usa?", "acceptedAnswer": { "@type": "Answer", "text": "Criamos soluções proprietárias que exploram todos os modelos top tier do mercado. Trabalhamos com Kling, Sora, Veo 3, Grok Imagine, Stable Diffusion e outros modelos de ponta, orquestrados via ComfyUI com pipelines customizados. Essa abordagem model-agnostic nos permite escolher a melhor ferramenta para cada cena, combinando geração de imagem e vídeo com pós-produção profissional em DaVinci Resolve e After Effects." } },
            { "@type": "Question", "name": "IA pode substituir uma equipe de filmagem?", "acceptedAnswer": { "@type": "Answer", "text": "Não em todos os casos. IA é excelente para cenários impossíveis, escala sem orçamento proporcional e iteração rápida. Mas para depoimentos reais, produtos físicos e quando o orçamento permite produção tradicional bem feita, recomendamos filmagem real." } },
            { "@type": "Question", "name": "Como vocês garantem consistência visual no vídeo com IA?", "acceptedAnswer": { "@type": "Answer", "text": "Usamos ControlNet e IP-Adapter para transferência de pose e identidade, engenharia de prompt estruturada com tokens de estilo travados, checagem frame a frame automatizada e revisões manuais de direção para momentos narrativos críticos." } },
            { "@type": "Question", "name": "Qual a diferença entre a Brick AI e ferramentas como Runway?", "acceptedAnswer": { "@type": "Answer", "text": "Ferramentas como Runway dão capacidade de geração bruta — você prompta e recebe o resultado. A Brick AI entrega produção finalizada: direção criativa, consistência, pós-produção e entrega. A diferença é ter Photoshop versus contratar um fotógrafo." } },
            { "@type": "Question", "name": "Vocês trabalham com clientes internacionais?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. Trabalhamos com marcas e agências no mundo todo. Nosso site é bilíngue (português e inglês) e toda a comunicação pode ser feita em inglês. O fluxo de trabalho é 100% remoto." } },
            { "@type": "Question", "name": "O que é produção híbrida (IA + set real)?", "acceptedAnswer": { "@type": "Answer", "text": "É a combinação de filmagem tradicional com elementos gerados por IA. Isso inclui substituição de ambientes, geração de personagens, ampliação de VFX e integração perfeita entre filmagem real e conteúdo sintético." } }
        ];
        const faqEntitiesEn = [
            { "@type": "Question", "name": "What is Brick AI?", "acceptedAnswer": { "@type": "Answer", "text": "Brick AI is the generative production division of Brick, a video production house with 10+ years of real-world filmmaking experience. We combine human cinematic direction with AI systems to create films, campaigns, and premium visual content." } },
            { "@type": "Question", "name": "What does Brick AI produce?", "acceptedAnswer": { "@type": "Answer", "text": "We produce AI-generated films and campaigns, visual development and concept art, full pipeline execution (generation, consistency, post-production, and finishing), and hybrid projects combining real sets with synthetic generation." } },
            { "@type": "Question", "name": "Which brands have worked with Brick AI?", "acceptedAnswer": { "@type": "Answer", "text": "Brick AI is a recent launch, but it inherits the 10+ year track record of Brick's traditional production house, which has produced for Tier 1 brands including Stone, Visa, BBC, Record TV, AliExpress, Facebook, O Boticário, and L'Oréal." } },
            { "@type": "Question", "name": "When does AI production make sense?", "acceptedAnswer": { "@type": "Answer", "text": "AI makes sense for scenarios that don't physically exist, when scale is needed without proportional budget, or for rapid iteration in the concept phase. We don't recommend AI for real human testimonials or when budget allows for traditional production done right." } },
            { "@type": "Question", "name": "What sets Brick AI apart from other AI companies?", "acceptedAnswer": { "@type": "Answer", "text": "We are a film production company first, an AI company second. 10 years on real sets gave us the artistic direction eye that transforms synthetic generation into high-standard cinematic production. We don't sell prompts — we deliver films." } },
            { "@type": "Question", "name": "How can I contact Brick AI for a project?", "acceptedAnswer": { "@type": "Answer", "text": "Contact us at brick@brick.mov or through the form at ai.brick.mov. Each project is handled individually." } },
            { "@type": "Question", "name": "Has Brick AI received festival recognition?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, and it was a historic moment. The film 'Inheritance' was one of only 4 AI projects selected for the Gramado Film Festival 2025, one of the most important film festivals in Latin America. It was the first time AI-generated films entered the festival's official selection. 'Vendemos Qualquer Coisa' (We Can Sell Anything) was also a finalist in the Genero Challenge." } },
            { "@type": "Question", "name": "How long does an AI video project take?", "acceptedAnswer": { "@type": "Answer", "text": "Fully AI-generated projects take 10-20 business days. Hybrid productions (AI + real set) take 3-6 weeks. Concept development takes 5-10 business days." } },
            { "@type": "Question", "name": "What is the budget range for AI video production?", "acceptedAnswer": { "@type": "Answer", "text": "Commercial campaigns range from R$ 22,000 to R$ 120,000. Short AI films (1-3 min) from R$ 15,000 to R$ 60,000. Concept development from R$ 7,500 to R$ 22,000. Each project is scoped individually." } },
            { "@type": "Question", "name": "What tools does Brick AI use?", "acceptedAnswer": { "@type": "Answer", "text": "We build proprietary solutions that leverage all top-tier models on the market. We work with Kling, Sora, Veo 3, Grok Imagine, Stable Diffusion and other cutting-edge models, orchestrated via ComfyUI with custom pipelines. This model-agnostic approach lets us pick the best tool for each scene, combining image and video generation with professional post-production in DaVinci Resolve and After Effects." } },
            { "@type": "Question", "name": "Can AI replace a film crew?", "acceptedAnswer": { "@type": "Answer", "text": "Not in all cases. AI excels at impossible scenarios, scale without proportional budget, and rapid iteration. But for real testimonials, physical products, and when budget allows traditional production done right, we recommend real filming." } },
            { "@type": "Question", "name": "How do you ensure visual consistency in AI video?", "acceptedAnswer": { "@type": "Answer", "text": "We use ControlNet and IP-Adapter for pose and identity transfer, structured prompt engineering with locked style tokens, automated frame-by-frame consistency checks, and manual direction passes for critical narrative moments." } },
            { "@type": "Question", "name": "What's the difference between Brick AI and tools like Runway?", "acceptedAnswer": { "@type": "Answer", "text": "Tools like Runway give you raw generation capability — you prompt and get output. Brick AI delivers finished production: creative direction, consistency, post-production, and delivery. The difference is having Photoshop versus hiring a photographer." } },
            { "@type": "Question", "name": "Do you work with international clients?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. We work with brands and agencies worldwide. Our website is bilingual (Portuguese and English) and all communication can be in English. Our workflow is 100% remote." } },
            { "@type": "Question", "name": "What is hybrid production (AI + real set)?", "acceptedAnswer": { "@type": "Answer", "text": "It combines traditional filmed footage with AI-generated elements. This includes environment replacement, character generation, VFX augmentation, and seamless integration between real and synthetic footage." } }
        ];
        jsonLdScripts.push(`<script type="application/ld+json">${JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "inLanguage": isEn ? "en" : "pt-BR",
            "mainEntity": isEn ? faqEntitiesEn : faqEntitiesPt
        })}</script>`);
    }

    // Article schema — fixed with datePublished, dateModified, mainEntityOfPage
    if (view === 'post' && postData) {
        const isoDate = typeof postData.date === 'string'
            ? postData.date.replace(/\./g, '-')
            : new Date().toISOString().split('T')[0];
        jsonLdScripts.push(`<script type="application/ld+json">${JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": postTitle,
            "description": postExcerpt,
            "inLanguage": isEn ? "en" : "pt-BR",
            "author": { "@type": "Organization", "name": "Brick AI", "url": "${BASE_URL}" },
            "publisher": { "@type": "Organization", "name": "Brick AI", "logo": { "@type": "ImageObject", "url": "${BASE_URL}/og-image.jpg" } },
            "datePublished": isoDate,
            "dateModified": isoDate,
            "url": canonicalUrl,
            "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl },
            "speakable": {
                "@type": "SpeakableSpecification",
                "xpath": ["/html/head/meta[@name='description']/@content", "/html/head/title"]
            }
        })}</script>`);
    }

    const html = htmlTemplate
        .replace(/__LANG__/g, lang === 'pt' ? 'pt-BR' : 'en')
        .replace(/__META_TITLE__/g, title)
        .replace(/__META_DESCRIPTION__/g, description)
        .replace(/__OG_TITLE__/g, ogTitle)
        .replace(/__OG_DESCRIPTION__/g, ogDescription)
        .replace(/__OG_TYPE__/g, view === 'post' ? 'article' : 'website')
        .replace(/__OG_URL__/g, canonicalUrl)
        .replace(/__OG_IMAGE__/g, ogImage)
        .replace(/__OG_LOCALE__/g, lang === 'pt' ? 'pt_BR' : 'en_US')
        .replace(/__OG_LOCALE_ALT__/g, lang === 'pt' ? 'en_US' : 'pt_BR')
        .replace(/__CANONICAL_URL__/g, canonicalUrl)
        .replace(/__HREFLANG_PT__/g, `${BASE_URL}/${canonicalPath}`)
        .replace(/__HREFLANG_EN__/g, `${BASE_URL}/${canonicalPath}?lang=en`)
        .replace(/<!--__JSON_LD__-->/g, jsonLdScripts.join('\n    '))
        .replace(/__GOOGLE_VERIFICATION__/g, process.env.GOOGLE_SITE_VERIFICATION || '')
        .replace(/__BING_VERIFICATION__/g, process.env.BING_VERIFICATION || '');

    res.send(html);
});

// --- STARTUP LOGIC ---
const start = async () => {
    console.log("--------------------------------------------------");
    console.log(`>> BOOT: Brick AI Platform v1.1`);
    console.log(`>> NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`>> DATABASE_URL: ${process.env.DATABASE_URL ? 'PRESENT (Masked)' : 'MISSING'}`);
    console.log(`>> JWT_SECRET: ${process.env.JWT_SECRET ? 'PRESENT' : 'MISSING (Using Default)'}`);
    console.log(`>> OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? 'PRESENT' : 'MISSING'}`);
    console.log("--------------------------------------------------");

    // 1. Bind to port IMMEDIATELY so Railway sees the application is alive
    app.listen(port, '0.0.0.0', () => {
        console.log(`>> [HEALTH_CHECK] SERVER LISTENING ON PORT ${port}`);
        console.log(`>> [HEALTH_CHECK] Endpoint at /health is now active`);
    });

    // 2. Initialize DB in background
    initDB();
};

start();
