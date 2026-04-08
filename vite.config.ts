import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert'

import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), mkcert()],
  publicDir: 'public/',

  build: {
    rollupOptions: {
      input: {
        main: resolve('./index.html'),
      },
    },

    chunkSizeWarningLimit: 5000,
    outDir: 'dist/',
    sourcemap: true,
    esbuild: {
      pure: ['console.log', 'console.debug'],
    },
  },

  server: {
    host: true,
    port: 1408,
    strictPort: true,
  },
})
