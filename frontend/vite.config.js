import { defineConfig } from 'vite'
import process from 'node:process'
import react from '@vitejs/plugin-react'

const outDir = process.env.BUILD_OUT_DIR || '../layout'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  build: {
    outDir,
    emptyOutDir: false,
  },
  base: '/',
  ...(command === 'serve' && {
    server: {
      proxy: {
        '/api': {
          target: 'https://fosterfledging.me',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }),
}))
