import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  // Ensure generated asset URLs are absolute from site root in production
  base: '/',
  plugins: [react(),tailwindcss()],
  server: {
    hmr: {
      port: 5173,
      host: 'localhost'
    },
    host: 'localhost',
    port: 5173,
    strictPort: false
  }
})
