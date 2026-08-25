import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

// Inject the git commit SHA as the build ID so the client can detect
// when a new deploy has landed and auto-reload.
let BUILD_ID
try {
  BUILD_ID = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
} catch {
  BUILD_ID = String(Date.now())
}

// BARHA client. Dev server proxies /api to the Express maison-server on :5180.
export default defineConfig({
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5180',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          motion: ['framer-motion'],
          gsap: ['gsap'],
          lenis: ['lenis'],
        },
      },
    },
  },
})
