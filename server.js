import express from 'express';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'brick_secret_key_2025';

// Conexão com o Banco de Dados (Railway fornece DATABASE_URL)
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Necessário para Railway
});

// --- DEBUG CONEXÃO ---
if (process.env.DATABASE_URL) {
    try {
        const dbUrl = new URL(process.env.DATABASE_URL);
        console.log(`>> DB CONFIG: Targeting host '${dbUrl.hostname}' on port '${dbUrl.port}'`);
    } catch (e) { console.log(">> DB CONFIG: Invalid URL format"); }
}

app.use(express.json({ limit: '50mb' })); // Limite alto para imagens em Base64
app.use(cookieParser());
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

        // --- GARANTIR ADMIN (Gabriel) ---
        const adminUser = "Gabriel";
        const adminPass = "2904";
        const hash = await bcrypt.hash(adminPass, 10);
        
        const userCheck = await pool.query('SELECT * FROM master_users WHERE username = $1', [adminUser]);
        if (userCheck.rows.length === 0) {
            await pool.query('INSERT INTO master_users (id, username, password_hash, created_at) VALUES ($1, $2, $3, NOW())', 
                [randomUUID(), adminUser, hash]);
            console.log(`>> ADMIN USER '${adminUser}' CREATED.`);
        } else {
            await pool.query('UPDATE master_users SET password_hash = $1 WHERE username = $2', [hash, adminUser]);
            console.log(`>> ADMIN USER '${adminUser}' PASSWORD SYNCED.`);
        }

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
const authenticateToken = (req, res, next) => {
    const token = req.cookies.admin_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid session" });
        req.user = user;
        next();
    });
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
                
                // Define Cookie seguro
                res.cookie('admin_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });
                res.json({ success: true, user });
            } else {
                res.status(401).json({ error: "Invalid credentials" });
            }
        } else {
            res.status(401).json({ error: "User not found" });
        }
    } catch (err) {
        console.error(err);
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

app.listen(port, () => {
    console.log(`>> SERVER ONLINE ON PORT ${port}`);
});