/**
 * Build Configuration for Scholarship Management System
 * This file contains build-time configuration and environment settings
 */

export const buildConfig = {
  // Build environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Build paths
  sourceDir: './src',
  outputDir: './public',
  cssInput: './src/css/styles.css',
  cssOutput: './public/css/styles.css',
  
  // Build options
  minify: process.env.NODE_ENV === 'production',
  watch: process.env.NODE_ENV === 'development',
  
  // Database configuration (for build-time checks)
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mbappe',
    port: process.env.DB_PORT || 3306
  },
  
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  
  // Build validation
  validateBuild: true,
  checkDatabaseConnection: false, // Set to true if you want to validate DB connection during build
  
  // Output settings
  verbose: true,
  showProgress: true
};

export default buildConfig;
