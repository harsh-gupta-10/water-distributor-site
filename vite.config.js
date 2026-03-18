import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('html2canvas')) {
            return 'vendor-html2canvas'
          }

          if (id.includes('jspdf') || id.includes('jspdf-autotable')) {
            return 'vendor-jspdf'
          }

          if (id.includes('xlsx')) {
            return 'vendor-xlsx'
          }

          if (id.includes('@supabase')) {
            return 'vendor-supabase'
          }

          return undefined
        },
      },
    },
  },
})
