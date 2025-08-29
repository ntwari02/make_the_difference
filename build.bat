@echo off
echo 🚀 Starting build process for Scholarship Management System...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed or not in PATH
    pause
    exit /b 1
)

echo ℹ️ Node.js version: 
node --version
echo ℹ️ npm version: 
npm --version
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
    echo.
)

REM Clean previous build
echo 🧹 Cleaning previous build...
if exist "public\css\styles.css" (
    del "public\css\styles.css"
    echo ✅ Previous CSS build cleaned
)
echo.

REM Build CSS
echo 🎨 Building CSS with Tailwind...
npx tailwindcss -i "./src/css/styles.css" -o "./public/css/styles.css" --minify
if %errorlevel% neq 0 (
    echo ❌ CSS build failed
    pause
    exit /b 1
)
echo ✅ CSS build completed
echo.

REM Validate server.js syntax
echo 🔍 Validating server.js syntax...
node -c server.js
if %errorlevel% neq 0 (
    echo ❌ Server.js syntax validation failed
    pause
    exit /b 1
)
echo ✅ Server.js syntax validation passed
echo.

REM Generate build report
echo 📊 Generating build report...
set "timestamp=%date% %time%"
echo { > build-report.json
echo   "timestamp": "%timestamp%", >> build-report.json
echo   "buildStatus": "success", >> build-report.json
echo   "outputFiles": [ >> build-report.json
echo     "./public/css/styles.css" >> build-report.json
echo   ] >> build-report.json
echo } >> build-report.json
echo ✅ Build report generated: build-report.json
echo.

echo 🎉 Build completed successfully!
echo.
echo 📁 Output files:
echo   - public/css/styles.css
echo   - build-report.json
echo.
echo 🚀 You can now run the project with: npm start
echo.
pause
