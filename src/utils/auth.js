// src/utils/auth.js

// 你的 Cloudflare Worker 地址
const API_URL = 'https://api.xie-app.asia';
const AUTH_KEY = 'license_status';
const DEVICE_ID_KEY = 'browser_device_fingerprint';

let isSessionVerified = false;

/**
 * 获取浏览器唯一标识
 * 由于浏览器无法获取物理机器码，我们生成一个随机 UUID 并存储在 localStorage
 * 只要用户不清除浏览器缓存，这个 ID 就是固定的
 */
function getBrowserDeviceId() {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
        // 使用 crypto.randomUUID (现代浏览器) 或 手动生成随机串
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            id = crypto.randomUUID();
        } else {
            id = 'legacy-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
        }
        localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
}

export async function verifyLicense(key) {
    try {
        // 使用浏览器指纹替代机器码
        const machineId = getBrowserDeviceId();

        console.log('正在验证:', key, '设备ID:', machineId);

        // 发送请求给 Cloudflare
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                licenseKey: key.trim(),
                machineId: machineId
            })
        });

        // 解析响应
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

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
        lastCheck: new Date().getTime()
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
    isSessionVerified = true;
}

export async function getAuth() {
    // 1. 内存检查（路由跳转时无感）
    if (isSessionVerified) {
        return { isActive: true };
    }

    // 2. 本地缓存 Key 读取
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

    // 3. 静默联网验证
    const result = await verifyLicense(key);

    if (result.success) {
        isSessionVerified = true;
        return { isActive: true };
    } else {
        console.warn('静默验证失败:', result.msg);
        return null;
    }
}
