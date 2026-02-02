// generate-license.js
import CryptoJS from "crypto-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// --- ESM 环境下手动定义 __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= 配置区 =================
// 🔴 警告：这个密钥必须和前端代码里的密钥完全一致！
const SECRET_KEY = "YOUR_SUPER_SECRET_KEY_2024";

// 默认配置
const DEFAULT_DAYS = 7; // 默认有效期 7 天
const USER_NAME = "默认授权用户";
const OUTPUT_FILE = "auth.lic"; // 生成的文件名
// =========================================

// 1. 计算时间
const now = new Date();
const expireTime = new Date(now.getTime() + DEFAULT_DAYS * 24 * 60 * 60 * 1000);

console.log("正在生成授权文件...");
console.log("-------------------------");
console.log(`生成时间: ${now.toLocaleString()}`);
console.log(`过期时间: ${expireTime.toLocaleString()} (7天后)`);

// 2. 组装数据
const licenseData = {
    appName: "ClassAnalysisSystem",
    user: USER_NAME,
    createDate: now.getTime(), // 存时间戳，方便计算
    expireDate: expireTime.getTime(),
    salt: Math.random().toString(36).substring(2, 15) // 随机盐值
};

// 3. AES 加密
const ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(licenseData),
    SECRET_KEY
).toString();

// 4. 写入文件
const filePath = path.join(__dirname, OUTPUT_FILE);
fs.writeFileSync(filePath, ciphertext);

console.log("-------------------------");
console.log(`✅ 授权文件已生成: ${filePath}`);
console.log("您可以将此文件发送给用户。");
