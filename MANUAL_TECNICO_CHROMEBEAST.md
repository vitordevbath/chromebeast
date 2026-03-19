# MANUAL TÉCNICO: SISTEMA CHROMEBEAST V1.0
**Documentação de Engenharia de Software e Arquitetura Fullstack**

---

## 1. VISÃO GERAL DA ARQUITETURA
O projeto **ChromeBeast** segue o modelo **Client-Server (Cliente-Servidor)**. 
- **Client (Front-end):** Responsável pela interface, experiência do usuário (UX) e captura de dados.
- **Server (Back-end):** Responsável pelo processamento lógico, segurança e persistência de dados.

---

## 2. O CORAÇÃO DO AMBIENTE (CONFIGURAÇÕES)

### 2.1. `package.json`
É o manifesto do projeto. Ele contém:
- **Metadata:** Nome, versão e descrição do software.
- **Scripts:** Atalhos de terminal (ex: `npm start`).
- **Dependencies:** Lista as bibliotecas externas vitais. No seu caso:
  - `express`: O motor do servidor.
  - `cors`: O "porteiro" que permite a comunicação entre diferentes endereços.

### 2.2. `package-lock.json`
Este arquivo é uma "foto" exata de todas as dependências instaladas. 
- **Por que ele existe?** Ele trava as versões exatas de cada sub-biblioteca. Se uma biblioteca que você usa for atualizada e quebrar, o `package-lock` garante que seu projeto continue usando a versão antiga que funciona. Ele evita o erro "na minha máquina funciona, na sua não".

### 2.3. `node_modules/`
Pasta que armazena o código real das bibliotecas listadas no `package.json`. É a pasta mais pesada do projeto e nunca deve ser editada manualmente.

### 2.4. `netlify.toml`
Arquivo de configuração de "Infrastructure as Code" (Infraestrutura como Código). 
- **Função:** Instruir o servidor de nuvem (Netlify) a ignorar a raiz e servir apenas os arquivos da pasta `/frontend` para o público, aumentando a segurança.

---

## 3. FRONT-END: A INTERFACE IMERSIVA (LOCALIZADO EM /frontend)

### 3.1. `index.html` (Estrutura Semântica)
Utiliza tags HTML5 para organizar o conteúdo de forma lógica para navegadores e acessibilidade:
- `<nav>`: Menu de navegação híbrida que flutua no topo.
- `<section>`: Divisões lógicas (Home, Play, Gallery, etc.) que facilitam o "scroll suave".
- `<audio>` e `<video>`: Elementos multimídia que trazem imersão sensorial (som ambiente e vídeo do urso).

### 3.2. `style.css` (Design & Efeitos Especiais)
Aqui reside a estética **Cyber-Gothic**:
- **Variáveis CSS (`:root`):** Centralizam as cores Neon (Azul e Rosa) para facilitar mudanças globais.
- **CRT Scanlines:** Um gradiente repetitivo aplicado no `::after` do body que simula as linhas horizontais de monitores antigos.
- **Glassmorphism:** Uso de `backdrop-filter: blur()` e transparências para criar o efeito de vidro fosco nos cards de conteúdo.
- **Custom Cursor:** Desativa o cursor padrão (`cursor: none`) e cria dois elementos div que seguem as coordenadas X e Y do mouse via JavaScript, criando um efeito de mira neon.

### 3.3. `script.js` (Lógica do Navegador)
- **Event Listeners:** Monitoram cliques e o movimento do mouse para atualizar o cursor personalizado em tempo real.
- **Boot Sequence:** Uma função assíncrona que coordena a transição exata: Vídeo do Urso -> Terminal de BIOS (Módulos) -> Entrada no Site.
- **Fetch API (Comunicação de Rede):** O método `fetch` realiza uma requisição HTTP do tipo `POST` para o servidor. Ele converte os dados do formulário em um objeto **JSON** e o envia pela rede para processamento.

---

## 4. BACK-END: O MOTOR DE DADOS (LOCALIZADO EM /backend)

### 4.1. `server.js` (Node.js + Express)
O servidor atua como uma **API REST**:
- **Express Middleware:**
  - `express.json()`: Permite que o servidor entenda dados enviados no formato JSON.
  - `cors()`: Habilita o **Cross-Origin Resource Sharing**, permitindo que o navegador aceite respostas de um servidor local, evitando erros de segurança comuns no desenvolvimento web.
- **EndPoints (Rotas):**
  - `POST /api/contact`: Recebe os dados do site. Ele usa o módulo `fs` (File System) do Node para ler o banco de dados JSON, adicionar o novo contato com um carimbo de data (`timestamp`) e reescrever o arquivo com a nova informação.
  - `GET /api/messages`: Recupera o histórico de todas as mensagens recebidas para que a Dashboard de Admin possa exibí-las.
  - `DELETE /api/messages/:id`: Filtra o array de mensagens por ID, removendo a mensagem solicitada e salvando o arquivo novamente (Protocolo PURGE).

### 4.2. `contact_messages.json` (Banco de Dados Flat-File)
- Localizado em `backend/data/`.
- É um banco de dados NoSQL simplificado que armazena informações em formato de texto estruturado. 
- **Vantagem:** Extrema rapidez para prototipagem e total transparência dos dados.

---

## 5. FLUXO DE EXECUÇÃO (O CAMINHO DO DADO)
1. O usuário clica no botão **REQUEST_YOUR_SOUL**.
2. O Front-end dispara o som `click.mp3` e inicia o vídeo `intro.mp4`.
3. Ao fim do vídeo, a função `startBootSequence` exibe os logs de carregamento.
4. O usuário preenche o formulário de contato.
5. O JavaScript (`fetch`) captura os dados e envia para `http://localhost:3000/api/contact`.
6. O Servidor recebe, valida os campos e grava no arquivo `contact_messages.json`.
7. O Administrador acessa a página secreta `admin.html`, que faz um pedido `GET` ao servidor para listar e gerenciar as mensagens recebidas.

---

## 6. GUIA PARA DEFESA ACADÊMICA (Q&A TÉCNICO)

Este capítulo contém os termos e conceitos que demonstram domínio técnico durante a apresentação de 10 minutos.

### 6.1. ARQUITETURA E COMUNICAÇÃO
- **Pergunta:** "Como o Front-end envia dados para o servidor?"
- **Resposta:** "Utilizamos uma arquitetura **RESTful**. O Front-end consome a API através da **Fetch API** nativa do JavaScript. Os dados são enviados via método **POST**, encapsulados em formato **JSON** (JavaScript Object Notation), garantindo um padrão universal de intercâmbio de dados."
- **Conceito Chave:** *Request/Response Cycle* (Ciclo de Requisição e Resposta).

### 6.2. FRONT-END: ESTÉTICA E UX
- **Pergunta:** "Como os efeitos visuais foram implementados sem frameworks?"
- **Resposta:** "Focamos em **JS Vanilla** e **CSS3 Avançado**. O design utiliza **CSS Custom Variables** para consistência. Efeitos como as *CRT Scanlines* são aplicados via pseudo-elementos (`::after`) com gradientes lineares repetitivos. O cursor personalizado é gerado por **Manipulação do DOM**, rastreando as coordenadas X e Y do mouse em tempo real."
- **Conceito Chave:** *Glassmorphism* (Efeito de vidro fosco) e *Responsividade* (uso de `clamp` e `flexbox`).

### 6.3. BACK-END E PERSISTÊNCIA
- **Pergunta:** "Por que Node.js e onde os dados são salvos?"
- **Resposta:** "O servidor roda em **Node.js** com o framework **Express**. Para persistência, utilizamos um banco de dados **Flat-File** (JSON). O servidor utiliza o módulo **`fs` (File System)** do Node para operações de I/O de forma assíncrona, garantindo que o servidor processe múltiplas requisições sem bloqueio (Non-blocking I/O)."
- **Conceito Chave:** *Middleware* (CORS e Express.JSON).

### 6.4. GERENCIAMENTO DE AMBIENTE
- **Pergunta:** "Para que serve o arquivo `package-lock.json`?"
- **Resposta:** "Enquanto o `package.json` lista as dependências, o **`package-lock.json`** garante a **determinística** da instalação. Ele trava as versões exatas de todas as sub-dependências na árvore de módulos, garantindo que o ambiente de produção (Netlify) seja idêntico ao ambiente de desenvolvimento local."
- **Conceito Chave:** *Dependency Management* (Gerenciamento de Dependências).

### 6.5. SEGURANÇA E POLÍTICAS DE ACESSO
- **Pergunta:** "O que é CORS e por que foi necessário?"
- **Resposta:** "**CORS** (*Cross-Origin Resource Sharing*) é uma política de segurança dos navegadores. Como o Front-end (porta local ou domínio Netlify) e o Back-end (porta 3000) estão em origens diferentes, o servidor precisa explicitamente autorizar o acesso aos recursos para que o navegador permita o tráfego de dados."
- **Conceito Chave:** *Deployment Pipelines* (configurado via `netlify.toml`).

---
**Desenvolvido por BAT_SYS - Documentação Técnica V1.0**