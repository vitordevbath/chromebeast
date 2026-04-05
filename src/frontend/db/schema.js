const { pgTable, serial, text, timestamp, boolean, integer } = require('drizzle-orm/pg-core');

const mensagensContato = pgTable('mensagens_contato', {
    id: serial('id').primaryKey(),
    nome: text('nome').notNull(),
    email: text('email').notNull(),
    mensagem: text('mensagem').notNull(),
    data_hora: timestamp('data_hora').defaultNow(),
});

const usuarios = pgTable('usuarios', {
    id: serial('id').primaryKey(),
    usuario: text('usuario').notNull(),
    email: text('email').notNull(),
    senha: text('senha').notNull(),
    codigo_verificacao: text('codigo_verificacao'),
    codigo_verificacao_expira_em: text('codigo_verificacao_expira_em'),
    verificado: boolean('verificado').default(false).notNull(),
    reset_codigo: text('reset_codigo'),
    reset_expira_em: text('reset_expira_em'),
    tentativas_login: integer('tentativas_login').default(0).notNull(),
    bloqueado_ate: text('bloqueado_ate'),
    ultima_atividade: text('ultima_atividade'),
});

module.exports = { mensagensContato, usuarios };
