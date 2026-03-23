import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path" // 1. 引入 path 模块

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: { // 2. 添加 resolve 配置
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host:true,
    port:5174,
    proxy: {
      // 受保护路由：保持 /api 前缀
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
