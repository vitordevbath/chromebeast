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
    
    if (!name || !email || !message) {
        return res.status(400).send({ error: "MISSING_DATA_PACKAGE" });
    }

    const contactMessage = { name, email, message, timestamp, id: Date.now() };
    const filePath = path.join(dataDir, 'contact_messages.json');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        let messages = [];
        if (!err && data) {
            try {
                messages = JSON.parse(data);
            } catch (parseErr) {
                messages = [];
            }
        }
        messages.push(contactMessage);
        
        fs.writeFile(filePath, JSON.stringify(messages, null, 2), (err) => {
            if (err) {
                return res.status(500).send({ error: "STORAGE_FAILURE" });
            }
            console.log(`[SIGNAL] Message received from: ${name}`);
            res.status(201).send({ message: 'Signal received.' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`[CHROMEBEAST] CORE ACTIVE ON PORT ${PORT}`);
    console.log(`==========================================`);
});