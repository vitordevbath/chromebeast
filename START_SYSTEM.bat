@echo off
title [CHROMEBEAST] - INITIALIZING_GOTHIC_CORE
color 0b
echo ==========================================
echo    INITIALIZING CHROMEBEAST HUB V1.0
echo ==========================================
echo [1/2] STARTING_LOCAL_SERVER...
start /b cmd /c "cd backend && node server.js"
echo [2/2] WAITING_FOR_CORE_SIGNAL...
timeout /t 3 /nobreak > nul
echo [OK] SYSTEM_OPERATIONAL. OPENING_HUB...
start "" "frontend\index.html"
echo ==========================================
echo    CORE ACTIVE. DON'T CLOSE THIS WINDOW.
echo ==========================================
pause