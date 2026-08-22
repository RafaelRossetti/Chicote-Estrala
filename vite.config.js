import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Permite que o projeto rode em subpastas como o GitHub Pages (rafaelrossetti.github.io/Chicote-Estrala/)
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500
  },
  publicDir: 'public'
});
