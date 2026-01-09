import express from 'express';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
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

app.use(express.json({ limit: '50mb' })); // Limite alto para imagens em Base64
app.use(express.static(path.join(__dirname, 'dist'))); // Serve o frontend buildado

// --- INICIALIZAÇÃO DO DB (Cria apenas as tabelas de conteúdo) ---
const initDB = async () => {
    try {
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
        console.log(">> DB TABLES CHECKED");
    } catch (err) {
        console.error(">> DB INIT ERROR:", err);
    }
};
initDB();

// --- API ROUTES ---

// 1. LOGIN (Conectado a master_users)
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Busca usuário pelo email
        const result = await pool.query('SELECT * FROM master_users WHERE email = $1', [email]);
        
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