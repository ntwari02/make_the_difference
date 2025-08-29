#!/bin/bash

echo "🚀 Starting build process for Scholarship Management System..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed or not in PATH"
    exit 1
fi

echo "ℹ️ Node.js version: $(node --version)"
echo "ℹ️ npm version: $(npm --version)"
echo

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
    echo
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
if [ -f "public/css/styles.css" ]; then
    rm -f "public/css/styles.css"
    echo "✅ Previous CSS build cleaned"
fi
echo

# Build CSS
echo "🎨 Building CSS with Tailwind..."
npx tailwindcss -i "./src/css/styles.css" -o "./public/css/styles.css" --minify
if [ $? -ne 0 ]; then
    echo "❌ CSS build failed"
    exit 1
fi
echo "✅ CSS build completed"
echo

# Validate server.js syntax
echo "🔍 Validating server.js syntax..."
node -c server.js
if [ $? -ne 0 ]; then
    echo "❌ Server.js syntax validation failed"
    exit 1
fi
echo "✅ Server.js syntax validation passed"
echo

# Generate build report
echo "📊 Generating build report..."
cat > build-report.json << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "buildStatus": "success",
  "outputFiles": [
    "./public/css/styles.css"
  ],
  "buildInfo": {
    "nodeVersion": "$(node --version)",
    "npmVersion": "$(npm --version)",
    "platform": "$(uname -s)",
    "architecture": "$(uname -m)"
  }
}
EOF
echo "✅ Build report generated: build-report.json"
echo

echo "🎉 Build completed successfully!"
echo
echo "📁 Output files:"
echo "  - public/css/styles.css"
echo "  - build-report.json"
echo
echo "🚀 You can now run the project with: npm start"
echo
