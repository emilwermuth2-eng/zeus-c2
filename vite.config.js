import { defineConfig } from 'vite';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [cesium()],
  server: {
    port: 4173,
    proxy: {
      '/api': 'http://localhost:3001',
      '/ws/havoc': {
        target: 'ws://localhost:3001',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          cesium: ['cesium'],
          xterm: ['xterm', '@xterm/addon-fit', '@xterm/addon-web-links'],
        },
      },
    },
  },
});
