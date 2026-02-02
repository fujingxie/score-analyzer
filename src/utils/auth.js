// src/utils/auth.js

// 你的 Cloudflare Worker 地址
const API_URL = 'https://api.xie-app.asia';
const AUTH_KEY = 'license_status';

let isSessionVerified = false;
export async function verifyLicense(key) {
    try {
        let machineId = 'UNKNOWN-DEVICE';

        if (window.require) {
            const { machineIdSync } = window.require('node-machine-id');
            machineId = machineIdSync();
        } else {
            console.warn('当前非 Electron 环境，无法获取机器码，使用调试ID');
            machineId = 'BROWSER-DEBUG-ID';
        }

        console.log('正在验证:', key, '机器码:', machineId);

        // 发送请求给 Cloudflare
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                licenseKey: key.trim(),
                machineId: machineId
            })
        });

        const data = await response.json();

        if (data.success) {
            return { success: true, msg: data.msg };
        } else {
            return { success: false, msg: data.msg };
        }
    } catch (error) {
        console.error('验证出错:', error);
        return { success: false, msg: '验证过程出错: ' + error.message };
    }
}

export function saveAuth(key) {
    const authData = {
        licenseKey: key,
        // 依然保存时间戳，备用
        lastCheck: new Date().getTime()
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));

    // 🔴 关键点：手动激活成功后，直接标记当前内存会话为“已验证”
    isSessionVerified = true;
}

export async function getAuth() {
    // 1. 第一道防线：内存检查
    // 如果当前应用运行期间已经验证过一次（isSessionVerified 为 true），直接放行。
    // 这保证了路由跳转（点击菜单）时是“完全无感”的，不需要每次点击都联网。
    if (isSessionVerified) {
        return { isActive: true };
    }

    // 2. 第二道防线：本地缓存 Key 读取
    const str = localStorage.getItem(AUTH_KEY);
    if (!str) return null;

    let key = '';
    try {
        const data = JSON.parse(str);
        key = data.licenseKey;
    } catch (e) {
        return null;
    }

    if (!key) return null;

    // 3. 第三道防线：静默联网验证
    // 代码运行到这里，说明是“第一次打开”或“刷新了页面”。
    // 我们拿着缓存的 Key 去联网验证，用户无需输入，只有等待的一瞬间。
    const result = await verifyLicense(key);

    if (result.success) {
        // 验证通过！标记内存状态，下次路由跳转就不再请求了
        isSessionVerified = true;
        return { isActive: true };
    } else {
        // 验证失败（Key被封禁或机器码变更），返回 null，路由将跳转至 Auth 页
        console.warn('静默验证失败:', result.msg);
        return null;
    }
}
