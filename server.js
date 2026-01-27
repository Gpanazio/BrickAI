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

// --- INICIALIZAÇÃO DO DB (Cria apenas as tabelas de conteúdo) ---
const initDB = async (retries = 10) => {
    while (retries > 0) {
        try {
            console.log(`>> ATTEMPTING DB CONNECTION... (${retries} left)`);
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

// Fallback para SPA (qualquer outra rota serve o index.html)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
    console.log(`>> SERVER ONLINE ON PORT ${port}`);
});