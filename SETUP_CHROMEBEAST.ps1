# SETUP_CHROMEBEAST.ps1 - Instalador Automatizado
# Este script prepara o ambiente para o professor executar o projeto ChromeBeast

$ErrorActionPreference = "Stop"

# 1. Verificar Privilégios de Administrador
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "[-] ERRO: ESTE INSTALADOR REQUER PRIVILÉGIOS DE ADMINISTRADOR." -ForegroundColor Red
    Write-Host "[!] POR FAVOR, EXECUTE O EXE COMO ADMINISTRADOR." -ForegroundColor Yellow
    Pause
    exit
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   CHROMEBEAST SYSTEM - INSTALADOR OFICIAL" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "[+] INICIALIZANDO PROTOCOLO DE AMBIENTE..."

# 2. Verificar se o Node.js está instalado
try {
    $nodeCheck = node -v
    Write-Host "[+] NODE.JS DETECTADO: $nodeCheck" -ForegroundColor Green
} catch {
    Write-Host "[-] NODE.JS NÃO ENCONTRADO. BAIXANDO INSTALADOR..." -ForegroundColor Yellow
    $url = "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi"
    $output = "$env:TEMP\nodejs.msi"
    Invoke-WebRequest -Uri $url -OutFile $output
    Write-Host "[+] INSTALANDO NODE.JS (AGUARDE A CONCLUSÃO)..." -ForegroundColor Cyan
    Start-Process msiexec.exe -ArgumentList "/i $output /quiet /norestart" -Wait
    Write-Host "[!] NODE.JS INSTALADO. REINICIE O LANÇADOR APÓS A CONCLUSÃO." -ForegroundColor Yellow
    Pause
    exit
}

# 3. Entrar na pasta do projeto e instalar dependências
$projectPath = Get-Location
$backendPath = Join-Path $projectPath "backend"

if (Test-Path $backendPath) {
    cd $backendPath
    Write-Host "[+] SINCRONIZANDO BIBLIOTECAS (NPM INSTALL)..." -ForegroundColor Cyan
    npm install --silent
    Write-Host "[+] DEPENDÊNCIAS OK." -ForegroundColor Green
} else {
    Write-Host "[-] ERRO CRÍTICO: PASTA BACKEND NÃO ENCONTRADA NO DIRETÓRIO ATUAL." -ForegroundColor Red
    Pause
    exit
}

# 4. Lançar o Sistema
Write-Host "[+] INICIANDO NÚCLEO CHROMEBEAST..." -ForegroundColor Magenta
cd $projectPath
start "RETROBEAST_CORE.hta"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   SISTEMA OPERANTE - BOA APRESENTAÇÃO!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
timeout /t 5
