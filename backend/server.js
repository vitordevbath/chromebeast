const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Configuração de CORS para permitir que o Vercel acesse seu PC
app.use(cors({
    origin: '*', // Permite qualquer origem (ideal para teste com Vercel + Local)
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Route for Contact Form
app.post('/api/contact', (req, res) => {
    const { name, email, message, timestamp } = req.body;
    const contactMessage = { name, email, message, timestamp, id: Date.now() };

    const filePath = path.join(dataDir, 'contact_messages.json');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        let messages = [];
        if (!err && data) {
            try {
                messages = JSON.parse(data);
            } catch (parseErr) {
                console.error('Error parsing JSON:', parseErr);
                messages = [];
            }
        }
        messages.push(contactMessage);
        
        fs.writeFile(filePath, JSON.stringify(messages, null, 2), (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return res.status(500).send('Error saving contact signal.');
            }
            res.status(201).send({ message: 'Signal received.' });
        });
    });
});

// Route to shutdown server
app.get('/api/shutdown', (req, res) => {
    res.send('Shutting down server...');
    process.exit();
});

app.listen(PORT, () => {
    console.log(`[CHROMEBEAST] Server active on port ${PORT}`);
});