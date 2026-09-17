import { defineConfig } from 'vite';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [cesium()],
  server: {
    port: 5173,
    host: 'localhost',
    open: false,
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
});
