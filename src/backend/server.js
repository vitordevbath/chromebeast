require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORTA = 3000;
const LIMITE_TENTATIVAS_LOGIN = 5;
const JANELA_BLOQUEIO_MINUTOS = 15;
const CODIGO_EXPIRA_MINUTOS = 15;

app.use(cors());
app.use(express.json());

const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const dataDir = path.join(__dirname, 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'chromebeast.db'));

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

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

function jsonError(res, status, erro, extras = {}) {
    return res.status(status).send({ erro, ...extras });
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function normalizeUsuario(usuario) {
    return String(usuario || '').trim();
}

function gerarCodigoNumerico() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function gerarExpiracaoIso(minutos) {
    return new Date(Date.now() + minutos * 60 * 1000).toISOString();
}

function isFutureDate(dateValue) {
    return Boolean(dateValue) && new Date(dateValue).getTime() > Date.now();
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarUsuario(usuario) {
    return /^[a-zA-Z0-9_.-]{3,24}$/.test(usuario);
}

function validarSenha(senha) {
    const senhaTexto = String(senha || '');

    if (senhaTexto.length < 8) {
        return 'SENHA_MUITO_CURTA';
    }

    if (!/[A-Z]/.test(senhaTexto)) {
        return 'SENHA_EXIGE_MAIUSCULA';
    }

    if (!/[a-z]/.test(senhaTexto)) {
        return 'SENHA_EXIGE_MINUSCULA';
    }

    if (!/\d/.test(senhaTexto)) {
        return 'SENHA_EXIGE_NUMERO';
    }

    return null;
}

async function enviarEmailCodigo({ destino, assunto, titulo, descricao, codigo }) {
    if (!process.env.SMTP_USER) {
        return false;
    }

    await transporter.sendMail({
        from: process.env.SMTP_FROM || '"CHROMEBEAST" <noreply@batenterprise.com>',
        to: destino,
        subject: assunto,
        text: `${descricao} Codigo: ${codigo}`,
        html: `
            <div style="background:#000;color:#bc13fe;padding:24px;font-family:monospace;">
                <h1 style="margin:0 0 12px;">${titulo}</h1>
                <p style="margin:0 0 18px;">${descricao}</p>
                <p style="margin:0;font-size:32px;color:#fff;"><strong>${codigo}</strong></p>
                <p style="margin:18px 0 0;color:#999;">Este codigo expira em ${CODIGO_EXPIRA_MINUTOS} minutos.</p>
            </div>
        `
    });

    return true;
}

function getDevCodePayload(codigo) {
    if (process.env.SMTP_USER) {
        return {};
    }

    return { codigo_desenvolvimento: codigo };
}

app.post('/api/auth/registrar', async (req, res) => {
    const usuario = normalizeUsuario(req.body.usuario);
    const email = normalizeEmail(req.body.email);
    const senha = String(req.body.senha || '');

    if (!usuario || !email || !senha) {
        return jsonError(res, 400, 'DADOS_INCOMPLETOS');
    }

    if (!validarUsuario(usuario)) {
        return jsonError(res, 400, 'USUARIO_INVALIDO');
    }

    if (!validarEmail(email)) {
        return jsonError(res, 400, 'EMAIL_INVALIDO');
    }

    const erroSenha = validarSenha(senha);
    if (erroSenha) {
        return jsonError(res, 400, erroSenha);
    }

    const codigo = gerarCodigoNumerico();
    const codigoExpiraEm = gerarExpiracaoIso(CODIGO_EXPIRA_MINUTOS);
    const hashSenha = await bcrypt.hash(senha, 10);

    try {
        db.prepare(`
            INSERT INTO usuarios (
                usuario, email, senha, codigo_verificacao, codigo_verificacao_expira_em,
                verificado, tentativas_login, bloqueado_ate, ultima_atividade
            ) VALUES (?, ?, ?, ?, ?, 0, 0, NULL, NULL)
        `).run(usuario, email, hashSenha, codigo, codigoExpiraEm);

        await enviarEmailCodigo({
            destino: email,
            assunto: 'CODIGO DE VERIFICACAO - CHROMEBEAST',
            titulo: 'CHROMEBEAST',
            descricao: 'Use este codigo para validar sua conta.',
            codigo
        });

        return res.status(201).send({
            mensagem: 'IDENTIDADE_CRIADA_AGUARDANDO_VERIFICACAO',
            ...getDevCodePayload(codigo)
        });
    } catch (error) {
        return jsonError(res, 400, 'USUARIO_OU_EMAIL_JA_EXISTE');
    }
});

app.post('/api/auth/verificar', (req, res) => {
    const email = normalizeEmail(req.body.email);
    const codigo = String(req.body.codigo || '').trim();

    const user = db.prepare(`
        SELECT * FROM usuarios
        WHERE email = ? AND codigo_verificacao = ?
    `).get(email, codigo);

    if (!user) {
        return jsonError(res, 401, 'CODIGO_INVALIDO');
    }

    if (!isFutureDate(user.codigo_verificacao_expira_em)) {
        return jsonError(res, 410, 'CODIGO_EXPIRADO');
    }

    db.prepare(`
        UPDATE usuarios
        SET verificado = 1,
            codigo_verificacao = NULL,
            codigo_verificacao_expira_em = NULL
        WHERE id = ?
    `).run(user.id);

    return res.send({ mensagem: 'IDENTIDADE_VALIDADA' });
});

app.post('/api/auth/esqueci-senha', async (req, res) => {
    const email = normalizeEmail(req.body.email);

    if (!validarEmail(email)) {
        return jsonError(res, 400, 'EMAIL_INVALIDO');
    }

    const user = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);

    if (!user || !user.verificado) {
        return res.send({ mensagem: 'SE_O_EMAIL_EXISTIR_UM_CODIGO_SERA_ENVIADO' });
    }

    const codigo = gerarCodigoNumerico();
    const expiraEm = gerarExpiracaoIso(CODIGO_EXPIRA_MINUTOS);

    db.prepare(`
        UPDATE usuarios
        SET reset_codigo = ?, reset_expira_em = ?
        WHERE id = ?
    `).run(codigo, expiraEm, user.id);

    await enviarEmailCodigo({
        destino: email,
        assunto: 'RECUPERACAO DE SENHA - CHROMEBEAST',
        titulo: 'RECUPERACAO DE ACESSO',
        descricao: 'Use este codigo para redefinir sua senha.',
        codigo
    });

    return res.send({
        mensagem: 'SE_O_EMAIL_EXISTIR_UM_CODIGO_SERA_ENVIADO',
        ...getDevCodePayload(codigo)
    });
});

app.post('/api/auth/redefinir-senha', async (req, res) => {
    const email = normalizeEmail(req.body.email);
    const codigo = String(req.body.codigo || '').trim();
    const novaSenha = String(req.body.novaSenha || '');

    if (!validarEmail(email) || !codigo || !novaSenha) {
        return jsonError(res, 400, 'DADOS_INCOMPLETOS');
    }

    const erroSenha = validarSenha(novaSenha);
    if (erroSenha) {
        return jsonError(res, 400, erroSenha);
    }

    const user = db.prepare(`
        SELECT * FROM usuarios
        WHERE email = ? AND reset_codigo = ?
    `).get(email, codigo);

    if (!user) {
        return jsonError(res, 401, 'CODIGO_RESET_INVALIDO');
    }

    if (!isFutureDate(user.reset_expira_em)) {
        return jsonError(res, 410, 'CODIGO_RESET_EXPIRADO');
    }

    const hashSenha = await bcrypt.hash(novaSenha, 10);

    db.prepare(`
        UPDATE usuarios
        SET senha = ?,
            reset_codigo = NULL,
            reset_expira_em = NULL,
            tentativas_login = 0,
            bloqueado_ate = NULL,
            ultima_atividade = ?
        WHERE id = ?
    `).run(hashSenha, new Date().toISOString(), user.id);

    return res.send({ mensagem: 'SENHA_ATUALIZADA_COM_SUCESSO' });
});

app.post('/api/auth/login', async (req, res) => {
    const identificador = normalizeUsuario(req.body.usuario || req.body.identificador);
    const senha = String(req.body.senha || '');

    if (!identificador || !senha) {
        return jsonError(res, 400, 'DADOS_INCOMPLETOS');
    }

    const user = db.prepare(`
        SELECT * FROM usuarios
        WHERE usuario = ? OR email = ?
    `).get(identificador, normalizeEmail(identificador));

    if (!user) {
        return jsonError(res, 401, 'CREDENCIAIS_INVALIDAS');
    }

    if (isFutureDate(user.bloqueado_ate)) {
        return jsonError(res, 423, 'CONTA_TEMPORARIAMENTE_BLOQUEADA', {
            bloqueado_ate: user.bloqueado_ate
        });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
        const tentativas = (Number(user.tentativas_login) || 0) + 1;
        const excedeuLimite = tentativas >= LIMITE_TENTATIVAS_LOGIN;
        const bloqueadoAte = excedeuLimite ? gerarExpiracaoIso(JANELA_BLOQUEIO_MINUTOS) : null;

        db.prepare(`
            UPDATE usuarios
            SET tentativas_login = ?,
                bloqueado_ate = ?
            WHERE id = ?
        `).run(excedeuLimite ? 0 : tentativas, bloqueadoAte, user.id);

        return jsonError(
            res,
            excedeuLimite ? 423 : 401,
            excedeuLimite ? 'CONTA_TEMPORARIAMENTE_BLOQUEADA' : 'CREDENCIAIS_INVALIDAS',
            excedeuLimite ? { bloqueado_ate: bloqueadoAte } : {}
        );
    }

    if (!user.verificado) {
        return jsonError(res, 403, 'CONTA_NAO_VERIFICADA');
    }

    db.prepare(`
        UPDATE usuarios
        SET tentativas_login = 0,
            bloqueado_ate = NULL,
            ultima_atividade = ?
        WHERE id = ?
    `).run(new Date().toISOString(), user.id);

    return res.send({ mensagem: 'ACESSO_LIBERADO', usuario: user.usuario });
});

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'chromebeast-admin-2026';

function verificarAdmin(req, res, next) {
    const token = req.headers.authorization;

    if (token === ADMIN_TOKEN) {
        return next();
    }

    return jsonError(res, 403, 'ACESSO_NEGADO_TOKEN_INVALIDO');
}

app.post('/api/contato', (req, res) => {
    const nome = String(req.body.nome || '').trim();
    const email = normalizeEmail(req.body.email);
    const mensagem = String(req.body.mensagem || '').trim();

    if (!nome || !email || !mensagem) {
        return jsonError(res, 400, 'PACOTE_DE_DADOS_INCOMPLETO');
    }

    if (!validarEmail(email)) {
        return jsonError(res, 400, 'EMAIL_INVALIDO');
    }

    try {
        db.prepare('INSERT INTO mensagens (nome, email, mensagem) VALUES (?, ?, ?)').run(nome, email, mensagem);
        return res.status(201).send({ mensagem: 'SINAL_ARMAZENADO_NO_NUCLEO_SQL' });
    } catch (error) {
        return jsonError(res, 500, 'FALHA_AO_GRAVAR_SQL');
    }
});

app.get('/api/mensagens', verificarAdmin, (req, res) => {
    const dados = db.prepare('SELECT * FROM mensagens ORDER BY data_hora DESC').all();
    res.send(dados);
});

app.delete('/api/mensagens/:id', verificarAdmin, (req, res) => {
    db.prepare('DELETE FROM mensagens WHERE id = ?').run(req.params.id);
    res.send({ mensagem: 'SINAL_PURGADO' });
});

app.listen(PORTA, () => {
    console.log('==========================================');
    console.log('[CHROMEBEAST] NUCLEO LOCAL SQLITE ATIVO');
    console.log(`[BANCO] db: chromebeast.db | [PORTA] ${PORTA}`);
    console.log('[OPERADOR] BAT ENTERPRISE');
    console.log('==========================================');
});
