# 蟹卡提货小程序

一个基于微信小程序的蟹卡提货系统,包含用户端小程序、独立的管理后台 Web 应用和 Node.js 后端服务器,使用 SQLite 持久化存储数据。

## 项目架构

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  微信小程序      │     │  管理后台 (Web)   │     │  后端服务器      │
│  (用户端)        │     │  admin-web       │     │  server         │
│                 │     │                  │     │                 │
│  - 蟹卡登录     │────▶│  - 管理员登录     │────▶│  - Express      │
│  - 提货申请     │     │  - 订单管理       │     │  - JWT 认证     │
│  - 订单查看     │     │  - 卡片管理       │     │  - SQLite       │
│                 │     │  - 卡片导入       │     │  - RESTful API  │
└─────────────────┘     │  - 修改密码       │     └─────────────────┘
                        │  - 订单导出CSV    │              │
                        └──────────────────┘              ▼
                                              ┌─────────────────┐
                                              │  SQLite 数据库   │
                                              │  crab_card.db   │
                                              └─────────────────┘
```

## 项目结构

```
miniprogram-7/
├── admin-web/              # 管理后台 Web 应用 (Vue 3 + Vite)
│   ├── src/
│   │   ├── views/          # 页面组件
│   │   │   ├── Login.vue          # 管理员登录
│   │   │   ├── Layout.vue         # 主布局
│   │   │   ├── Orders.vue         # 订单管理
│   │   │   ├── Cards.vue          # 卡片管理
│   │   │   ├── Import.vue         # 卡片导入
│   │   │   └── ChangePassword.vue # 修改密码
│   │   ├── router/index.js # 路由(带登录守卫)
│   │   ├── utils/api.js    # API 封装(axios + JWT 拦截器)
│   │   ├── App.vue
│   │   └── main.js
│   ├── dist/               # 构建产物(用于部署)
│   ├── nginx.conf          # Nginx 部署配置(SSL + 反向代理)
│   ├── deploy.sh           # 部署脚本
│   ├── vite.config.js
│   └── package.json
├── server/                 # 后端服务器 (Node.js + Express)
│   ├── server.js           # 服务器主文件
│   ├── data/
│   │   ├── crab_card.db    # SQLite 数据库(自动创建)
│   │   └── *.json.bak      # 旧 JSON 数据备份(迁移后保留)
│   ├── start.bat           # Windows 启动脚本(自动安装依赖)
│   ├── package.json
│   └── README.md           # 服务器 API 文档
├── pages/                  # 微信小程序页面
│   ├── login/              # 蟹卡登录
│   ├── pickup/             # 提货申请
│   └── order/              # 订单查看
├── components/
│   └── navigation-bar/     # 自定义导航栏组件
├── utils/
│   ├── api.js              # 小程序 API 接口封装
│   └── storage.js         # 本地存储工具(已废弃,改用后端)
├── app.js                  # 小程序入口
├── app.json                # 小程序配置
├── app.wxss                # 全局样式
├── project.config.json    # 项目配置
└── sitemap.json
```

## 技术栈

| 模块 | 技术 |
|------|------|
| 用户端 | 微信小程序原生开发 |
| 管理后台 | Vue 3 + Vite + Element Plus + Vue Router |
| 后端 | Node.js + Express |
| 数据库 | SQLite (better-sqlite3) |
| 认证 | JWT (jsonwebtoken) |
| HTTP 客户端 | axios (管理后台) / wx.request (小程序) |

## 快速开始

### 1. 启动后端服务器

**Windows 系统(推荐):**
```bash
cd server
start.bat
```
脚本会自动安装依赖并启动服务器。

**Mac/Linux 系统:**
```bash
cd server
npm install
npm start        # 生产模式
# 或
npm run dev      # 开发模式(自动重启)
```

服务器将在 `http://localhost:3000` 启动,首次启动会自动创建 SQLite 数据库并初始化默认卡片。

### 2. 配置并运行微信小程序

1. 使用微信开发者工具打开项目根目录
2. 在 [utils/api.js](utils/api.js) 中确认服务器地址(默认 `http://localhost:3000/api`)
3. 编译运行小程序

### 3. 运行管理后台

**开发模式:**
```bash
cd admin-web
npm install
npm run dev
```
管理后台将在 `http://localhost:5173` 启动,自动代理 `/api` 请求到后端服务器。

**生产构建:**
```bash
cd admin-web
npm run build
# 构建产物在 admin-web/dist/
```

## 功能说明

### 用户端(微信小程序)
- **蟹卡登录**:输入卡号和密码验证蟹卡
- **提货申请**:填写收货信息提交提货申请
- **订单查看**:查看已提交的订单状态

### 管理后台(Web)
- **管理员登录**:基于 JWT 的安全登录
- **订单管理**:查看所有订单,更新订单状态(待处理/已发货/已完成)
- **卡片管理**:查看、搜索、删除蟹卡
- **卡片导入**:批量导入新蟹卡(支持 CSV 格式)
- **修改密码**:修改管理员登录密码
- **订单导出**:导出订单数据为 CSV 文件

## 默认数据

### 测试卡片
首次启动服务器会自动初始化 10 张默认蟹卡:

| 卡号 | 密码 |
|------|------|
| CRAB20240001 | 123456 |
| CRAB20240002 | abcdef |
| CRAB20240003 | 888888 |
| CRAB20240004 | 666666 |
| CRAB20240005 | 111111 |
| CRAB20240006 | 222222 |
| CRAB20240007 | 333333 |
| CRAB20240008 | 444444 |
| CRAB20240009 | 555555 |
| CRAB20240010 | 777777 |

### 管理员账号
- 用户名:`xmc`
- 密码:`admin123`

> 可在 [server/server.js](server/server.js) 的 `ADMIN_USER` 中修改。登录后可在管理后台修改密码。

## API 接口

### 公开接口(无需认证)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/cards/validate` | 验证蟹卡 |
| POST | `/api/orders` | 创建订单 |

### 管理接口(需要 JWT 认证)
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/login` | 管理员登录 |
| PUT | `/api/admin/password` | 修改管理员密码 |
| GET | `/api/cards` | 获取卡片列表(支持搜索和状态过滤) |
| DELETE | `/api/cards/:cardNo` | 删除蟹卡 |
| POST | `/api/cards/import` | 批量导入蟹卡 |
| GET | `/api/orders` | 获取订单列表(支持状态过滤) |
| PUT | `/api/orders/:orderId/status` | 更新订单状态 |
| GET | `/api/orders/export` | 导出订单 CSV |

> 详细参数说明见 [server/README.md](server/README.md)

### 订单状态流转
```
pending(待处理) → shipped(已发货) → completed(已完成)
```

## 数据存储

- **后端服务器**:使用 SQLite 数据库,数据文件位于 [server/data/crab_card.db](server/data/crab_card.db)
- **数据迁移**:首次启动时,如果存在旧的 JSON 数据文件(`cards.json` / `orders.json`),会自动迁移到 SQLite 并将原文件重命名为 `.bak` 备份
- **小程序本地**:仅存储当前登录的卡片信息和管理员登录状态

## 部署说明

### 管理后台部署
1. 在 [admin-web/nginx.conf](admin-web/nginx.conf) 中配置你的域名和 SSL 证书路径
2. 在 [admin-web/deploy.sh](admin-web/deploy.sh) 中配置服务器地址
3. 执行部署:
   ```bash
   cd admin-web
   npm run build
   bash deploy.sh
   ```

### Nginx 配置要点
- 前端静态资源:指向 `admin-web/dist`
- API 反向代理:`/api/` 代理到后端服务器 `http://localhost:3000`
- 启用 HTTPS

## 注意事项

1. **必须先启动后端服务器**,小程序和管理后台才能正常使用
2. 修改服务器端口时,需要同步修改 [utils/api.js](utils/api.js) 中的 `BASE_URL` 和 [admin-web/vite.config.js](admin-web/vite.config.js) 中的代理目标
3. 建议定期备份 [server/data/crab_card.db](server/data/crab_card.db) 数据库文件
4. 真机调试时,需要确保手机能访问到服务器地址(可使用内网穿透工具)
5. 生产环境部署时,请修改 [server/server.js](server/server.js) 中的 `JWT_SECRET` 和管理员账号

## 常见问题

### Q: 小程序提示"网络错误"?
A: 检查后端服务器是否已启动,并确认 [utils/api.js](utils/api.js) 中的服务器地址配置正确。

### Q: 管理后台登录后提示"未授权"?
A: JWT token 已过期(默认 24 小时),重新登录即可。

### Q: 如何修改服务器端口?
A: 修改 [server/server.js](server/server.js) 中的 `PORT` 变量,并同步更新 [utils/api.js](utils/api.js) 和 [admin-web/vite.config.js](admin-web/vite.config.js)。

### Q: 数据库如何备份?
A: 直接复制 [server/data/crab_card.db](server/data/crab_card.db) 文件即可。SQLite 是单文件数据库。

### Q: 从旧版本(JSON 存储)升级后数据会丢失吗?
A: 不会。首次启动新版服务器会自动从 `cards.json` 和 `orders.json` 迁移数据到 SQLite,并将原文件重命名为 `.bak` 备份。

## 许可证

ISC
