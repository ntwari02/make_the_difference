@echo off
echo ========================================
echo    Daily Development Workflow
echo ========================================
echo.

echo 🚀 Starting your development day...
echo.

REM Check if we're in the right directory
if not exist "server" (
    echo ❌ Please run this from the project root directory
    echo 💡 Make sure you're in: C:\Users\Sam\Desktop\make_the_difference
    pause
    exit /b 1
)

echo 📥 Step 1: Pulling latest changes...
call pull-changes.bat

echo.
echo ========================================
echo ✅ Daily workflow complete!
echo ========================================
echo.
echo 💡 Next steps:
echo    - Your server should be running
echo    - Open http://localhost:3001 in your browser
echo    - Start coding! The server will auto-restart on changes
echo.
pause
