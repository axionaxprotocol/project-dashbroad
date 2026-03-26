@echo off
color 0B
title Electrical Project Dashboard Launcher

echo ===================================================
echo     Starting Electrical Project Dashboard...
echo ===================================================

:: Navigate to the script's directory (to ensure npm runs in the project folder)
cd /d "%~dp0"

:: Check if node_modules exists, otherwise run install
IF NOT EXIST "node_modules\" (
    echo [INFO] First time setup detected. Installing dependencies...
    call npm install
)

echo [INFO] Starting local Web Server...
:: Start the React server in a new invisible or visible process 
:: In this case we'll just run it in the background of this same console window? No, start a new window
echo Keep the new black window open while using the dashboard!
start "Dashboard Server" cmd /c "title Dashboard Server && echo Starting server... && npm run dev -- --host"

echo [INFO] Waiting for server to initialize...
timeout /t 4 /nobreak > nul

echo [INFO] Opening Browser...
start http://localhost:5173
