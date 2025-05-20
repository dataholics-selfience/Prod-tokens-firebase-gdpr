import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  },
  // Esta função roda depois do build para copiar o _redirects para dist/
  async closeBundle() {
    const redirectsSrc = resolve(__dirname, '_redirects');
    const redirectsDest = resolve(__dirname, 'dist', '_redirects');
    if (fs.existsSync(redirectsSrc)) {
      fs.copyFileSync(redirectsSrc, redirectsDest);
      console.log('✅ _redirects copiado para dist/');
    } else {
      console.warn('⚠️ Arquivo _redirects não encontrado na raiz.');
    }
  }
});
