param(
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$launcherProject = Join-Path $repoRoot "src\launcher\StarcoreLauncher.csproj"
$publishDir = Join-Path $repoRoot "dist\launcher-exe"
$bundleDir = Join-Path $repoRoot "dist\app"
$bundleBackend = Join-Path $bundleDir "backend"
$bundleFrontend = Join-Path $bundleDir "frontend"

Write-Host "[Chromebeast] Publicando launcher..."
dotnet publish $launcherProject -c $Configuration -o $publishDir

Write-Host "[Chromebeast] Montando pacote distribuivel..."
New-Item -ItemType Directory -Force -Path $bundleBackend | Out-Null
New-Item -ItemType Directory -Force -Path $bundleFrontend | Out-Null

Copy-Item (Join-Path $publishDir "ChromebeastLauncher.exe") (Join-Path $repoRoot "dist\ChromebeastLauncher.exe") -Force
if (Test-Path (Join-Path $publishDir "ChromebeastLauncher.pdb")) {
    Copy-Item (Join-Path $publishDir "ChromebeastLauncher.pdb") (Join-Path $repoRoot "dist\ChromebeastLauncher.pdb") -Force
}

Copy-Item (Join-Path $publishDir "ChromebeastLauncher.exe") (Join-Path $bundleDir "ChromebeastLauncher.exe") -Force

Copy-Item (Join-Path $repoRoot "src\backend\server.js") (Join-Path $bundleBackend "server.js") -Force
Copy-Item (Join-Path $repoRoot "src\backend\package.json") (Join-Path $bundleBackend "package.json") -Force
Copy-Item (Join-Path $repoRoot "src\backend\package-lock.json") (Join-Path $bundleBackend "package-lock.json") -Force

Copy-Item (Join-Path $repoRoot "src\frontend\index.html") (Join-Path $bundleFrontend "index.html") -Force
Copy-Item (Join-Path $repoRoot "src\frontend\admin.html") (Join-Path $bundleFrontend "admin.html") -Force
Copy-Item (Join-Path $repoRoot "src\frontend\api.js") (Join-Path $bundleFrontend "api.js") -Force
Copy-Item (Join-Path $repoRoot "src\frontend\script.js") (Join-Path $bundleFrontend "script.js") -Force
Copy-Item (Join-Path $repoRoot "src\frontend\style.css") (Join-Path $bundleFrontend "style.css") -Force

$assetsSource = Join-Path $repoRoot "src\frontend\assets"
$assetsTarget = Join-Path $bundleFrontend "assets"
if (Test-Path $assetsTarget) {
    Remove-Item -Recurse -Force $assetsTarget
}
Copy-Item $assetsSource $assetsTarget -Recurse -Force

Write-Host "[Chromebeast] Pacote pronto em dist\app"
