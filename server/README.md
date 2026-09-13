# 蟹卡提货小程序后端服务器

## 功能说明

这是一个为蟹卡提货小程序提供的后端服务器，实现了以下功能：
- 卡片验证和管理
- 订单创建和管理
- 数据持久化存储
- CSV导出功能

## 安装步骤

1. 确保已安装 Node.js（建议版本 14+）

2. 进入服务器目录：
```bash
cd server
```

3. 安装依赖：
```bash
npm install
```

## 启动服务器

### 开发模式（自动重启）
```bash
npm run dev
```

### 生产模式
```bash
npm start
```

服务器将在 `http://localhost:3000` 启动

## API接口

### 1. 获取所有卡片
```
GET /api/cards
```

### 2. 验证卡片
```
POST /api/cards/validate
Content-Type: application/json

{
  "cardNo": "CRAB20240001",
  "password": "123456"
}
```

### 3. 创建订单
```
POST /api/orders
Content-Type: application/json

{
  "cardNo": "CRAB20240001",
  "name": "张三",
  "phone": "13800138000",
  "address": "北京市朝阳区",
  "remark": "备注信息"
}
```

### 4. 获取订单列表
```
GET /api/orders?status=all
```
参数：
- `status`: 订单状态（all/pending/completed）

### 5. 更新订单状态
```
PUT /api/orders/:orderId/status
Content-Type: application/json

{
  "status": "completed"
}
```

### 6. 导入卡片
```
POST /api/cards/import
Content-Type: application/json

{
  "newCards": [
    {
      "cardNo": "CRAB20240011",
      "password": "password123"
    }
  ]
}
```

### 7. 导出订单为CSV
```
GET /api/orders/export
```

## 数据存储

数据存储在 `server/data` 目录下：
- `cards.json`: 卡片数据
- `orders.json`: 订单数据

## 默认数据

服务器首次启动时会自动初始化10张默认卡片：
- 卡号：CRAB20240001 ~ CRAB20240010
- 密码：123456, abcdef, 888888, 666666, 111111, 222222, 333333, 444444, 555555, 777777

## 管理员账号

用户名：`admin`
密码：`admin123`

## 注意事项

1. 确保服务器在运行时，小程序才能正常使用
2. 修改服务器端口需要同时修改小程序中的 `utils/api.js` 中的 `BASE_URL`
3. 数据文件会自动创建，无需手动创建
4. 建议定期备份 `server/data` 目录下的数据文件