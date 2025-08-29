#!/usr/bin/env node

/**
 * Build Script for Scholarship Management System
 * Handles CSS compilation, validation, and build checks
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import buildConfig from '../build.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class BuildManager {
  constructor() {
    this.config = buildConfig;
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async run() {
    this.log('🚀 Starting build process...', 'info');
    
    try {
      // Step 1: Validate environment
      await this.validateEnvironment();
      
      // Step 2: Clean previous build
      await this.cleanBuild();
      
      // Step 3: Build CSS
      await this.buildCSS();
      
      // Step 4: Validate build
      await this.validateBuild();
      
      // Step 5: Generate build report
      await this.generateBuildReport();
      
      this.log('🎉 Build completed successfully!', 'info');
      process.exit(0);
      
    } catch (error) {
      this.log(`Build failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async validateEnvironment() {
    this.log('Validating environment...', 'info');
    
    // Check Node.js version
    const nodeVersion = process.version;
    this.log(`Node.js version: ${nodeVersion}`, 'info');
    
    // Check if required directories exist
    const requiredDirs = [this.config.sourceDir, this.config.outputDir];
    for (const dir of requiredDirs) {
      if (!existsSync(dir)) {
        throw new Error(`Required directory not found: ${dir}`);
      }
    }
    
    this.log('Environment validation passed', 'info');
  }

  async cleanBuild() {
    this.log('Cleaning previous build...', 'info');
    
    try {
      if (existsSync(this.config.cssOutput)) {
        execSync(`rm -f "${this.config.cssOutput}"`, { stdio: 'inherit' });
        this.log('Previous CSS build cleaned', 'info');
      }
    } catch (error) {
      this.log(`Warning: Could not clean previous build: ${error.message}`, 'warning');
    }
  }

  async buildCSS() {
    this.log('Building CSS with Tailwind...', 'info');
    
    try {
      const cssDir = dirname(this.config.cssOutput);
      if (!existsSync(cssDir)) {
        mkdirSync(cssDir, { recursive: true });
      }
      
      const command = `npx tailwindcss -i "${this.config.cssInput}" -o "${this.config.cssOutput}" ${this.config.minify ? '--minify' : ''}`;
      execSync(command, { stdio: 'inherit' });
      
      this.log('CSS build completed', 'info');
    } catch (error) {
      throw new Error(`CSS build failed: ${error.message}`);
    }
  }

  async validateBuild() {
    this.log('Validating build output...', 'info');
    
    // Check if CSS file was generated
    if (!existsSync(this.config.cssOutput)) {
      throw new Error('CSS output file not found');
    }
    
    // Check server.js syntax
    try {
      execSync('node -c server.js', { stdio: 'pipe' });
      this.log('Server.js syntax validation passed', 'info');
    } catch (error) {
      throw new Error('Server.js syntax validation failed');
    }
    
    this.log('Build validation passed', 'info');
  }

  async generateBuildReport() {
    this.log('Generating build report...', 'info');
    
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.config.NODE_ENV,
      buildStatus: 'success',
      errors: this.errors,
      warnings: this.warnings,
      outputFiles: [
        this.config.cssOutput
      ],
      buildConfig: {
        sourceDir: this.config.sourceDir,
        outputDir: this.config.outputDir,
        minify: this.config.minify
      }
    };
    
    const reportPath = './build-report.json';
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`Build report generated: ${reportPath}`, 'info`);
  }
}

// Run the build
const buildManager = new BuildManager();
buildManager.run().catch(error => {
  console.error('Build failed:', error);
  process.exit(1);
});
