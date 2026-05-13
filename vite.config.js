import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    port: 5200,
    allowedHosts: 'all',
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    }
  },
  optimizeDeps: {
    include: ['react-is', 'recharts'],
    exclude: ['@capacitor/app', '@capacitor-mlkit/barcode-scanning']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
})
