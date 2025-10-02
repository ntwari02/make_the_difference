@echo off
echo ========================================
echo    Reaglex Server Startup Script
echo ========================================

REM Check if port 3001 is in use
echo Checking if port 3001 is available...
netstat -ano | findstr :3001 >nul
if %errorlevel% == 0 (
    echo ❌ Port 3001 is already in use!
    echo.
    echo Finding process using port 3001...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        echo Process ID: %%a
        echo Killing process %%a...
        taskkill /PID %%a /F >nul 2>&1
        if %errorlevel% == 0 (
            echo ✅ Process killed successfully
        ) else (
            echo ⚠️  Could not kill process %%a
        )
    )
    echo.
) else (
    echo ✅ Port 3001 is available
)

echo.
echo Starting server...
echo ========================================
echo.

REM Start the server
npm start

pause
