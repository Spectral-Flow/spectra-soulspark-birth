import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { configDefaults } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    open: false,
    strictPort: true,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'process.env': {},
    // Add performance marker for monitoring
    '__BUILD_TIME__': JSON.stringify(new Date().toISOString()),
  },
  build: {
    outDir: "dist",
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'esbuild' : false,
    target: 'es2022', // Updated to ES2022 for better modern browser support
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-popover', 
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select'
          ],
          voice: ['openai', '@elevenlabs/react'],
          routing: ['react-router-dom'],
          query: ['@tanstack/react-query'],
        },
        // Optimize chunk loading
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      // Exclude test files from production build
      external: mode === 'production' ? [
        /src\/voice\/test\.ts$/,
        /src\/voice\/streaming-test\.ts$/,
        /src\/voice\/streaming-examples\.ts$/,
        /src\/examples\//,
      ] : undefined,
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'lucide-react',
    ],
    exclude: ['@elevenlabs/react'], // Let this load dynamically
  },
  // Enable modern CSS features
  css: {
    devSourcemap: mode === 'development',
  },
  // Performance optimizations
  esbuild: {
    target: 'es2022', // Updated to ES2022
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [...configDefaults.exclude, 'android/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
    },
    typecheck: {
      tsconfig: './tsconfig.app.json',
    },
  },
}));
