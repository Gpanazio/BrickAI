import express from 'express';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

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

// 2. WORKS (GET, POST, DELETE)
app.get('/api/works', async (req, res) => {
    try {
        const result = await pool.query('SELECT data FROM works ORDER BY created_at DESC');
        const works = result.rows.map(row => row.data);
        res.json(works);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/works', async (req, res) => {
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

app.delete('/api/works/:id', async (req, res) => {
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

app.post('/api/transmissions', async (req, res) => {
    const item = req.body;
    try {
        await pool.query(
            'INSERT INTO transmissions (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2',
            [item.id, item]
        );
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/transmissions/:id', async (req, res) => {
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