import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep React and ReactDOM together and in the main bundle
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return undefined; // Don't split React - keep it in main bundle
          }
          // Split other vendors
          if (id.includes('node_modules')) {
            if (id.includes('@ionic')) {
              return 'vendor-ionic';
            }
            if (id.includes('@langchain')) {
              return 'vendor-langchain';
            }
            if (id.includes('react-router') || id.includes('history')) {
              return 'vendor-router';
            }
            return 'vendor';
          }
        },
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      defaultIsModuleExports: true,
    },
  },
  optimizeDeps: {
    include: ['history'],
  },
  server: {
    port: 5173,
    strictPort: false,
  },
});
