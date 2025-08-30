#!/usr/bin/env node

/**
 * Generate secure secrets for environment variables
 * Run with: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('🔐 Generating Secure Secrets for Environment Variables\n');

// Generate session secret
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('SESSION_SECRET:');
console.log(sessionSecret);
console.log();

// Generate JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log();

// Generate API key (32 characters)
const apiKey = crypto.randomBytes(16).toString('hex');
console.log('API_KEY:');
console.log(apiKey);
console.log();

// Generate database password (16 characters with mixed case and symbols)
const generatePassword = (length = 16) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(crypto.randomInt(charset.length));
    }
    return password;
};

const dbPassword = generatePassword(16);
console.log('DB_PASSWORD (example):');
console.log(dbPassword);
console.log();

console.log('📝 Copy these values to your .env file');
console.log('⚠️  Keep these secrets secure and never commit them to Git!');
console.log('💡 You can regenerate new secrets anytime by running this script again');
