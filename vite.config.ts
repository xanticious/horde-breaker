import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@data': resolve(__dirname, 'src/data'),
      '@rendering': resolve(__dirname, 'src/rendering'),
      '@audio': resolve(__dirname, 'src/audio'),
      '@input': resolve(__dirname, 'src/input'),
      '@services': resolve(__dirname, 'src/services'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@debug': resolve(__dirname, 'src/debug'),
      '@utils': resolve(__dirname, 'src/utils'),
    },
  },

  server: {
    port: 5173,
  },

  build: {
    target: 'es2020',
    sourcemap: true,
  },
})
