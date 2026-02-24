import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      manifest: {
        name: 'Gustify',
        short_name: 'Gustify',
        description: 'Tu compañero de cocina',
        theme_color: '#4a7c59',
        background_color: '#f5f0e8',
        display: 'standalone',
        // Icons will be added when brand assets are ready (gustify_prd §9)
        icons: [],
      },
    }),
  ],
  server: {
    port: 5175,
  },
  preview: {
    port: 4176,
  },
})
