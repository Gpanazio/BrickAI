import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'serve-local-uploads',
      configureServer(server) {
        // Serve images from local uploads/ folder in dev (before proxy)
        server.middlewares.use('/uploads', (req, res, next) => {
          const filePath = path.join(__dirname, 'uploads', decodeURIComponent(req.url || ''))
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase()
            const mimeTypes: Record<string, string> = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml' }
            if (mimeTypes[ext]) res.setHeader('Content-Type', mimeTypes[ext])
            res.setHeader('Cache-Control', 'no-cache')
            return res.end(fs.readFileSync(filePath))
          }
          next()
        })
      }
    }
  ],
  server: {
    port: Number(process.env.PORT) || 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three'],
          'framer-vendor': ['framer-motion'],
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
        }
      }
    }
  }
})
