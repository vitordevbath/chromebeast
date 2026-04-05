param(
    [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $repoRoot "src\backend"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js nao encontrado. Instale o Node.js antes de iniciar o backend."
}

if (-not (Test-Path (Join-Path $backendPath "node_modules"))) {
    Write-Host "[Starcore] node_modules nao encontrado. Instalando dependencias..."
    Push-Location $backendPath
    npm install
    Pop-Location
}

Write-Host "[Starcore] Iniciando backend em http://localhost:$Port"
Push-Location $backendPath
node server.js
Pop-Location
