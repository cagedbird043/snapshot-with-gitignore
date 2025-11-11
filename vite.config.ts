import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      // Base path for GitHub Pages deployment
      // If deploying to https://<USERNAME>.github.io/<REPO>/
      // set base to '/<REPO>/', otherwise use '/'
      base: process.env.GITHUB_PAGES ? '/snapshot-with-gitignore/' : '/',
      
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      
      plugins: [react()],
      
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      
      build: {
        outDir: 'dist',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
            }
          }
        }
      }
    };
});
