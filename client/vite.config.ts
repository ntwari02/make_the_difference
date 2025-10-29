import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  // Ensure generated asset URLs are absolute from site root in production
  base: '/',
  plugins: [react(),tailwindcss()],
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate large dependencies
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'yup'],
          'chart-vendor': ['@nivo/core', '@nivo/bar', '@nivo/line', '@nivo/pie', 'recharts'],
          'payment-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js', '@paypal/react-paypal-js'],
        },
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production (optional, can disable for smaller builds)
    sourcemap: false,
    // Minify
    minify: 'esbuild',
    // Target modern browsers for smaller bundles
    target: 'es2015',
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  server: {
    hmr: {
      port: 5173,
      host: 'localhost'
    },
    host: 'localhost',
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      },
      // Proxy uploaded images to backend static server in dev
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
