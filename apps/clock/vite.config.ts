import { defineConfig } from 'vite';

export default defineConfig({
  // Development server configuration
  server: {
    port: 5173,
    open: true,
    host: 'localhost',
    fs: {
      strict: false,
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
    rollupOptions: {
      output: {
        // Preserve module structure
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash][extname]',
      },
    },
    copyPublicDir: true,
  },

  // Preview configuration
  preview: {
    port: 4173,
    open: true,
  },

  // Optimization
  optimizeDeps: {
    include: [],
  },

  // Base path for deployment
  base: './',
});
