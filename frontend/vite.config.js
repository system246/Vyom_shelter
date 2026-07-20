import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // In dev, /api/* is forwarded to Express — no CORS issues
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Also proxy /uploads so file previews work in dev
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
