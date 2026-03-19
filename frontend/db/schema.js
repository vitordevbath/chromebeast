const { pgTable, serial, text, timestamp } = require('drizzle-orm/pg-core');

// Definição da tabela de contatos (Padrão Neon/Drizzle)
const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

module.exports = { contactMessages };