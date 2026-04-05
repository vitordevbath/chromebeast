const { pgTable, serial, text, timestamp } = require('drizzle-orm/pg-core');

// Definição da tabela de contatos (Padrão Neon/Drizzle)
const mensagensContato = pgTable('mensagens_contato', {
  id: serial('id').primaryKey(),
  nome: text('nome').notNull(),
  email: text('email').notNull(),
  mensagem: text('mensagem').notNull(),
  data_hora: timestamp('data_hora').defaultNow(),
});

module.exports = { mensagensContato };
