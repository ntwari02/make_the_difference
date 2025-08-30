#!/usr/bin/env node

/**
 * Setup environment variables
 * Run with: node scripts/setup-env.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const envTemplatePath = path.join(projectRoot, 'config', 'env.template');
const envPath = path.join(projectRoot, '.env');

console.log('🚀 Setting up environment variables...\n');

// Check if .env already exists
if (fs.existsSync(envPath)) {
    console.log('⚠️  .env file already exists!');
    console.log('   If you want to overwrite it, delete it first and run this script again.\n');
    process.exit(0);
}

// Check if template exists
if (!fs.existsSync(envTemplatePath)) {
    console.log('❌ Template file not found at config/env.template');
    console.log('   Please create the template file first.\n');
    process.exit(1);
}

try {
    // Read template
    const template = fs.readFileSync(envTemplatePath, 'utf8');
    
    // Create .env file
    fs.writeFileSync(envPath, template);
    
    console.log('✅ .env file created successfully!');
    console.log('📝 Edit .env file with your actual values');
    console.log('🔐 Run "npm run generate:secrets" to generate secure secrets');
    console.log('📖 See ENVIRONMENT_SETUP.md for detailed instructions\n');
    
    console.log('⚠️  IMPORTANT:');
    console.log('   - Never commit .env to Git');
    console.log('   - Keep your secrets secure');
    console.log('   - Use different values for development and production\n');
    
} catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    process.exit(1);
}
