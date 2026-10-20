import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [vue(), VitePWA({
    registerType: 'prompt',
    injectRegister: null,
    manifest: {
      name: 'THE OUTSIDE',
      short_name: 'THE OUTSIDE',
      description: 'An interactive story and archive experience.',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      theme_color: '#10130f',
      background_color: '#090c0b',
      icons: [
        { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: {
      cleanupOutdatedCaches: true,
      navigateFallback: 'index.html',
      globPatterns: ['**/*.{js,css,html,svg,png,webp,jpg,jpeg,woff,woff2}'],
      globIgnores: ['icons/pwa-*.png'],
      runtimeCaching: [
        { urlPattern: /^https:\/\/[^/]+\.supabase\.co\//i, handler: 'NetworkOnly' },
        { urlPattern: /^https:\/\/(?:accounts|api|open)\.spotify\.com\//i, handler: 'NetworkOnly' },
        { urlPattern: /^https:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|music\.yandex\.[^/]+)\//i, handler: 'NetworkOnly' },
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\//i,
          handler: 'StaleWhileRevalidate',
          options: { cacheName: 'the-outside-font-styles' }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\//i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'the-outside-font-files',
            expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 365 }
          }
        },
        { urlPattern: ({ request, url }) => request.destination === 'image' && url.origin !== self.location.origin, handler: 'NetworkOnly' }
      ]
    }
  })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
    coverage: { reporter: ['text', 'html'] }
  }
});
