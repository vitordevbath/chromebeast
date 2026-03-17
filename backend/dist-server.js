const express = require('express');
const AdmZip = require('adm-zip');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 8080; // Porta do Servidor de Distribuição

// Função para pegar o SEU IP na rede local (Wi-Fi)
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        let iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            let alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '0.0.0.0';
}

app.get('/download-chromebeast', (req, res) => {
    console.log(`[SYS] SOLICITAÇÃO RECEBIDA DE: ${req.ip}`);
    
    const zip = new AdmZip();
    const sourceDir = path.join(__dirname, '..'); // Sobe um nível para pegar a pasta do projeto inteira
    
    // Ignora a pasta node_modules (muito pesada) para o download ser rápido
    zip.addLocalFolder(sourceDir, "", (path) => !path.includes('node_modules') && !path.includes('.git'));
    
    const zipBuffer = zip.toBuffer();
    
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename=chromebeast_system.zip');
    res.send(zipBuffer);
    console.log("[SYS] ENVIO DO PROJETO CONCLUÍDO.");
});

app.listen(PORT, () => {
    console.log("==========================================");
    console.log("   CHROMEBEAST DISTRIBUITION SERVER");
    console.log("==========================================");
    console.log(`[!] DIGITE ESTE IP NO INSTALADOR DO PROFESSOR: ${getLocalIP()}`);
    console.log(`[!] AGUARDANDO CONEXÃO NA PORTA: ${PORT}`);
    console.log("==========================================");
});