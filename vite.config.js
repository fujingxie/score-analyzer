import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
// 🟢 1. 引入 electron 插件
import electron from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    vue(),
    // 🟢 2. 配置 electron 插件
    electron({
      entry: 'electron/main.cjs',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  // 🟢 3. 关键配置：改为相对路径
  // Electron 读取本地文件，不能用绝对路径 '/'，必须用 './'
  base: './'
})
