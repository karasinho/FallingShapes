import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert'
import { fileURLToPath, URL } from 'node:url'

import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue(), mkcert()],
  publicDir: 'public/',

  resolve: {
    alias: {
      '#root': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    rollupOptions: {
      input: {
        main: resolve('./index.html'),
      },
      output: {
        minify: {
          compress: {
            dropConsole: true,
            dropDebugger: true,
          },
        },
      },
    },

    chunkSizeWarningLimit: 5000,
    outDir: 'dist/',
    sourcemap: true,
  },

  server: {
    host: true,
    port: 1408,
    strictPort: true,
  },
})
