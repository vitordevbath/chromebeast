const { neon } = require('@netlify/neon');
const { drizzle } = require('drizzle-orm/neon-http');
const { desc, eq, sql } = require('drizzle-orm');
const { mensagensContato } = require('../../db/schema');

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'bat-sentinel-2026';

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

function validarAdmin(event) {
    return event.headers?.authorization === ADMIN_TOKEN;
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
    const db = createDb();

    try {
        await ensureSchema(db);

        if (!validarAdmin(event)) {
            return json(403, { error: 'ACESSO_NEGADO_TOKEN_INVALIDO' });
        }

        if (event.httpMethod === 'GET') {
            const messages = await db
                .select()
                .from(mensagensContato)
                .orderBy(desc(mensagensContato.data_hora));

            return json(200, messages);
        }

        if (event.httpMethod === 'DELETE') {
            const id = Number(event.queryStringParameters?.id);

            if (!Number.isInteger(id)) {
                return json(400, { error: 'INVALID_SIGNAL_ID' });
            }

            await db.delete(mensagensContato).where(eq(mensagensContato.id, id));
            return json(200, { message: 'SIGNAL_PURGED' });
        }

        return json(405, { error: 'METHOD_NOT_ALLOWED' });
    } catch (error) {
        console.error('Messages Function Error:', error);
        return json(500, {
            error: 'MESSAGE_CORE_FAILURE',
            details: error.message,
        });
    }
};
