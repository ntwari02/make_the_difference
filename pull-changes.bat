@echo off
echo ========================================
echo    Safe Git Pull with Server Management
echo ========================================

REM Step 1: Check current status
echo 📊 Checking current status...
git status --porcelain
if %errorlevel% neq 0 (
    echo ❌ Not in a git repository!
    pause
    exit /b 1
)

REM Step 2: Stop any running server
echo.
echo 🛑 Step 1: Stopping any running server...
netstat -ano | findstr :3001 >nul
if %errorlevel% == 0 (
    echo ⚠️  Server found running on port 3001. Stopping...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do (
        echo Stopping process %%a...
        taskkill /PID %%a /F >nul 2>&1
    )
    timeout /t 3 /nobreak >nul
    echo ✅ Server stopped
) else (
    echo ✅ No server running
)

REM Step 3: Stash any uncommitted changes
echo.
echo 💾 Step 2: Saving any uncommitted changes...
git stash push -m "Auto-stash before pull - %date% %time%"
if %errorlevel% == 0 (
    echo ✅ Changes stashed
) else (
    echo ℹ️  No changes to stash
)

REM Step 4: Pull changes
echo.
echo 📥 Step 3: Pulling latest changes...
git pull origin main
if %errorlevel% neq 0 (
    echo ❌ Git pull failed!
    echo.
    echo 🔄 Restoring stashed changes...
    git stash pop
    pause
    exit /b 1
)
echo ✅ Changes pulled successfully

REM Step 5: Restore stashed changes
echo.
echo 🔄 Step 4: Restoring your changes...
git stash pop
if %errorlevel% == 0 (
    echo ✅ Changes restored
) else (
    echo ℹ️  No stashed changes to restore
)

REM Step 6: Check if server files changed
echo.
echo 🔍 Step 5: Checking if server needs restart...
cd server
if exist "package.json" (
    echo 📁 Server directory found
    echo.
    echo 🚀 Server is ready to start!
    echo.
    echo Choose an option:
    echo [1] Start server (npm start)
    echo [2] Start in development mode (npm run dev)
    echo [3] Just exit (start manually later)
    echo.
    set /p choice="Enter your choice (1-3): "
    
    if "!choice!"=="1" (
        echo Starting server...
        npm start
    ) else if "!choice!"=="2" (
        echo Starting in development mode...
        npm run dev
    ) else (
        echo ✅ Ready! You can start the server manually when needed.
        echo 💡 Use: npm start or npm run dev
    )
) else (
    echo ℹ️  No server directory found
)

echo.
echo ========================================
echo ✅ Pull completed successfully!
echo ========================================
pause
