const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const { Pool } = require('pg');

function getConnectionString() {
    return process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '';
}

function normalizeUserRow(row) {
    if (!row) {
        return null;
    }

    return {
        ...row,
        verificado: typeof row.verificado === 'boolean' ? row.verificado : Boolean(row.verificado)
    };
}

function createSqliteStore() {
    const dataDir = path.join(__dirname, 'data');
    fs.mkdirSync(dataDir, { recursive: true });

    const db = new Database(path.join(dataDir, 'starcore.db'));

    db.exec(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT UNIQUE,
        email TEXT UNIQUE,
        senha TEXT,
        codigo_verificacao TEXT,
        verificado INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS mensagens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT,
        mensagem TEXT,
        data_hora DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    function ensureColumn(tableName, columnName, definition) {
        const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
        const exists = columns.some((column) => column.name === columnName);

        if (!exists) {
            db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
        }
    }

    ensureColumn('usuarios', 'codigo_verificacao_expira_em', 'TEXT');
    ensureColumn('usuarios', 'reset_codigo', 'TEXT');
    ensureColumn('usuarios', 'reset_expira_em', 'TEXT');
    ensureColumn('usuarios', 'tentativas_login', 'INTEGER DEFAULT 0');
    ensureColumn('usuarios', 'bloqueado_ate', 'TEXT');
    ensureColumn('usuarios', 'ultima_atividade', 'TEXT');

    return {
        mode: 'sqlite',
        async init() {},
        async createUser({ usuario, email, senhaHash, codigo, codigoExpiraEm }) {
            db.prepare(`
                INSERT INTO usuarios (
                    usuario, email, senha, codigo_verificacao, codigo_verificacao_expira_em,
                    verificado, tentativas_login, bloqueado_ate, ultima_atividade
                ) VALUES (?, ?, ?, ?, ?, 0, 0, NULL, NULL)
            `).run(usuario, email, senhaHash, codigo, codigoExpiraEm);
        },
        async findUserByVerification(email, codigo) {
            return normalizeUserRow(db.prepare(`
                SELECT * FROM usuarios
                WHERE email = ? AND codigo_verificacao = ?
            `).get(email, codigo));
        },
        async verifyUser(id) {
            db.prepare(`
                UPDATE usuarios
                SET verificado = 1,
                    codigo_verificacao = NULL,
                    codigo_verificacao_expira_em = NULL
                WHERE id = ?
            `).run(id);
        },
        async updateVerificationCode(id, codigo, codigoExpiraEm) {
            db.prepare(`
                UPDATE usuarios
                SET codigo_verificacao = ?,
                    codigo_verificacao_expira_em = ?
                WHERE id = ?
            `).run(codigo, codigoExpiraEm, id);
        },
        async findUserByEmail(email) {
            return normalizeUserRow(db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email));
        },
        async storeResetCode(id, codigo, expiraEm) {
            db.prepare(`
                UPDATE usuarios
                SET reset_codigo = ?, reset_expira_em = ?
                WHERE id = ?
            `).run(codigo, expiraEm, id);
        },
        async findUserByReset(email, codigo) {
            return normalizeUserRow(db.prepare(`
                SELECT * FROM usuarios
                WHERE email = ? AND reset_codigo = ?
            `).get(email, codigo));
        },
        async updatePasswordAfterReset(id, senhaHash, atividadeEm) {
            db.prepare(`
                UPDATE usuarios
                SET senha = ?,
                    reset_codigo = NULL,
                    reset_expira_em = NULL,
                    tentativas_login = 0,
                    bloqueado_ate = NULL,
                    ultima_atividade = ?
                WHERE id = ?
            `).run(senhaHash, atividadeEm, id);
        },
        async findUserByIdentifier(identificador, emailAlternativo) {
            return normalizeUserRow(db.prepare(`
                SELECT * FROM usuarios
                WHERE usuario = ? OR email = ?
            `).get(identificador, emailAlternativo));
        },
        async recordLoginFailure(id, tentativas, bloqueadoAte) {
            db.prepare(`
                UPDATE usuarios
                SET tentativas_login = ?,
                    bloqueado_ate = ?
                WHERE id = ?
            `).run(tentativas, bloqueadoAte, id);
        },
        async recordLoginSuccess(id, atividadeEm) {
            db.prepare(`
                UPDATE usuarios
                SET tentativas_login = 0,
                    bloqueado_ate = NULL,
                    ultima_atividade = ?
                WHERE id = ?
            `).run(atividadeEm, id);
        },
        async createMessage({ nome, email, mensagem }) {
            db.prepare('INSERT INTO mensagens (nome, email, mensagem) VALUES (?, ?, ?)').run(nome, email, mensagem);
        },
        async listMessages() {
            return db.prepare('SELECT * FROM mensagens ORDER BY data_hora DESC').all();
        },
        async deleteMessage(id) {
            db.prepare('DELETE FROM mensagens WHERE id = ?').run(id);
        }
    };
}

function createPostgresStore(connectionString) {
    const pool = new Pool({
        connectionString,
        ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
    });

    return {
        mode: 'postgres',
        async init() {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id BIGSERIAL PRIMARY KEY,
                    usuario TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    senha TEXT NOT NULL,
                    codigo_verificacao TEXT,
                    codigo_verificacao_expira_em TIMESTAMPTZ,
                    verificado BOOLEAN NOT NULL DEFAULT FALSE,
                    reset_codigo TEXT,
                    reset_expira_em TIMESTAMPTZ,
                    tentativas_login INTEGER NOT NULL DEFAULT 0,
                    bloqueado_ate TIMESTAMPTZ,
                    ultima_atividade TIMESTAMPTZ
                );
            `);

            await pool.query(`
                CREATE TABLE IF NOT EXISTS mensagens (
                    id BIGSERIAL PRIMARY KEY,
                    nome TEXT NOT NULL,
                    email TEXT NOT NULL,
                    mensagem TEXT NOT NULL,
                    data_hora TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
            `);
        },
        async createUser({ usuario, email, senhaHash, codigo, codigoExpiraEm }) {
            await pool.query(`
                INSERT INTO usuarios (
                    usuario, email, senha, codigo_verificacao, codigo_verificacao_expira_em,
                    verificado, tentativas_login, bloqueado_ate, ultima_atividade
                ) VALUES ($1, $2, $3, $4, $5, FALSE, 0, NULL, NULL)
            `, [usuario, email, senhaHash, codigo, codigoExpiraEm]);
        },
        async findUserByVerification(email, codigo) {
            const result = await pool.query(`
                SELECT * FROM usuarios
                WHERE email = $1 AND codigo_verificacao = $2
                LIMIT 1
            `, [email, codigo]);

            return normalizeUserRow(result.rows[0]);
        },
        async verifyUser(id) {
            await pool.query(`
                UPDATE usuarios
                SET verificado = TRUE,
                    codigo_verificacao = NULL,
                    codigo_verificacao_expira_em = NULL
                WHERE id = $1
            `, [id]);
        },
        async updateVerificationCode(id, codigo, codigoExpiraEm) {
            await pool.query(`
                UPDATE usuarios
                SET codigo_verificacao = $1,
                    codigo_verificacao_expira_em = $2
                WHERE id = $3
            `, [codigo, codigoExpiraEm, id]);
        },
        async findUserByEmail(email) {
            const result = await pool.query('SELECT * FROM usuarios WHERE email = $1 LIMIT 1', [email]);
            return normalizeUserRow(result.rows[0]);
        },
        async storeResetCode(id, codigo, expiraEm) {
            await pool.query(`
                UPDATE usuarios
                SET reset_codigo = $1, reset_expira_em = $2
                WHERE id = $3
            `, [codigo, expiraEm, id]);
        },
        async findUserByReset(email, codigo) {
            const result = await pool.query(`
                SELECT * FROM usuarios
                WHERE email = $1 AND reset_codigo = $2
                LIMIT 1
            `, [email, codigo]);

            return normalizeUserRow(result.rows[0]);
        },
        async updatePasswordAfterReset(id, senhaHash, atividadeEm) {
            await pool.query(`
                UPDATE usuarios
                SET senha = $1,
                    reset_codigo = NULL,
                    reset_expira_em = NULL,
                    tentativas_login = 0,
                    bloqueado_ate = NULL,
                    ultima_atividade = $2
                WHERE id = $3
            `, [senhaHash, atividadeEm, id]);
        },
        async findUserByIdentifier(identificador, emailAlternativo) {
            const result = await pool.query(`
                SELECT * FROM usuarios
                WHERE usuario = $1 OR email = $2
                LIMIT 1
            `, [identificador, emailAlternativo]);

            return normalizeUserRow(result.rows[0]);
        },
        async recordLoginFailure(id, tentativas, bloqueadoAte) {
            await pool.query(`
                UPDATE usuarios
                SET tentativas_login = $1,
                    bloqueado_ate = $2
                WHERE id = $3
            `, [tentativas, bloqueadoAte, id]);
        },
        async recordLoginSuccess(id, atividadeEm) {
            await pool.query(`
                UPDATE usuarios
                SET tentativas_login = 0,
                    bloqueado_ate = NULL,
                    ultima_atividade = $1
                WHERE id = $2
            `, [atividadeEm, id]);
        },
        async createMessage({ nome, email, mensagem }) {
            await pool.query(`
                INSERT INTO mensagens (nome, email, mensagem)
                VALUES ($1, $2, $3)
            `, [nome, email, mensagem]);
        },
        async listMessages() {
            const result = await pool.query('SELECT * FROM mensagens ORDER BY data_hora DESC');
            return result.rows;
        },
        async deleteMessage(id) {
            await pool.query('DELETE FROM mensagens WHERE id = $1', [id]);
        }
    };
}

function createStore() {
    const connectionString = getConnectionString();
    return connectionString ? createPostgresStore(connectionString) : createSqliteStore();
}

module.exports = {
    createStore
};
