const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORTA = 3000;

app.use(cors());
app.use(express.json());

const diretorioDados = path.join(__dirname, 'data');
if (!fs.existsSync(diretorioDados)) {
    fs.mkdirSync(diretorioDados);
}

// ROTA: Salvar Contato (JSON Local)
app.post('/api/contato', (req, res) => {
    const { nome, email, mensagem, data_hora } = req.body;
    
    if (!nome || !email || !mensagem) {
        return res.status(400).send({ erro: "DADOS_INCOMPLETOS" });
    }

    const novaMensagem = { 
        id: Date.now(),
        nome, 
        email, 
        mensagem, 
        data_hora: data_hora || new Date().toISOString() 
    };

    const caminhoArquivo = path.join(diretorioDados, 'mensagens_contato.json');
    
    fs.readFile(caminhoArquivo, 'utf8', (err, dados) => {
        let mensagens = [];
        if (!err && dados) {
            try {
                mensagens = JSON.parse(dados);
            } catch (e) {
                mensagens = [];
            }
        }
        
        mensagens.push(novaMensagem);
        
        fs.writeFile(caminhoArquivo, JSON.stringify(mensagens, null, 2), (err) => {
            if (err) {
                return res.status(500).send({ erro: "FALHA_AO_GRAVAR_ARQUIVO" });
            }
            console.log(`[NÚCLEO] Novo sinal de ${nome} armazenado.`);
            res.status(201).send({ mensagem: "SUCESSO_SINAL_ARMAZENADO" });
        });
    });
});

// ROTA: Listar Mensagens
app.get('/api/mensagens', (req, res) => {
    const caminhoArquivo = path.join(diretorioDados, 'mensagens_contato.json');
    fs.readFile(caminhoArquivo, 'utf8', (err, dados) => {
        if (err) return res.send([]);
        try {
            res.send(JSON.parse(dados));
        } catch (e) {
            res.send([]);
        }
    });
});

// ROTA: Deletar Mensagem
app.delete('/api/mensagens/:id', (req, res) => {
    const { id } = req.params;
    const caminhoArquivo = path.join(diretorioDados, 'mensagens_contato.json');

    fs.readFile(caminhoArquivo, 'utf8', (err, dados) => {
        if (err) return res.status(500).send({ erro: "FALHA_NA_LEITURA" });
        
        let mensagens = JSON.parse(dados || "[]");
        const mensagensFiltradas = mensagens.filter(m => m.id != id);
        
        fs.writeFile(caminhoArquivo, JSON.stringify(mensagensFiltradas, null, 2), (err) => {
            if (err) return res.status(500).send({ erro: "FALHA_NA_EXCLUSÃO" });
            res.send({ mensagem: "SINAL_PURGADO" });
        });
    });
});

const servidor = app.listen(PORTA, () => {
    console.log(`==========================================`);
    console.log(`[CHROMEBEAST] NÚCLEO LOCAL: http://localhost:${PORTA}`);
    console.log(`[ARMAZENAMENTO] Usando arquivo JSON em: ${diretorioDados}`);
    console.log(`==========================================`);
});

servidor.on('error', (erro) => {
    if (erro.code === 'EADDRINUSE') {
        console.error(`\n[ERRO FATAL] A porta ${PORTA} já está sendo usada.`);
        console.error(`>> Libere a porta com o comando: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORTA}).OwningProcess -Force\n`);
        process.exit(1);
    }
});
