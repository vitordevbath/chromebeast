param(
    [string]$ProjectPath = "C:\StarcoreSentinel"
)

$ErrorActionPreference = "Stop"

Write-Host "[Starcore] Checklist de instalacao para Windows VPS"
Write-Host "1. Instale Node.js LTS"
Write-Host "2. Instale Git for Windows"
Write-Host "3. Copie o projeto para $ProjectPath"
Write-Host "4. Execute os comandos abaixo em PowerShell:"
Write-Host ""
Write-Host "cd $ProjectPath\src\backend"
Write-Host "npm install"
Write-Host "node server.js"
Write-Host ""
Write-Host "5. Abra no navegador: http://IP_DA_VPS:3000"
Write-Host ""
Write-Host "Opcional:"
Write-Host "- configurar .env para SMTP real"
Write-Host "- usar NSSM para rodar como servico"
Write-Host "- usar Nginx ou IIS como proxy reverso"
