@echo off
setlocal

cd /d "%~dp0src\backend"

if not exist node_modules (
    echo [CHROMEBEAST] Instalando dependencias do backend...
    call npm install
)

start "Chromebeast Backend" cmd /k node server.js
timeout /t 3 /nobreak >nul
start "" http://localhost:3000
