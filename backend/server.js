const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Rota para Reportar Bug
app.post('/api/bugs', (req, res) => {
    const { title, description, timestamp } = req.body;
    const bugReport = { title, description, timestamp, id: Date.now() };

    const filePath = path.join(__dirname, 'data', 'bugs.json');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        let bugs = [];
        if (!err && data) {
            bugs = JSON.parse(data);
        }
        bugs.push(bugReport);
        
        fs.writeFile(filePath, JSON.stringify(bugs, null, 2), (err) => {
            if (err) return res.status(500).send('Erro ao salvar bug.');
            res.status(201).send({ message: 'Bug reportado.' });
        });
    });
});

// Rota para fechar o servidor
app.get('/api/shutdown', (req, res) => {
    res.send('Fechando servidor...');
    process.exit();
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});