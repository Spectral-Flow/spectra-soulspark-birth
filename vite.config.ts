import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
    'process.env': {}
  },
  build: {
    outDir: "dist",
    sourcemap: mode === 'development',
    chunkSizeWarningLimit: 600, // Increase warning limit for large chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-tooltip'],
          voice: ['openai', '@elevenlabs/react'],
        },
      },
      // Exclude test files from production build
      external: mode === 'production' ? [
        /src\/voice\/test\.ts$/,
        /src\/voice\/streaming-test\.ts$/,
        /src\/voice\/streaming-examples\.ts$/
      ] : undefined,
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
}));
