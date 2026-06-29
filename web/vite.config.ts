import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Base path matches the GitHub Pages project site:
// https://shrinivaskamath.github.io/yakshanaada-v3/
// Change to '/' if you deploy to a custom domain or a User/Org Pages repo.
export default defineConfig({
  base: '/yakshanaada-v3/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon.png'],
      // Audio files are large and many; cache them at runtime on first play
      // rather than precaching everything up front.
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,json}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => /\/audio\//.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'yaksha-audio',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 60,
              },
              cacheableResponse: { statuses: [0, 200] },
              rangeRequests: true,
            },
          },
        ],
      },
      manifest: {
        name: 'Yakshanaada',
        short_name: 'Yakshanaada',
        description:
          'Shruthi, Tanpura, Bhagavatha and pitch detector for Yakshagana.',
        theme_color: '#961A1D',
        background_color: '#212121',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '.',
        scope: '.',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});
