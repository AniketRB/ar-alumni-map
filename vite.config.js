import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      buffer: 'buffer/',
      util: 'util/',
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['mind-ar'],
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three'))          return 'three'
          if (id.includes('node_modules/framer-motion'))  return 'framer-motion'
          if (id.includes('node_modules/@supabase'))      return 'supabase'
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) return 'vendor'
        },
      },
    },
  },
  server: {
    headers: {
      'Permissions-Policy': 'camera=*, microphone=()',
    },
  },
})