import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'

const isElectron = process.env.WEB_ONLY !== 'true'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(isElectron
      ? [
          electron({
            main: {
              entry: 'electron/main.ts',
            },
            preload: {
              input: 'electron/preload.ts',
            },
          }),
        ]
      : []),
  ],
  server: {
    allowedHosts: true,
  },
})
