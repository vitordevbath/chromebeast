@echo off
setlocal

set "PROJECT_ROOT=C:\Users\vitor\Desktop\projeto-web"

if not exist "%PROJECT_ROOT%\backend\server.js" (
    echo [CHROMEBEAST] PROJECT_ROOT_INVALID
    exit /b 1
)

start "CHROMEBEAST Backend" cmd /k "cd /d "%PROJECT_ROOT%\backend" && node server.js"
timeout /t 3 /nobreak > nul
start "" "%PROJECT_ROOT%\frontend\index.html"

endlocal
