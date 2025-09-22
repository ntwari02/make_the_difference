@echo off
echo ========================================
echo    Kill Reaglex Server
echo ========================================

echo Finding processes using port 3001...
netstat -ano | findstr :3001
if %errorlevel% == 0 (
    echo.
    echo Killing processes using port 3001...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        echo Killing process ID: %%a
        taskkill /PID %%a /F >nul 2>&1
        if %errorlevel% == 0 (
            echo ✅ Process %%a killed successfully
        ) else (
            echo ⚠️  Could not kill process %%a
        )
    )
    echo.
    echo Verifying port 3001 is free...
    netstat -ano | findstr :3001
    if %errorlevel% == 0 (
        echo ❌ Some processes are still using port 3001
    ) else (
        echo ✅ Port 3001 is now free
    )
) else (
    echo ✅ No processes found using port 3001
)

echo.
pause
