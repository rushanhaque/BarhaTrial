import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BARHA client. Dev server proxies /api to the Express maison-server on :5180.
export default defineConfig({
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
