# RetroBeast Games | Space Conquest V.1

## 🛡️ Projeto de Engenharia de Software
Este projeto consiste em um portal de jogos com estética **Cyber-Gothic**, desenvolvido com uma arquitetura separada em Front-end e Back-end (REST API).

### 🚀 Funcionalidades
- **Boot Sequence (Splash Screens):** Sequência automatizada de inicialização com terminal de logs em tempo real.
- **Interface Cyberpunk:** Efeitos de Glitch, Scanlines (CRT) e Neons dinâmicos via CSS.
- **Sistema de Reporte de Bugs:** Integração real com back-end para registro de anomalias sistêmicas.
- **Container Construct 3:** Estrutura otimizada para carregar jogos exportados do Construct 3 via Iframe.

### 🛠️ Tecnologias Utilizadas
- **Front-end:** HTML5, CSS3 (Custom Variables, Animations), JavaScript Vanilla (ES6+).
- **Back-end:** Node.js, Express.js.
- **Persistência:** Sistema de arquivos JSON para armazenamento de logs de erro.

### 📁 Estrutura do Projeto
```text
projeto-web/
├── backend/
│   ├── server.js (Servidor Express)
│   └── data/ (Armazenamento de bugs.json)
├── game/ (Pasta destinada aos arquivos do Construct 3)
├── index.html (Estrutura e Telas de Splash)
├── style.css (Estilização Cyber-Gothic & CRT)
└── script.js (Lógica de transição e integração API)
```

### ⚙️ Como Executar
1. Instale as dependências do back-end:
   ```bash
   cd backend
   npm install
   ```
2. Inicie o servidor:
   ```bash
   node server.js
   ```
3. Abra o `index.html` em seu navegador.

---
**Desenvolvido por BAT_SYS**
*Protótipo Acadêmico V1.0*
