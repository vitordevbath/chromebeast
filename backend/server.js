const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuração de CORS - Essencial para que o frontend fale com o backend local
app.use(cors());
app.use(express.json());

// Garantir que a pasta de dados existe
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// ROTA PRINCIPAL: Salvar Contato (JSON Local)
app.post('/api/contact', (req, res) => {
    const { name, email, message, timestamp } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).send({ error: "DATA_INCOMPLETE" });
    }

    const newMessage = { 
        id: Date.now(),
        name, 
        email, 
        message, 
        timestamp: timestamp || new Date().toISOString() 
    };

    const filePath = path.join(dataDir, 'contact_messages.json');
    
    // Ler arquivo atual, adicionar nova mensagem e salvar
    fs.readFile(filePath, 'utf8', (err, data) => {
        let messages = [];
        if (!err && data) {
            try {
                messages = JSON.parse(data);
            } catch (e) {
                messages = [];
            }
        }
        
        messages.push(newMessage);
        
        fs.writeFile(filePath, JSON.stringify(messages, null, 2), (err) => {
            if (err) {
                return res.status(500).send({ error: "FILE_WRITE_FAILURE" });
            }
            console.log(`[CORE] New Signal from ${name} stored in JSON DATABASE.`);
            res.status(201).send({ message: "SUCCESS_SIGNAL_STORED" });
        });
    });
});

// ROTA EXTRA: Ver todas as mensagens
app.get('/api/messages', (req, res) => {
    const filePath = path.join(dataDir, 'contact_messages.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.send([]);
        try {
            res.send(JSON.parse(data));
        } catch (e) {
            res.send([]);
        }
    });
});

// ROTA EXTRA: Deletar uma mensagem específica
app.delete('/api/messages/:id', (req, res) => {
    const { id } = req.params;
    const filePath = path.join(dataDir, 'contact_messages.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send({ error: "READ_FAILURE" });
        
        let messages = JSON.parse(data || "[]");
        const filteredMessages = messages.filter(m => m.id != id);
        
        fs.writeFile(filePath, JSON.stringify(filteredMessages, null, 2), (err) => {
            if (err) return res.status(500).send({ error: "DELETE_FAILURE" });
            res.send({ message: "SIGNAL_PURGED" });
        });
    });
});

const server = app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`[CHROMEBEAST] LOCAL CORE: http://localhost:${PORT}`);
    console.log(`[STORAGE] Using JSON File: ${dataDir}`);
    console.log(`==========================================`);
});

server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(`[FATAL ERROR] Port ${PORT} is already in use.`);
        console.error(`>> CLOSE existing process using: Stop-Process -Id (Get-NetTCPConnection -LocalPort ${PORT}).OwningProcess -Force`);
        process.exit(1);
    }
});