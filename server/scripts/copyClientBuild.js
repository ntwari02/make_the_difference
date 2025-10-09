const fs = require('fs');
const path = require('path');

const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
const serverPublic = path.join(__dirname, '..', 'public');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.log(`⚠️  Client build not found at ${src}. Skipping copy.`);
    return;
  }
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(clientDist, serverPublic);
console.log(`✅ Copied client build to ${serverPublic}`);


