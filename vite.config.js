import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    target: 'es2022',               // the corpus module uses top-level await
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    // offline cache: every built file (the 7 MB verse library included) is precached, so reading works without a connection
    VitePWA({
      registerType: 'autoUpdate',
      manifest: false,              // public/manifest.webmanifest is used as it is
      workbox: {
        globPatterns: ['**/*.{html,js,css,json,woff2,png,webmanifest}'],
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
    }),
  ],
});
