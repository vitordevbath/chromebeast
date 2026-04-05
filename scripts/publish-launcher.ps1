param(
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$launcherProject = Join-Path $repoRoot "src\launcher\StarcoreLauncher.csproj"
$publishDir = Join-Path $repoRoot "dist\launcher-exe"
$runtimeDir = Join-Path $repoRoot "runtime\node"
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodeCommand) {
    throw "Node.js nao encontrado. Instale o Node.js antes de publicar o launcher unico."
}

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
Copy-Item $nodeCommand.Source (Join-Path $runtimeDir "node.exe") -Force

Write-Host "[Starcore] Runtime local do Node preparado em runtime\node"
Write-Host "[Starcore] Publicando launcher unico..."
dotnet publish $launcherProject -c $Configuration -o $publishDir

Copy-Item (Join-Path $publishDir "StarcoreLauncher.exe") (Join-Path $repoRoot "dist\StarcoreLauncher.exe") -Force
if (Test-Path (Join-Path $publishDir "StarcoreLauncher.pdb")) {
    Copy-Item (Join-Path $publishDir "StarcoreLauncher.pdb") (Join-Path $repoRoot "dist\StarcoreLauncher.pdb") -Force
}

Write-Host "[Starcore] Launcher unico pronto em dist\StarcoreLauncher.exe"
