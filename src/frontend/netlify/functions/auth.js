const crypto = require('crypto');
const { neon } = require('@netlify/neon');
const { drizzle } = require('drizzle-orm/neon-http');
const { and, eq, or, sql } = require('drizzle-orm');
const { usuarios } = require('../../db/schema');

const CODIGO_EXPIRA_MINUTOS = 15;
const LIMITE_TENTATIVAS_LOGIN = 5;
const JANELA_BLOQUEIO_MINUTOS = 15;

function createDb() {
    const query = neon();
    return drizzle(query);
}

function json(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };
}

async function ensureSchema(db) {
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS usuarios (
            id SERIAL PRIMARY KEY,
            usuario TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            codigo_verificacao TEXT,
            codigo_verificacao_expira_em TEXT,
            verificado BOOLEAN NOT NULL DEFAULT FALSE,
            reset_codigo TEXT,
            reset_expira_em TEXT,
            tentativas_login INTEGER NOT NULL DEFAULT 0,
            bloqueado_ate TEXT,
            ultima_atividade TEXT
        )
    `);
}

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function normalizeUsuario(usuario) {
    return String(usuario || '').trim();
}

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarUsuario(usuario) {
    return /^[a-zA-Z0-9_.-]{3,24}$/.test(usuario);
}

function validarSenha(senha) {
    const senhaTexto = String(senha || '');

    if (senhaTexto.length < 8) return 'SENHA_MUITO_CURTA';
    if (!/[A-Z]/.test(senhaTexto)) return 'SENHA_EXIGE_MAIUSCULA';
    if (!/[a-z]/.test(senhaTexto)) return 'SENHA_EXIGE_MINUSCULA';
    if (!/\d/.test(senhaTexto)) return 'SENHA_EXIGE_NUMERO';

    return null;
}

function gerarCodigoNumerico() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function gerarExpiracaoIso(minutos) {
    return new Date(Date.now() + minutos * 60 * 1000).toISOString();
}

function isFutureDate(value) {
    return Boolean(value) && new Date(value).getTime() > Date.now();
}

function hashSenha(senha) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
    return `scrypt$${salt}$${hash}`;
}

function compararSenha(senha, hashArmazenado) {
    const [algoritmo, salt, hashOriginal] = String(hashArmazenado || '').split('$');

    if (algoritmo !== 'scrypt' || !salt || !hashOriginal) {
        return false;
    }

    const hashAtual = crypto.scryptSync(senha, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hashAtual, 'hex'), Buffer.from(hashOriginal, 'hex'));
}

function parseBody(event) {
    try {
        return event.body ? JSON.parse(event.body) : {};
    } catch {
        return {};
    }
}

async function registrar(db, body) {
    const usuario = normalizeUsuario(body.usuario);
    const email = normalizeEmail(body.email);
    const senha = String(body.senha || '');

    if (!usuario || !email || !senha) {
        return json(400, { erro: 'DADOS_INCOMPLETOS' });
    }

    if (!validarUsuario(usuario)) {
        return json(400, { erro: 'USUARIO_INVALIDO' });
    }

    if (!validarEmail(email)) {
        return json(400, { erro: 'EMAIL_INVALIDO' });
    }

    const erroSenha = validarSenha(senha);
    if (erroSenha) {
        return json(400, { erro: erroSenha });
    }

    const codigo = gerarCodigoNumerico();

    try {
        await db.insert(usuarios).values({
            usuario,
            email,
            senha: hashSenha(senha),
            codigo_verificacao: codigo,
            codigo_verificacao_expira_em: gerarExpiracaoIso(CODIGO_EXPIRA_MINUTOS),
            verificado: false,
            tentativas_login: 0,
        });

        return json(201, {
            mensagem: 'IDENTIDADE_CRIADA_AGUARDANDO_VERIFICACAO',
            codigo_desenvolvimento: codigo,
        });
    } catch (error) {
        return json(400, { erro: 'USUARIO_OU_EMAIL_JA_EXISTE' });
    }
}

async function verificar(db, body) {
    const email = normalizeEmail(body.email);
    const codigo = String(body.codigo || '').trim();

    const [user] = await db
        .select()
        .from(usuarios)
        .where(and(eq(usuarios.email, email), eq(usuarios.codigo_verificacao, codigo)))
        .limit(1);

    if (!user) {
        return json(401, { erro: 'CODIGO_INVALIDO' });
    }

    if (!isFutureDate(user.codigo_verificacao_expira_em)) {
        return json(410, { erro: 'CODIGO_EXPIRADO' });
    }

    await db
        .update(usuarios)
        .set({
            verificado: true,
            codigo_verificacao: null,
            codigo_verificacao_expira_em: null,
        })
        .where(eq(usuarios.id, user.id));

    return json(200, { mensagem: 'IDENTIDADE_VALIDADA' });
}

async function esqueciSenha(db, body) {
    const email = normalizeEmail(body.email);

    if (!validarEmail(email)) {
        return json(400, { erro: 'EMAIL_INVALIDO' });
    }

    const [user] = await db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);

    if (!user || !user.verificado) {
        return json(200, { mensagem: 'SE_O_EMAIL_EXISTIR_UM_CODIGO_SERA_ENVIADO' });
    }

    const codigo = gerarCodigoNumerico();

    await db
        .update(usuarios)
        .set({
            reset_codigo: codigo,
            reset_expira_em: gerarExpiracaoIso(CODIGO_EXPIRA_MINUTOS),
        })
        .where(eq(usuarios.id, user.id));

    return json(200, {
        mensagem: 'SE_O_EMAIL_EXISTIR_UM_CODIGO_SERA_ENVIADO',
        codigo_desenvolvimento: codigo,
    });
}

async function redefinirSenha(db, body) {
    const email = normalizeEmail(body.email);
    const codigo = String(body.codigo || '').trim();
    const novaSenha = String(body.novaSenha || '');

    if (!email || !codigo || !novaSenha) {
        return json(400, { erro: 'DADOS_INCOMPLETOS' });
    }

    const erroSenha = validarSenha(novaSenha);
    if (erroSenha) {
        return json(400, { erro: erroSenha });
    }

    const [user] = await db
        .select()
        .from(usuarios)
        .where(and(eq(usuarios.email, email), eq(usuarios.reset_codigo, codigo)))
        .limit(1);

    if (!user) {
        return json(401, { erro: 'CODIGO_RESET_INVALIDO' });
    }

    if (!isFutureDate(user.reset_expira_em)) {
        return json(410, { erro: 'CODIGO_RESET_EXPIRADO' });
    }

    await db
        .update(usuarios)
        .set({
            senha: hashSenha(novaSenha),
            reset_codigo: null,
            reset_expira_em: null,
            tentativas_login: 0,
            bloqueado_ate: null,
            ultima_atividade: new Date().toISOString(),
        })
        .where(eq(usuarios.id, user.id));

    return json(200, { mensagem: 'SENHA_ATUALIZADA_COM_SUCESSO' });
}

async function login(db, body) {
    const identificador = normalizeUsuario(body.usuario || body.identificador);
    const senha = String(body.senha || '');

    if (!identificador || !senha) {
        return json(400, { erro: 'DADOS_INCOMPLETOS' });
    }

    const [user] = await db
        .select()
        .from(usuarios)
        .where(or(eq(usuarios.usuario, identificador), eq(usuarios.email, normalizeEmail(identificador))))
        .limit(1);

    if (!user) {
        return json(401, { erro: 'CREDENCIAIS_INVALIDAS' });
    }

    if (isFutureDate(user.bloqueado_ate)) {
        return json(423, {
            erro: 'CONTA_TEMPORARIAMENTE_BLOQUEADA',
            bloqueado_ate: user.bloqueado_ate,
        });
    }

    const senhaValida = compararSenha(senha, user.senha);

    if (!senhaValida) {
        const tentativas = (Number(user.tentativas_login) || 0) + 1;
        const excedeuLimite = tentativas >= LIMITE_TENTATIVAS_LOGIN;
        const bloqueadoAte = excedeuLimite ? gerarExpiracaoIso(JANELA_BLOQUEIO_MINUTOS) : null;

        await db
            .update(usuarios)
            .set({
                tentativas_login: excedeuLimite ? 0 : tentativas,
                bloqueado_ate: bloqueadoAte,
            })
            .where(eq(usuarios.id, user.id));

        return json(excedeuLimite ? 423 : 401, {
            erro: excedeuLimite ? 'CONTA_TEMPORARIAMENTE_BLOQUEADA' : 'CREDENCIAIS_INVALIDAS',
            bloqueado_ate: bloqueadoAte,
        });
    }

    if (!user.verificado) {
        return json(403, { erro: 'CONTA_NAO_VERIFICADA' });
    }

    await db
        .update(usuarios)
        .set({
            tentativas_login: 0,
            bloqueado_ate: null,
            ultima_atividade: new Date().toISOString(),
        })
        .where(eq(usuarios.id, user.id));

    return json(200, { mensagem: 'ACESSO_LIBERADO', usuario: user.usuario });
}

exports.handler = async (event) => {
    const db = createDb();
    const action = event.queryStringParameters?.action;
    const body = parseBody(event);

    try {
        await ensureSchema(db);

        if (event.httpMethod !== 'POST') {
            return json(405, { erro: 'METODO_NAO_PERMITIDO' });
        }

        switch (action) {
            case 'registrar':
                return registrar(db, body);
            case 'verificar':
                return verificar(db, body);
            case 'login':
                return login(db, body);
            case 'esqueci-senha':
                return esqueciSenha(db, body);
            case 'redefinir-senha':
                return redefinirSenha(db, body);
            default:
                return json(400, { erro: 'ACAO_INVALIDA' });
        }
    } catch (error) {
        console.error('Auth Function Error:', error);
        return json(500, {
            erro: 'FALHA_NO_NUCLEO_AUTH',
            detalhes: error.message,
        });
    }
};
