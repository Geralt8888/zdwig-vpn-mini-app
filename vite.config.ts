import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Относительные пути позволяют деплоить сборку в подпапку GitHub Pages.
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'es2022',
    sourcemap: false,
  },
});
