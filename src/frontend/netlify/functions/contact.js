const { neon } = require('@netlify/neon');
const { drizzle } = require('drizzle-orm/neon-http');
const { sql } = require('drizzle-orm');
const { mensagensContato } = require('../../db/schema');

function createDb() {
    const query = neon();
    return drizzle(query);
}

async function ensureSchema(db) {
    await db.execute(sql`
        CREATE TABLE IF NOT EXISTS mensagens_contato (
            id SERIAL PRIMARY KEY,
            nome TEXT NOT NULL,
            email TEXT NOT NULL,
            mensagem TEXT NOT NULL,
            data_hora TIMESTAMP DEFAULT NOW()
        )
    `);
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ erro: 'METODO_NAO_PERMITIDO' }),
        };
    }

    try {
        const { nome, email, mensagem } = JSON.parse(event.body || '{}');

        if (!nome || !email || !mensagem) {
            return {
                statusCode: 400,
                body: JSON.stringify({ erro: 'PACOTE_DE_DADOS_INCOMPLETO' }),
            };
        }

        const db = createDb();
        await ensureSchema(db);

        await db.insert(mensagensContato).values({
            nome,
            email,
            mensagem,
            data_hora: new Date(),
        });

        return {
            statusCode: 201,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensagem: 'SINAL_ARMAZENADO_VIA_DRIZZLE' }),
        };
    } catch (erro) {
        console.error('Erro Drizzle:', erro);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ erro: 'FALHA_NO_NUCLEO_DRIZZLE', detalhes: erro.message }),
        };
    }
};
