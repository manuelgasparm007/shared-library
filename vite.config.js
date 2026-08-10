import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative pathing for GitHub Pages subpath deployments
  root: './',
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
