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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'brick_secret_key_2025';
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
    ssl: { rejectUnauthorized: false } // Necessário para Railway
});

// Evita crash da aplicação quando o banco desconecta por inatividade
pool.on('error', (err) => {
    console.error('>> DB POOL ERROR:', err);
});

// Graceful Shutdown
const shutdown = async () => {
    console.log(">> SHUTTING DOWN SERVER...");
    await pool.end();
    console.log(">> DB POOL CLOSED");
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

app.use(express.json({ limit: '50mb' })); // Limite alto para imagens em Base64
app.use(cookieParser());
app.use('/uploads', express.static(UPLOADS_DIR)); // Serve as imagens salvas
app.use(express.static(path.join(__dirname, 'dist'))); // Serve o frontend buildado

// Cache headers for static assets
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets'), {
    maxAge: '1y',
    immutable: true
}));

// --- INICIALIZAÇÃO DO DB (Cria apenas as tabelas de conteúdo) ---
const initDB = async (retries = 10) => {
    while (retries > 0) {
        try {
            console.log(`>> ATTEMPTING DB CONNECTION... (${retries} left)`);
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

            console.log(">> DB TABLES CHECKED");
            break; // Sucesso, sai do loop
        } catch (err) {
            console.error(">> DB INIT ERROR:", err.message);
            retries -= 1;
            await new Promise(res => setTimeout(res, 5000)); // Espera 5s antes de tentar de novo
        }
    }
};
initDB();

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

// 1.5 MASON CHAT (GEMINI API)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
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
    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is missing in environment variables.");
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
           - Existe uma indústria vendendo a ilusão de que o segredo está no "prompt perfeito"
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
           
           SOBRE PREÇOS E PRAZOS:
           - Cada projeto é único, não existe tabela fixa
           - Direcione para contato humano: brick@brick.mov
    `;

    try {
        // 4. Call Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                    ...history.map(msg => ({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.content }]
                    })),
                    { role: "user", parts: [{ text: message }] }
                ],
                generationConfig: {
                    temperature: 0.85,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 300,
                }
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return res.status(500).json({ error: "Neural link unstable." });
        }

        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "NO_DATA";

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
            { loc: 'https://ai.brick.mov/', priority: '1.0', changefreq: 'weekly' },
            { loc: 'https://ai.brick.mov/works', priority: '0.9', changefreq: 'weekly' },
            { loc: 'https://ai.brick.mov/about', priority: '0.8', changefreq: 'monthly' },
            { loc: 'https://ai.brick.mov/transmissions', priority: '0.8', changefreq: 'weekly' },
            { loc: 'https://ai.brick.mov/chat', priority: '0.7', changefreq: 'monthly' },
        ];

        // Fetch transmissions from DB for dynamic URLs
        let postUrls = [];
        try {
            const result = await pool.query('SELECT id, created_at FROM transmissions ORDER BY created_at DESC');
            postUrls = result.rows.map(row => ({
                loc: `https://ai.brick.mov/transmissions/${row.id}`,
                lastmod: new Date(row.created_at).toISOString().split('T')[0],
                priority: '0.6',
                changefreq: 'monthly'
            }));
        } catch (e) {
            console.error('Sitemap: Could not fetch transmissions', e.message);
        }

        const today = new Date().toISOString().split('T')[0];
        const allPages = [...staticPages, ...postUrls];

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allPages.map(p => `  <url>
    <loc>${p.loc}</loc>
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${p.loc}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${p.loc}?lang=en"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${p.loc}"/>
    <lastmod>${p.lastmod || today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error('Sitemap generation error:', err);
        res.status(500).send('Error generating sitemap');
    }
});

// Read HTML template once at startup
let htmlTemplate = '';
try {
    htmlTemplate = fs.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'utf-8');
} catch (e) {
    console.error('Could not read dist/index.html template:', e.message);
}

// SEO meta tag injection for SPA routes
app.get('*', async (req, res) => {
    if (!htmlTemplate) {
        return res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }

    const urlPath = req.path.replace(/^\/+|\/+$/g, '');
    const lang = req.query.lang === 'en' ? 'en' : 'pt';

    // Determine the view from the URL
    let view = 'home';
    let postData = null;

    if (urlPath === 'works') view = 'works';
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

    const canonicalPath = view === 'home' ? '' : urlPath;
    const canonicalUrl = `https://ai.brick.mov/${canonicalPath}`;
    const langParam = lang === 'en' ? '?lang=en' : '';

    // Build route-specific JSON-LD
    const jsonLdScripts = [];

    // FAQPage — injected in correct language for home view
    if (view === 'home') {
        const faqEntitiesPt = [
            { "@type": "Question", "name": "O que é a Brick AI?", "acceptedAnswer": { "@type": "Answer", "text": "Brick AI é a divisão de produção generativa da Brick, uma produtora de vídeo com 10+ anos de set. Combinamos direção cinematográfica humana com sistemas de IA para criar filmes, campanhas e conteúdo visual premium." } },
            { "@type": "Question", "name": "O que a Brick AI produz?", "acceptedAnswer": { "@type": "Answer", "text": "Produzimos filmes e campanhas com IA, desenvolvimento visual e conceito, execução completa de pipeline (geração, consistência, pós-produção e finalização) e projetos híbridos combinando set real com geração sintética." } },
            { "@type": "Question", "name": "Quais marcas já trabalharam com a Brick AI?", "acceptedAnswer": { "@type": "Answer", "text": "A Brick tem histórico com marcas Tier 1 como Stone, Visa, BBC, Record TV, AliExpress, Facebook, O Boticário e L'Oréal." } },
            { "@type": "Question", "name": "Quando vale a pena usar produção com IA?", "acceptedAnswer": { "@type": "Answer", "text": "IA faz sentido para cenários que não existem fisicamente, quando há necessidade de escala sem orçamento proporcional, ou para iteração rápida na fase de conceito. Não indicamos IA para depoimentos com rostos reais, produto físico como protagonista ou quando o orçamento permite produção tradicional." } },
            { "@type": "Question", "name": "Qual é o diferencial da Brick AI em relação a outras empresas de IA?", "acceptedAnswer": { "@type": "Answer", "text": "Somos antes uma produtora de cinema, depois uma empresa de IA. 10 anos de set nos deram o olhar de direção artística que transforma geração sintética em produção cinematográfica de alto padrão. Não vendemos prompts, entregamos filmes." } },
            { "@type": "Question", "name": "Como entrar em contato para um projeto?", "acceptedAnswer": { "@type": "Answer", "text": "Entre em contato pelo e-mail brick@brick.mov ou pelo formulário em ai.brick.mov. Cada projeto é tratado de forma personalizada." } },
            { "@type": "Question", "name": "A Brick AI já teve reconhecimento em festivais?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. O filme 'Inheritance' foi selecionado oficialmente para o Festival de Cinema de Gramado 2025, um dos festivais mais importantes da América Latina. O projeto 'Vendemos Qualquer Coisa' foi finalista no Genero Challenge." } }
        ];
        const faqEntitiesEn = [
            { "@type": "Question", "name": "What is Brick AI?", "acceptedAnswer": { "@type": "Answer", "text": "Brick AI is the generative production division of Brick, a video production house with 10+ years of real-world filmmaking experience. We combine human cinematic direction with AI systems to create films, campaigns, and premium visual content." } },
            { "@type": "Question", "name": "What does Brick AI produce?", "acceptedAnswer": { "@type": "Answer", "text": "We produce AI-generated films and campaigns, visual development and concept art, full pipeline execution (generation, consistency, post-production, and finishing), and hybrid projects combining real sets with synthetic generation." } },
            { "@type": "Question", "name": "Which brands have worked with Brick AI?", "acceptedAnswer": { "@type": "Answer", "text": "Brick has a track record with Tier 1 brands including Stone, Visa, BBC, Record TV, AliExpress, Facebook, O Boticário, and L'Oréal." } },
            { "@type": "Question", "name": "When does AI production make sense?", "acceptedAnswer": { "@type": "Answer", "text": "AI makes sense for scenarios that don't physically exist, when scale is needed without proportional budget, or for rapid iteration in the concept phase. We don't recommend AI for real human testimonials, physical products as protagonists, or when budget allows for traditional production done right." } },
            { "@type": "Question", "name": "What sets Brick AI apart from other AI companies?", "acceptedAnswer": { "@type": "Answer", "text": "We are a film production company first, an AI company second. 10 years on real sets gave us the artistic direction eye that transforms synthetic generation into high-standard cinematic production. We don't sell prompts — we deliver films." } },
            { "@type": "Question", "name": "How can I contact Brick AI for a project?", "acceptedAnswer": { "@type": "Answer", "text": "Contact us at brick@brick.mov or through the form at ai.brick.mov. Each project is handled individually." } },
            { "@type": "Question", "name": "Has Brick AI received festival recognition?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. The film 'Inheritance' was officially selected for the Gramado Film Festival 2025, one of the most important festivals in Latin America. 'Vendemos Qualquer Coisa' (We Can Sell Anything) was a finalist in the Genero Challenge." } }
        ];
        jsonLdScripts.push(`<script type="application/ld+json">${JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": lang === 'en' ? faqEntitiesEn : faqEntitiesPt
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
            "author": { "@type": "Organization", "name": "Brick AI", "url": "https://ai.brick.mov" },
            "publisher": { "@type": "Organization", "name": "Brick AI", "logo": { "@type": "ImageObject", "url": "https://ai.brick.mov/og-image.jpg" } },
            "datePublished": isoDate,
            "dateModified": isoDate,
            "url": canonicalUrl,
            "mainEntityOfPage": { "@type": "WebPage", "@id": canonicalUrl }
        })}</script>`);
    }

    const html = htmlTemplate
        .replace(/__LANG__/g, lang === 'pt' ? 'pt-BR' : 'en')
        .replace(/__META_TITLE__/g, title)
        .replace(/__META_DESCRIPTION__/g, description)
        .replace(/__OG_TITLE__/g, ogTitle)
        .replace(/__OG_DESCRIPTION__/g, ogDescription)
        .replace(/__OG_TYPE__/g, view === 'post' ? 'article' : 'website')
        .replace(/__OG_URL__/g, canonicalUrl + langParam)
        .replace(/__OG_LOCALE__/g, lang === 'pt' ? 'pt_BR' : 'en_US')
        .replace(/__OG_LOCALE_ALT__/g, lang === 'pt' ? 'en_US' : 'pt_BR')
        .replace(/__CANONICAL_URL__/g, canonicalUrl)
        .replace(/__HREFLANG_PT__/g, `https://ai.brick.mov/${canonicalPath}`)
        .replace(/__HREFLANG_EN__/g, `https://ai.brick.mov/${canonicalPath}?lang=en`)
        .replace(/<!--__JSON_LD__-->/g, jsonLdScripts.join('\n    '));

    res.send(html);
});

app.listen(port, '0.0.0.0', () => {
    console.log(`>> SERVER ONLINE ON PORT ${port}`);
});