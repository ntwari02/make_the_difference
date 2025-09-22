@echo off
echo ========================================
echo    Safe Tyler Branch Merge Workflow
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

REM Step 3: Check current branch
echo.
echo 🌿 Step 2: Checking current branch...
git branch --show-current
set current_branch=%errorlevel%

REM Step 4: Stash any uncommitted changes
echo.
echo 💾 Step 3: Saving any uncommitted changes...
git stash push -m "Auto-stash before Tyler merge - %date% %time%"
if %errorlevel% == 0 (
    echo ✅ Changes stashed
) else (
    echo ℹ️  No changes to stash
)

REM Step 5: Switch to Tyler branch and pull
echo.
echo 🔄 Step 4: Switching to Tyler branch and pulling latest changes...
git checkout Tyler
if %errorlevel% neq 0 (
    echo ❌ Failed to switch to Tyler branch!
    echo 🔄 Restoring stashed changes...
    git stash pop
    pause
    exit /b 1
)

git pull origin Tyler
if %errorlevel% neq 0 (
    echo ❌ Failed to pull Tyler changes!
    echo 🔄 Restoring stashed changes...
    git stash pop
    pause
    exit /b 1
)
echo ✅ Tyler branch updated successfully

REM Step 6: Switch back to your branch
echo.
echo 🔄 Step 5: Switching back to your branch...
git checkout "sam's"
if %errorlevel% neq 0 (
    echo ❌ Failed to switch back to sam's branch!
    echo 🔄 Restoring stashed changes...
    git stash pop
    pause
    exit /b 1
)
echo ✅ Switched back to sam's branch

REM Step 7: Merge Tyler changes
echo.
echo 🔀 Step 6: Merging Tyler changes into your branch...
git merge Tyler
if %errorlevel% neq 0 (
    echo ❌ Merge failed! You may have conflicts to resolve.
    echo.
    echo 🔄 Restoring your stashed changes...
    git stash pop
    echo.
    echo 💡 To resolve conflicts:
    echo    1. Check git status
    echo    2. Edit conflicted files
    echo    3. git add .
    echo    4. git commit
    echo    5. Run this script again
    pause
    exit /b 1
)
echo ✅ Tyler changes merged successfully

REM Step 8: Restore stashed changes
echo.
echo 🔄 Step 7: Restoring your changes...
git stash pop
if %errorlevel% == 0 (
    echo ✅ Changes restored
) else (
    echo ℹ️  No stashed changes to restore
)

REM Step 9: Check if server needs restart
echo.
echo 🔍 Step 8: Checking if server needs restart...
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
echo ✅ Tyler merge completed successfully!
echo ========================================
echo.
echo 📋 Summary:
echo    ✅ Switched to Tyler branch
echo    ✅ Pulled latest Tyler changes
echo    ✅ Switched back to sam's branch
echo    ✅ Merged Tyler changes
echo    ✅ Restored your changes
echo    ✅ Server ready to start
echo.
pause
