// generate_keys.js
// 运行命令: node generate_keys.js

import fs from 'fs';
import crypto from 'crypto';

// ================= 配置区 =================
const GENERATE_COUNT = 100;          // 💎 生成数量
const PREFIX = "TEMP-VIP";               // 前缀
const FILE_FOR_CF = "cf_import.json";   // 给 Cloudflare 用的
const FILE_FOR_SALE = "keys_for_sale.txt"; // 给发卡网用的
// =========================================

// 生成随机字符串
function generateRandomString(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length)
        .toUpperCase();
}

const cfData = [];
const txtData = [];

console.log(`🏭 正在启动印钞机，准备生产 ${GENERATE_COUNT} 个激活码...`);

for (let i = 0; i < GENERATE_COUNT; i++) {
    // 生成格式：VIP-XXXX-XXXX-XXXX
    const part1 = generateRandomString(4);
    const part2 = generateRandomString(4);
    const part3 = generateRandomString(4);

    const licenseKey = `${PREFIX}-${part1}-${part2}-${part3}`;

    // 1. 准备给 Cloudflare 的数据 (Key-Value)
    cfData.push({
        key: licenseKey,
        value: JSON.stringify({ status: "unused", machineId: null, createTime: Date.now() })
    });

    // 2. 准备给发卡网的数据 (纯文本)
    txtData.push(licenseKey);
}

// 写入文件
fs.writeFileSync(FILE_FOR_CF, JSON.stringify(cfData, null, 2));
fs.writeFileSync(FILE_FOR_SALE, txtData.join('\n'));

console.log(`\n✅ 成功生成！`);
console.log(`📂 [1] 数据库导入文件: ${FILE_FOR_CF}`);
console.log(`📂 [2] 发货清单文件:   ${FILE_FOR_SALE}`);
