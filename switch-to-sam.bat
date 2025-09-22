@echo off
echo ========================================
echo    Switch to Sam's Branch
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

REM Switch to sam's branch
echo 🔄 Switching to sam's branch...
git checkout "sam's"

REM Restore stashed changes
echo 🔄 Restoring stashed changes...
git stash pop

echo ✅ Switched to sam's branch
echo 💡 Server stopped. Start with: cd server && npm start
pause
