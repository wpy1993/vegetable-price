import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    },
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true // 如果端口被占用，则会抛出错误而不是尝试下一个可用端口
  },
  build: {
    outDir: 'dist/renderer',
    emptyOutDir: true
  }
})