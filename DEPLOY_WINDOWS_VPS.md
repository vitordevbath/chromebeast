# Deploy Windows VPS

## O que instalar

- Node.js LTS
- Git for Windows
- opcional: NSSM
- opcional: Nginx para Windows ou IIS com ARR

## Passo a passo

1. Copie ou clone o projeto na VPS.
2. Entre em `src/backend`.
3. Rode:

```powershell
npm install
node server.js
```

4. Teste no navegador:

```text
http://IP_DA_VPS:3000
```

## Variáveis de ambiente

Use `.env.example` como base.

Campos principais:

- `ADMIN_TOKEN`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

## Rodar com script

Na raiz do projeto:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-backend.ps1
```

## Rodar como serviço no Windows

Opção recomendada: NSSM.

Configuração do serviço:

- Application: caminho do `node.exe`
- Startup directory: `C:\StarcoreSentinel\src\backend`
- Arguments: `server.js`

## Proxy reverso

Se quiser domínio e porta 80/443:

- Nginx para Windows
- ou IIS com ARR

Proxy para:

- `http://localhost:3000`

## Estrutura usada no servidor

- `src/frontend`: frontend estático
- `src/backend`: backend Express + SQLite
- `src/backend/data/starcore.db`: banco local

## Observação importante

O Express já serve frontend e API no mesmo processo. Então para VPS não precisa Netlify, Firebase nem outro backend remoto.
