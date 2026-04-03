const { neon } = require('@netlify/neon');
const { drizzle } = require('drizzle-orm/neon-http');
const { desc, eq } = require('drizzle-orm');
const { contactMessages } = require('../../db/schema');

function createDb() {
    const sql = neon();
    return drizzle(sql);
}

function json(statusCode, body) {
    return {
        statusCode,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    };
}

exports.handler = async (event) => {
    const db = createDb();

    try {
        if (event.httpMethod === 'GET') {
            const messages = await db
                .select()
                .from(contactMessages)
                .orderBy(desc(contactMessages.timestamp));

            return json(200, messages);
        }

        if (event.httpMethod === 'DELETE') {
            const id = event.path.split('/').pop();
            const numericId = Number(id);

            if (!Number.isInteger(numericId)) {
                return json(400, { error: 'INVALID_SIGNAL_ID' });
            }

            await db.delete(contactMessages).where(eq(contactMessages.id, numericId));
            return json(200, { message: 'SIGNAL_PURGED' });
        }

        return json(405, { error: 'METHOD_NOT_ALLOWED' });
    } catch (error) {
        console.error('Messages Function Error:', error);
        return json(500, {
            error: 'MESSAGE_CORE_FAILURE',
            details: error.message
        });
    }
};
