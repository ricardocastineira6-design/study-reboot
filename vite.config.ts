import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // Para Firebase Hosting (raíz)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Optimizaciones de rendimiento
    rollupOptions: {
      output: {
        // Separar chunks para mejor caching
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'icons': ['lucide-react']
        }
      }
    },
    // Optimizar bundle size
    minify: 'esbuild', // Usar esbuild en lugar de terser
  },
  // Optimizaciones de desarrollo
  server: {
    hmr: {
      overlay: false // Reducir overlays innecesarios
    }
  }
})
