# Starcore Sentinel

Landing page com painel admin, backend local em Express + SQLite e launcher em .NET para automação no Windows.

## Estrutura

- `src/frontend`: interface estática, login/cadastro, recuperação de senha, contato e painel admin
- `src/backend`: API local em Express, autenticação, SQLite e envio opcional de e-mail via SMTP
- `src/launcher`: launcher em .NET 7 para subir o backend e abrir o sistema
- `dist`: artefatos gerados localmente

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

## Deploy em VPS

O modelo de deploy recomendado agora é simples:

1. subir o projeto em uma VPS Linux ou Windows
2. instalar Node.js
3. rodar o backend Express em `src/backend`
4. expor a porta 3000 diretamente ou colocar Nginx/Caddy na frente

Como o Express já serve o frontend estático e a API no mesmo processo, não é necessário Netlify nem funções serverless.

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

## Variáveis de Ambiente

Local ou VPS:

- copie `.env.example` para `.env` no backend quando quiser SMTP real
- `ADMIN_TOKEN` controla o acesso ao painel admin
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM` controlam o envio de e-mail

## Desenvolvido por

**bat enterprise**
