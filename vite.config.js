import { defineConfig } from 'vite';

// Renderer build for the Efe & Mogi Showdown Electron app.
// base:'./' makes built asset URLs relative so dist/index.html loads under file:// in Electron.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
