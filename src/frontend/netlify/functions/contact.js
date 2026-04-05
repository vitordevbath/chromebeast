const { neon } = require('@netlify/neon');
const { drizzle } = require('drizzle-orm/neon-http');
const { mensagensContato } = require('../../db/schema');

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ erro: "MÉTODO_NÃO_PERMITIDO" }) };
    }

    try {
        const { nome, email, mensagem } = JSON.parse(event.body);

        if (!nome || !email || !mensagem) {
            return { statusCode: 400, body: JSON.stringify({ erro: "PACOTE_DE_DADOS_INCOMPLETO" }) };
        }

        const sql = neon();
        const db = drizzle(sql);

        await db.insert(mensagensContato).values({
            nome,
            email,
            mensagem,
            data_hora: new Date()
        });

        return {
            statusCode: 201,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensagem: "SINAL_ARMAZENADO_VIA_DRIZZLE" }),
        };
    } catch (erro) {
        console.error('Erro Drizzle:', erro);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ erro: "FALHA_NO_NÚCLEO_DRIZZLE", detalhes: erro.message }),
        };
    }
};
