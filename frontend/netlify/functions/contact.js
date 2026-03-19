const { neon } = require('@netlify/neon');
const { drizzle } = require('drizzle-orm/neon-http');
const { contactMessages } = require('../../db/schema');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ error: "METHOD_NOT_ALLOWED" }) };
    }

    try {
        const { name, email, message } = JSON.parse(event.body);

        // Validação rápida de segurança
        if (!name || !email || !message) {
            return { statusCode: 400, body: JSON.stringify({ error: "INCOMPLETE_DATA_PACKAGE" }) };
        }

        // Conecta ao Neon (Padrão Automático Netlify DB)
        const sql = neon();
        const db = drizzle(sql);

        // Insere a mensagem de contato usando Drizzle ORM
        await db.insert(contactMessages).values({
            name,
            email,
            message,
            timestamp: new Date()
        });

        return {
            statusCode: 201,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: "SIGNAL_STORED_VIA_DRIZZLE_CORE" }),
        };
    } catch (error) {
        console.error('Drizzle Error:', error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "DRIZZLE_CORE_FAILURE", details: error.message }),
        };
    }
};