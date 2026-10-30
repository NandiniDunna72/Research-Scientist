@echo off
title AI Research Scientist - Unified Launcher
echo ===================================================
echo     AI Research Scientist - Autonomous Startup
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Ensuring PostgreSQL Database is online...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$port = Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue; if (!$port) { Write-Host 'Starting PostgreSQL server...'; if (Test-Path 'E:\PostgreSQL\18\bin\pg_ctl.exe') { & 'E:\PostgreSQL\18\bin\pg_ctl.exe' start -D 'E:\PostgreSQL\18\data' } }"

echo [2/3] Launching FastAPI Research Backend (port 8000)...
start "AI Research Backend" /min cmd /c "backend\venv\Scripts\uvicorn.exe app.main:app --app-dir backend --port 8000"

echo [3/3] Launching Vite Frontend Development Server (port 5173)...
start "AI Research Frontend" cmd /c "npm run dev"

echo Waiting for services to initialize...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Sleep -Seconds 3"

echo Opening AI Research Scientist in your default browser...
start http://localhost:5173/

echo.
echo ===================================================
echo   All services are up and running!
echo   - Web Application: http://localhost:5173/
echo   - API Documentation: http://127.0.0.1:8000/docs
echo ===================================================
