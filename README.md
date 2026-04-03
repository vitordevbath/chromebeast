# CHROMEBEAST

Landing page com painel admin, backend local em Express e suporte de deploy via Netlify Functions + Neon/Drizzle.

## Estrutura

- `frontend/`: interface estática, formulário e painel admin
- `backend/`: API local em Express para desenvolvimento/offline
- `frontend/netlify/functions/`: API para deploy na Netlify

## Rodar Localmente

### Opção rápida

Execute [START_SYSTEM.bat](C:/Users/vitor/Desktop/projeto-web/START_SYSTEM.bat).

Também existe um launcher em [dist/CHROMEBEAST_Launcher.exe](C:/Users/vitor/Desktop/projeto-web/dist/CHROMEBEAST_Launcher.exe).

Isso faz:

- sobe o backend local em `http://localhost:3000`
- abre [frontend/index.html](C:/Users/vitor/Desktop/projeto-web/frontend/index.html)

### Opção manual

No diretório [backend](C:/Users/vitor/Desktop/projeto-web/backend):

```powershell
node server.js
```

Depois abra [frontend/index.html](C:/Users/vitor/Desktop/projeto-web/frontend/index.html) no navegador.

## Fluxo de API

- Local com arquivo HTML aberto ou frontend em host local: usa `http://localhost:3000/api`
- Deploy na Netlify: usa `/.netlify/functions`

Mensagens locais ficam em `backend/data/contact_messages.json` e esse arquivo está ignorado no Git.

## Launcher EXE

O executável em [dist/CHROMEBEAST_Launcher.exe](C:/Users/vitor/Desktop/projeto-web/dist/CHROMEBEAST_Launcher.exe) inicia a mesma automação do `.bat`.

Observação:

- ele foi gerado para o caminho atual do projeto: `C:\Users\vitor\Desktop\projeto-web`
- se a pasta for movida, o `.exe` precisa ser regenerado

## Deploy na Netlify

Configuração atual em [netlify.toml](C:/Users/vitor/Desktop/projeto-web/netlify.toml):

- `base = "frontend"`
- `publish = "."`
- `functions = "netlify/functions"`

Para o deploy funcionar, a Netlify precisa ter acesso ao banco Neon usado pelas functions em [frontend/netlify/functions/contact.js](C:/Users/vitor/Desktop/projeto-web/frontend/netlify/functions/contact.js) e [frontend/netlify/functions/messages.js](C:/Users/vitor/Desktop/projeto-web/frontend/netlify/functions/messages.js).

## Painel Admin

Abra [frontend/admin.html](C:/Users/vitor/Desktop/projeto-web/frontend/admin.html) para listar e apagar mensagens.

## Validação Feita

- checagem de sintaxe com `node --check`
- teste real local de criação, listagem e exclusão de mensagens
