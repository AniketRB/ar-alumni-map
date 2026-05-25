import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': '/src' },
  },
  optimizeDeps: {
    exclude: ['mind-ar'],
  },
  build: {
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        codeSplitting: true,
        manualChunks(id) {
          if (id.includes('node_modules/three'))                return 'three'
          if (id.includes('node_modules/framer-motion'))        return 'framer-motion'
          if (id.includes('node_modules/@supabase'))            return 'supabase'
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) return 'vendor'
        },
      },
    },
  },
})
