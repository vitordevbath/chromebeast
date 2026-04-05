# Starcore Sentinel

Landing page com painel admin, backend em Express, autenticacao propria e launcher em .NET para automacao no Windows.

## Estrutura

- `src/frontend`: interface estatica, login/cadastro, recuperacao de senha, contato e painel admin
- `src/backend`: API em Express, autenticacao, persistencia hibrida e envio opcional de e-mail via SMTP
- `src/launcher`: launcher em .NET 7 para subir o backend e abrir o sistema
- `dist`: artefatos gerados localmente

## Rodar Localmente

### Opcao rapida

Execute o launcher `dist\\StarcoreLauncher.exe`.

Esse executavel unico:

- embute backend, frontend e runtime local do Node
- sobe o servidor local com SQLite
- abre `http://localhost:3000`

### Fallback

Se voce estiver sem o `.exe` publicado, use `START_SYSTEM.bat` na raiz do projeto.

### Opcao manual

No diretorio `src/backend`:

```powershell
npm install
node server.js
```

Depois abra `http://localhost:3000`.

## Banco de Dados

O backend escolhe o banco automaticamente:

- sem `DATABASE_URL`: usa SQLite local em `src/backend/data/starcore.db`
- com `DATABASE_URL` ou `SUPABASE_DB_URL`: usa Postgres remoto

Isso permite manter o `.exe` local do jeito atual e, no deploy, usar banco gratuito em nuvem.

## Deploy Gratuito Recomendado

O fluxo mais coerente para publicar sem custo inicial e:

1. `Supabase` para o banco Postgres gratuito
2. `Render` para hospedar o backend Express

Nesse modelo:

- o Render hospeda a aplicacao Node e entrega uma URL publica
- o Supabase guarda usuarios, codigos de recuperacao e mensagens
- o frontend continua sendo servido pelo proprio Express

### Variaveis para o Render

Configure no servico:

- `HOST=0.0.0.0`
- `PORT=10000`
- `DATABASE_URL=sua-string-postgres-do-supabase`
- `DATABASE_SSL=true`
- `ADMIN_TOKEN=seu-token`

### Build e Start no Render

No diretorio `src/backend`:

```text
Build Command: npm install
Start Command: node server.js
```

Sem SMTP, os fluxos de verificacao e reset continuam funcionando retornando `codigo_desenvolvimento` na API.

No plano gratuito do Render, o caminho mais simples e deixar `SMTP_*` vazio e usar esse retorno de codigo, porque as portas SMTP comuns podem ficar indisponiveis no free tier.

## Gerar Pacote EXE

Para publicar novamente o launcher unico:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\publish-launcher.ps1
```

Pre-requisito para publicar:

- Node.js instalado localmente
- Visual Studio 2026 ou SDK .NET compativel com o projeto

Saidas geradas localmente:

- `dist\\StarcoreLauncher.exe`
- `dist\\launcher-exe\\...`

## Sistema de Contas

- cadastro com validacao de usuario, e-mail e senha forte
- verificacao por codigo com expiracao
- login por usuario ou e-mail
- bloqueio temporario apos multiplas tentativas invalidas
- fluxo de recuperacao de senha com codigo temporario

Se `SMTP_USER` nao estiver configurado no `.env`, os codigos sao devolvidos na resposta da API como `codigo_desenvolvimento` para facilitar testes locais.

## Painel Admin

Abra `http://localhost:3000/admin.html`.

O painel exige `ADMIN_TOKEN`, salvo no navegador pelo proprio formulario da tela.

## Variaveis de Ambiente

Local, VPS ou Render:

- copie `.env.example` para `.env` no backend quando quiser SMTP real ou Postgres remoto
- `ADMIN_TOKEN` controla o acesso ao painel admin
- `DATABASE_URL` ou `SUPABASE_DB_URL` ativa o modo Postgres remoto
- `DATABASE_SSL=true` e o padrao recomendado para bancos hospedados
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM` controlam o envio de e-mail

## Desenvolvido por

**bat enterprise**
