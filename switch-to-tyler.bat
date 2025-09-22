@echo off
echo ========================================
echo    Switch to Tyler Branch
echo ========================================

REM Stop server
echo 🛑 Stopping server...
netstat -ano | findstr :3001 >nul
if %errorlevel% == 0 (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

REM Stash changes
echo 💾 Stashing changes...
git stash push -m "Auto-stash before Tyler switch - %date% %time%"

REM Switch to Tyler and pull
echo 🔄 Switching to Tyler branch...
git checkout Tyler
git pull origin Tyler

echo ✅ Switched to Tyler branch and pulled latest changes
echo 💡 Server stopped. Start with: cd server && npm start
pause
