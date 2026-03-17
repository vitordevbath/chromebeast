# CHROMEBEAST_INSTALLER.ps1
$ErrorActionPreference = "Stop"

# 1. PEDIR ADMIN (IMPORTANTE!)
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "[-] ERRO: EXECUTE COMO ADMINISTRADOR." -ForegroundColor Red
    Pause
    exit
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   CHROMEBEAST - PROTOCOLO DE CONEXÃO" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan

# 2. SOLICITAR IP DO SEU COMPUTADOR (O SERVIDOR)
$serverIP = Read-Host "[-] DIGITE O IP DO SERVIDOR CHROMEBEAST (EX: 192.168.0.x)"
$url = "http://$($serverIP):8080/download-chromebeast"
$destination = "C:\ChromeBeast_Presentation"

# 3. PREPARAR PASTA E BAIXAR
Write-Host "[+] CONECTANDO AO SERVIDOR: $url" -ForegroundColor Yellow
if (Test-Path $destination) { Remove-Item $destination -Recurse -Force }
New-Item -ItemType Directory -Path $destination | Out-Null

$zipPath = "$destination\project.zip"
try {
    Invoke-WebRequest -Uri $url -OutFile $zipPath
    Write-Host "[+] DOWNLOAD CONCLUÍDO COM SUCESSO." -ForegroundColor Green
} catch {
    Write-Host "[-] ERRO NA CONEXÃO. VERIFIQUE SE O SERVIDOR ESTÁ RODANDO." -ForegroundColor Red
    Pause
    exit
}

# 4. EXTRAIR E INSTALAR (SILENCIOSO)
Write-Host "[+] EXTRAINDO NÚCLEO..." -ForegroundColor Cyan
Expand-Archive -Path $zipPath -DestinationPath $destination -Force
Remove-Item $zipPath

# 5. INSTALAR DEPENDÊNCIAS SE NECESSÁRIO
cd "$destination\backend"
Write-Host "[+] SINCRONIZANDO DEPENDÊNCIAS..." -ForegroundColor Cyan
npm install --silent

# 6. LANÇAR O SISTEMA
Write-Host "[!] LANÇANDO INTERFACE GÓTICA..." -ForegroundColor Magenta
cd $destination
start "RETROBEAST_CORE.hta"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   SISTEMA OPERANTE - BOA APRESENTAÇÃO!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
timeout /t 5
