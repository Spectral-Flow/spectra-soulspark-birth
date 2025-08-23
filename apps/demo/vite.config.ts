import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@/core': path.resolve(__dirname, '../../packages/core/src'),
      '@/voice': path.resolve(__dirname, '../../packages/voice/src'),
    },
  },
  root: path.resolve(__dirname),
  build: {
    outDir: path.resolve(__dirname, '../../dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
})