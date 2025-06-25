import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true, // 支持 less 中的 js 表达式
        modifyVars: {
          // 在这里自定义主题色等变量
          // '@primary-color': '#1DA57A',
        },
      },
    },
  },
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