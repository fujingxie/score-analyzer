import { createRouter, createWebHashHistory } from 'vue-router'
import { getAuth } from '../utils/auth'
import Home from '../views/Home.vue'
import Auth from '../views/Auth.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/auth',
        name: 'Auth',
        component: Auth
    },
    // ... 其他路由
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
    // 调用 getAuth()。
    // 如果是第一次打开，这里会 await 联网请求（稍有延迟，保证安全）。
    // 如果是后续跳转，这里会瞬间返回（读取内存变量）。
    const license = await getAuth();

    if (to.path === '/auth') {
        // 如果已有授权，通过 auth 页直接跳回首页
        if (license) {
            next('/');
        } else {
            next();
        }
    } else {
        // 访问其他受保护页面
        if (license) {
            next();
        } else {
            next('/auth'); // 验证失败，强制去登录
        }
    }
});

export default router
