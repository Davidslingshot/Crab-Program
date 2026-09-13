#!/bin/bash

echo "开始部署蟹卡管理后台..."

cd $(dirname "$0")

echo "1. 安装依赖..."
npm install

echo "2. 构建项目..."
npm run build

echo "3. 上传到服务器..."
scp -r dist/* root@your-domain.com:/var/www/crab-card-admin/

echo "部署完成！"
echo "访问地址: https://your-domain.com"