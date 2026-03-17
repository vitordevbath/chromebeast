# CHROMEBEAST_INSTALLER_GITHUB.ps1
$ErrorActionPreference = "Stop"

# 1. PEDIR ADMIN
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "[-] ERRO: EXECUTE COMO ADMINISTRADOR." -ForegroundColor Red
    Pause
    exit
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   CHROMEBEAST - CLOUD INSTALLER V2.0" -ForegroundColor White
Write-Host "==========================================" -ForegroundColor Cyan

# 2. DEFINIR URL DO GITHUB (COLOQUE O LINK DO SEU REPOSITÓRIO AQUI)
$repoUrl = "https://github.com/SEU_USUARIO/NOME_DO_REPO/archive/refs/heads/main.zip"
$destination = "C:\ChromeBeast_Presentation"

# 3. BAIXAR DIRETO DA NUVEM
Write-Host "[+] CONECTANDO AO REPOSITÓRIO GITHUB..." -ForegroundColor Yellow
if (Test-Path $destination) { Remove-Item $destination -Recurse -Force }
New-Item -ItemType Directory -Path $destination | Out-Null

$zipPath = "$destination\project.zip"
try {
    Invoke-WebRequest -Uri $repoUrl -OutFile $zipPath
    Write-Host "[+] DOWNLOAD DA NUVEM CONCLUÍDO." -ForegroundColor Green
} catch {
    Write-Host "[-] ERRO: REPOSITÓRIO NÃO ENCONTRADO OU SEM INTERNET." -ForegroundColor Red
    Pause
    exit
}

# 4. EXTRAIR E CONFIGURAR
Write-Host "[+] EXTRAINDO NÚCLEO..." -ForegroundColor Cyan
Expand-Archive -Path $zipPath -DestinationPath "$destination\_temp" -Force
# Move os arquivos da pasta interna do zip para a pasta raiz do destino
$innerFolder = Get-ChildItem -Path "$destination\_temp" -Directory | Select-Object -First 1
Move-Item -Path "$($innerFolder.FullName)\*" -Destination $destination -Force
Remove-Item "$destination\_temp" -Recurse -Force
Remove-Item $zipPath

# 5. INSTALAR DEPENDÊNCIAS
cd "$destination\backend"
Write-Host "[+] SINCRONIZANDO DEPENDÊNCIAS VIA NPM..." -ForegroundColor Cyan
npm install --silent

# 6. LANÇAR O SISTEMA
Write-Host "[!] LANÇANDO INTERFACE GÓTICA..." -ForegroundColor Magenta
cd $destination
start "RETROBEAST_CORE.hta"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   SISTEMA OPERANTE - BOA APRESENTAÇÃO!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
timeout /t 5
