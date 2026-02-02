import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
const app = createApp(App)
// 注册图标

app.use(ElementPlus)

// 🟢 2. 挂载路由 (这一步非常关键！)
app.use(router)
app.mount('#app')
