#!/bin/bash

# 确保在脚本所在目录运行
cd "$(dirname "$0")"

# 检查 node 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

# 运行生成器
node generate-license.js

# (可选) 生成后自动在 Finder 中打开该文件所在文件夹
open -R auth.lic
