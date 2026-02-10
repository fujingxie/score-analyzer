import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  // 部署配置：
  // 如果你的网站部署在根目录（如 www.example.com），建议使用 '/'
  // 如果部署在子目录或考虑到通用性，保持 './' 也可以
  base: './'
})
