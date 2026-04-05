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

Write-Host "[Chromebeast] Runtime local do Node preparado em runtime\node"
Write-Host "[Chromebeast] Publicando launcher unico..."
dotnet publish $launcherProject -c $Configuration -o $publishDir

Copy-Item (Join-Path $publishDir "ChromebeastLauncher.exe") (Join-Path $repoRoot "dist\ChromebeastLauncher.exe") -Force
if (Test-Path (Join-Path $publishDir "ChromebeastLauncher.pdb")) {
    Copy-Item (Join-Path $publishDir "ChromebeastLauncher.pdb") (Join-Path $repoRoot "dist\ChromebeastLauncher.pdb") -Force
}

Write-Host "[Chromebeast] Launcher unico pronto em dist\ChromebeastLauncher.exe"
