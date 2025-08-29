#!/usr/bin/env node

/**
 * CSS Build Script for Tailwind CSS v4
 * Since Tailwind v4 doesn't have a CLI, we'll create a basic CSS file
 */

import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class CSSBuilder {
  constructor() {
    this.inputFile = './src/css/styles.css';
    this.outputFile = './public/css/styles.css';
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async build() {
    try {
      this.log('🎨 Starting CSS build process...', 'info');
      
      // Check if input file exists
      if (!existsSync(this.inputFile)) {
        throw new Error(`Input CSS file not found: ${this.inputFile}`);
      }
      
      // Create output directory if it doesn't exist
      const outputDir = dirname(this.outputFile);
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
        this.log(`Created output directory: ${outputDir}`, 'info');
      }
      
      // Read input file
      const inputContent = readFileSync(this.inputFile, 'utf8');
      
      // Create output CSS with Tailwind directives and some basic styles
      const outputContent = this.generateOutputCSS(inputContent);
      
      // Write output file
      writeFileSync(this.outputFile, outputContent, 'utf8');
      
      this.log(`CSS build completed: ${this.outputFile}`, 'info');
      this.log(`Output file size: ${(outputContent.length / 1024).toFixed(2)} KB`, 'info');
      
    } catch (error) {
      this.log(`CSS build failed: ${error.message}`, 'error');
      throw error;
    }
  }

  generateOutputCSS(inputContent) {
    // Start with the input content (Tailwind directives)
    let output = inputContent + '\n\n';
    
    // Add some basic utility classes that are commonly used
    output += '/* Basic utility classes */\n';
    output += '.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }\n';
    output += '.text-center { text-align: center; }\n';
    output += '.text-left { text-align: left; }\n';
    output += '.text-right { text-align: right; }\n';
    output += '.font-bold { font-weight: bold; }\n';
    output += '.font-normal { font-weight: normal; }\n';
    output += '.text-sm { font-size: 0.875rem; }\n';
    output += '.text-base { font-size: 1rem; }\n';
    output += '.text-lg { font-size: 1.125rem; }\n';
    output += '.text-xl { font-size: 1.25rem; }\n';
    output += '.text-2xl { font-size: 1.5rem; }\n';
    output += '.p-4 { padding: 1rem; }\n';
    output += '.m-4 { margin: 1rem; }\n';
    output += '.bg-white { background-color: white; }\n';
    output += '.bg-gray-100 { background-color: #f3f4f6; }\n';
    output += '.text-gray-900 { color: #111827; }\n';
    output += '.text-gray-600 { color: #4b5563; }\n';
    output += '.border { border: 1px solid #d1d5db; }\n';
    output += '.rounded { border-radius: 0.25rem; }\n';
    output += '.shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }\n';
    
    // Add responsive utilities
    output += '\n/* Responsive utilities */\n';
    output += '@media (min-width: 640px) {\n';
    output += '  .sm\\:hidden { display: none; }\n';
    output += '  .sm\\:block { display: block; }\n';
    output += '}\n';
    output += '@media (min-width: 768px) {\n';
    output += '  .md\\:hidden { display: none; }\n';
    output += '  .md\\:block { display: block; }\n';
    output += '}\n';
    output += '@media (min-width: 1024px) {\n';
    output += '  .lg\\:hidden { display: none; }\n';
    output += '  .lg\\:block { display: block; }\n';
    output += '}\n';
    
    // Add flexbox utilities
    output += '\n/* Flexbox utilities */\n';
    output += '.flex { display: flex; }\n';
    output += '.flex-col { flex-direction: column; }\n';
    output += '.flex-row { flex-direction: row; }\n';
    output += '.items-center { align-items: center; }\n';
    output += '.justify-center { justify-content: center; }\n';
    output += '.justify-between { justify-content: space-between; }\n';
    output += '.gap-4 { gap: 1rem; }\n';
    
    // Add grid utilities
    output += '\n/* Grid utilities */\n';
    output += '.grid { display: grid; }\n';
    output += '.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }\n';
    output += '.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }\n';
    output += '.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }\n';
    output += '.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }\n';
    
    // Add hover states
    output += '\n/* Hover states */\n';
    output += '.hover\\:bg-gray-100:hover { background-color: #f3f4f6; }\n';
    output += '.hover\\:shadow-lg:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }\n';
    
    // Add focus states
    output += '\n/* Focus states */\n';
    output += '.focus\\:outline-none:focus { outline: none; }\n';
    output += '.focus\\:ring-2:focus { box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); }\n';
    
    // Add transition utilities
    output += '\n/* Transition utilities */\n';
    output += '.transition { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; }\n';
    output += '.duration-200 { transition-duration: 200ms; }\n';
    output += '.ease-in-out { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }\n';
    
    return output;
  }
}

// Run the CSS build
const cssBuilder = new CSSBuilder();
cssBuilder.build().catch(error => {
  console.error('CSS build failed:', error);
  process.exit(1);
});
