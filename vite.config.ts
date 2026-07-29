import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 部署时，通过 BASE_PATH 环境变量自动适配子路径
// 用户站点 (username.github.io) → base = '/'
// 项目站点 (username.github.io/仓库名) → base = '/仓库名/'
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
  server: {
    port: 5173,
    strictPort: true
  }
})
