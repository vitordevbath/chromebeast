const { neon } = require('@netlify/neon');

exports.handler = async (event) => {
    // Bloqueia qualquer método que não seja POST
    if (event.httpMethod !== "POST") {
        return { 
            statusCode: 405, 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: "METHOD_NOT_ALLOWED" }) 
        };
    }

    try {
        const { name, email, message, timestamp } = JSON.parse(event.body);
        
        // Validação básica de segurança
        if (!name || !email || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "INCOMPLETE_DATA_PACKAGE" })
            };
        }

        // O neon() sem argumentos usa automaticamente a variável NETLIFY_DATABASE_URL
        const sql = neon();

        // Insere a mensagem no banco de dados Neon
        await sql`
            INSERT INTO contact_messages (name, email, message, timestamp)
            VALUES (${name}, ${email}, ${message}, ${timestamp || new Date().toISOString()})
        `;

        return {
            statusCode: 201,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: "SIGNAL_STORED_IN_NEON_CORE",
                status: "SECURE"
            }),
        };
    } catch (error) {
        console.error('Neon Database Error:', error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                error: "SYSTEM_DATABASE_FAILURE", 
                details: "Check if the 'contact_messages' table exists in Neon console." 
            }),
        };
    }
};