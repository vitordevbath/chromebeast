# Starcore Sentinel

Landing page com painel admin, backend local em Express + SQLite, launcher em .NET e suporte parcial de deploy com Netlify Functions + Neon/Drizzle.

## Estrutura

- `src/frontend`: interface estática, login/cadastro, recuperação de senha, contato e painel admin
- `src/backend`: API local em Express, autenticação, SQLite e envio opcional de e-mail via SMTP
- `src/launcher`: launcher em .NET 7 para subir o backend e abrir o sistema
- `dist`: artefatos já gerados localmente e ignorados no Git

## Rodar Localmente

### Opção rápida

Execute o launcher `dist\StarcoreLauncher.exe`.

Esse executável único:

- embute backend, frontend e runtime local do Node
- sobe o servidor local
- abre `http://localhost:3000`

### Fallback

Se você estiver sem o `.exe` publicado, use `START_SYSTEM.bat` na raiz do projeto.

### Opção manual

No diretório `src/backend`:

```powershell
npm install
node server.js
```

Depois abra `http://localhost:3000`.

## Gerar Pacote EXE

Para publicar novamente o launcher único:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\publish-launcher.ps1
```

Pré-requisito para publicar:

- Node.js instalado localmente
- Visual Studio 2026 / SDK .NET compatível com o projeto

Saídas geradas localmente:

- `dist\StarcoreLauncher.exe`
- `dist\launcher-exe\...`

## Sistema de Contas

- cadastro com validação de usuário, e-mail e senha forte
- verificação por código com expiração
- login por usuário ou e-mail
- bloqueio temporário após múltiplas tentativas inválidas
- fluxo de recuperação de senha com código temporário

Se `SMTP_USER` não estiver configurado no `.env`, os códigos são devolvidos na resposta da API como `codigo_desenvolvimento` para facilitar testes locais.

## Painel Admin

Abra `http://localhost:3000/admin.html` ou `src/frontend/admin.html`.

O painel exige `ADMIN_TOKEN`, salvo no navegador pelo próprio formulário da tela.

## Deploy

- contato: `src/frontend/netlify/functions/contact.js`
- mensagens admin: `src/frontend/netlify/functions/messages.js`

As funções de autenticação continuam locais no backend Express.

## Desenvolvido por

**bat enterprise**
