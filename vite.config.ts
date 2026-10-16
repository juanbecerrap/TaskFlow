import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
        // El archivo "firebase" (librería de terceros, 567 kB) es el único que supera
    // los 500 kB; se cachea aparte. Si algún archivo propio crece, el aviso salta.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // Separa las librerías grandes en archivos propios (se cachean aparte).
        codeSplitting: {
          groups: [
            {
              name: 'react',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
              priority: 20,
            },
            {
              name: 'firebase',
              test: /node_modules[\\/](firebase|@firebase)[\\/]/,
              priority: 15,
            },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Las páginas se cargan bajo demanda: se deja más margen en máquinas lentas.
    testTimeout: 15000,
  },
})