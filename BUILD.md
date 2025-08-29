# Build Guide for Scholarship Management System

This document explains how to build the Scholarship Management System project and get it ready for deployment.

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MySQL** (v8.0 or higher) - [Download here](https://dev.mysql.com/downloads/)

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3. Start the Application
```bash
npm start
```

## 🛠️ Build Commands

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Full build process (CSS + validation) |
| `npm run build:css` | Build CSS only (minified) |
| `npm run build:css:watch` | Build CSS with watch mode |
| `npm run clean` | Clean build artifacts |
| `npm run dev` | Development mode with auto-reload |
| `npm start` | Production start |

### Build Process Steps

1. **Environment Validation** - Checks Node.js version and required directories
2. **Dependency Installation** - Installs npm packages if needed
3. **Build Cleanup** - Removes previous build artifacts
4. **CSS Compilation** - Compiles Tailwind CSS with minification
5. **Code Validation** - Validates server.js syntax
6. **Build Report** - Generates build status report

## 📁 Build Output

After a successful build, you'll find:

- `public/css/styles.css` - Compiled and minified CSS
- `build-report.json` - Build status and metadata
- `node_modules/` - Project dependencies

## 🔧 Platform-Specific Build

### Windows
```cmd
build.bat
```

### Unix/Linux/macOS
```bash
chmod +x build.sh
./build.sh
```

### Cross-Platform (Node.js)
```bash
node scripts/build.js
```

## 🎨 CSS Build Configuration

The project uses **Tailwind CSS** for styling:

- **Input**: `src/css/styles.css` (Tailwind directives)
- **Output**: `public/css/styles.css` (compiled CSS)
- **Configuration**: `tailwind.config.js`

### Tailwind Configuration
```javascript
module.exports = {
  content: [
    "./src/**/*.{html,js}",
    "./public/**/*.{html,js}",
    "./**/*.{html,js}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Node.js Not Found
```bash
# Install Node.js from https://nodejs.org/
# Or use a version manager like nvm
```

#### 2. Dependencies Installation Failed
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
npm install
```

#### 3. Tailwind Build Failed
```bash
# Check if Tailwind is installed
npm list tailwindcss

# Reinstall Tailwind
npm install tailwindcss@latest
```

#### 4. Permission Denied (Unix/Linux)
```bash
# Make build script executable
chmod +x build.sh
```

### Build Validation

The build process includes several validation steps:

- ✅ Node.js version check
- ✅ Directory structure validation
- ✅ CSS compilation verification
- ✅ Server.js syntax validation
- ✅ Build artifact generation

## 🔄 Development Workflow

### Development Mode
```bash
npm run build:css:watch
npm run dev
```
- Auto-reloads on file changes
- CSS watch mode enabled
- Development-friendly error messages

### Production Build
```bash
npm run build
npm start
```
- Minified CSS output
- Syntax validation
- Build report generation

## 📊 Build Reports

Each build generates a `build-report.json` file containing:

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "buildStatus": "success",
  "outputFiles": ["./public/css/styles.css"],
  "buildInfo": {
    "nodeVersion": "v18.17.0",
    "npmVersion": "9.6.7"
  }
}
```

## 🚀 Deployment

After building, the project is ready for deployment:

1. **Build the project**: `npm run build`
2. **Start the server**: `npm start`
3. **Access the application**: `http://localhost:3000`

### Environment Variables
Create a `.env` file with your configuration:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mbappe
PORT=3000
NODE_ENV=production
```

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

## 🤝 Support

If you encounter build issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check the build logs for specific error messages
4. Ensure you have proper permissions for the project directory

---

**Happy Building! 🎉**
