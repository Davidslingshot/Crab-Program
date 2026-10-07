# 蟹卡提货小程序

微信小程序蟹卡提货系统：用户凭蟹卡登录、填写收货信息提货、查询订单。商家后台已迁到网页（`admin-web`），小程序内不再包含管理端。

## 项目结构

```
miniprogram-7/
├── pages/
│   ├── login/             # 蟹卡登录（页面锁定，不可上下滑动）
│   ├── pickup/            # 提货申请（姓名 / 手机号 / 地址）
│   ├── order/             # 订单详情
│   └── legal/             # 《用户服务协议》《隐私政策》
├── images/                # 登录页江南水乡背景等静态图（单图需 < 200KB）
├── utils/
│   └── api.js             # 小程序请求封装（BASE_URL 指向后端）
├── admin-web/             # 商家网页后台（Vue 3 + Vite + Element Plus）
├── server/                # 后端（Express + SQLite）
│   ├── server.js
│   └── data/              # SQLite 数据库文件（自动生成）
├── app.js / app.json
└── project.config.json
```

微信开发者工具请打开 **`D:\miniprogram-7`**（不要打开 C 盘 `WeChatProjects` 下的副本，以免改错目录）。

## 快速开始

### 1. 启动后端

```bash
cd server
npm install
npm start
```

本地默认：`http://localhost:3000`  
健康检查：`GET /api/health`

生产环境当前小程序配置为：`http://175.27.225.217/api`（见 `utils/api.js` 中的 `BASE_URL`）。改地址后需重新编译小程序。

### 2. 打开小程序

1. 微信开发者工具 → 打开项目 → 选择本仓库根目录  
2. 详情 → 本地设置：勾选「不校验合法域名」（开发阶段）  
3. 编译运行  

`project.config.json` 已排除 `server`、`admin-web`、`node_modules` 等，避免把后端打进小程序包。

### 3. 打开商家网页后台

```bash
cd admin-web
npm install
npm run dev
```

开发时 Vite 将 `/api` 代理到后端。默认管理员：`admin` / `admin123`（上线请务必修改）。

## 功能说明

### 用户端（小程序）

- **登录**：卡号 + 密码；须勾选同意《用户服务协议》和《隐私政策》后才能登录  
- **提货申请**：填写收货人、手机号、地址、备注；未勾选协议不能提交；手机号仅用于配送  
- **订单详情**：按蟹卡查询订单状态（待处理 / 已发货 / 已完成）；已发货可确认收货  
- **合规文案**：`pages/legal` 提供协议与隐私政策全文  

### 商家端（网页）

- 管理员登录（JWT）  
- 订单列表、发货、完成、导出 CSV  
- 蟹卡列表、导入、删除未使用卡  

## 默认测试蟹卡

首次初始化数据库时写入：

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

## 数据存储

- 后端使用 **SQLite**（`server/data/crab_card.db`），不再使用 JSON 作为主存储  
- 小程序本地只保存当前登录蟹卡（及可选的订单缓存），不作为订单主数据源  
- 请定期备份 `server/data` 目录  

## 主要接口

用户侧（无需管理员 token）：

- `POST /api/cards/validate` 校验蟹卡  
- `POST /api/orders` 创建提货订单  
- `GET /api/orders/bycard/:cardNo` 按卡号查订单  
- `POST /api/orders/mine` 凭卡号密码查自己的订单  
- `POST /api/orders/confirm` 用户确认收货  

管理侧（需 `Authorization: Bearer <token>`）：

- `POST /api/admin/login`  
- `GET /api/cards`、`POST /api/cards/import`、`DELETE /api/cards/:cardNo`  
- `GET /api/orders`、`PUT /api/orders/:orderId/status`、`GET /api/orders/export`  

详见 [server/README.md](server/README.md)。

## 微信审核与隐私

小程序会收集用户**主动填写**的姓名、手机号、收货地址，用于发货，不调用微信头像/手机号授权、定位、相册等隐私接口。

上传前请同时在[微信公众平台](https://mp.weixin.qq.com)配置 **设置 → 服务内容声明 → 用户隐私保护指引**，收集类型选择手机号（用户自行填写），用途填写配送联系。

单张图片需小于 200KB；已开启组件按需注入（`lazyCodeLoading`）。

## 注意事项

1. 小程序必须能访问到后端地址；真机调试不要用本机 `localhost`  
2. 修改端口时同步改 `utils/api.js` 的 `BASE_URL`，以及 `admin-web/vite.config.js` 的代理目标  
3. 开发者工具里的 `Error: timeout`（堆栈在 `WAServiceMainContext.js`）多为工具访问微信服务超时，与业务接口无关  

## 常见问题

**小程序提示网络错误**  
检查服务器是否运行，以及 `BASE_URL` 是否指向当前环境。

**重新登录看不到订单**  
订单按蟹卡查询。确认后端已部署带 `/api/orders/bycard` 的版本，且开发者工具打开的是本仓库目录。

**上传提示代码包过大 / 图片超过 200K**  
不要把 `server`、`admin-web` 打进小程序；登录背景请使用 `images/jiangnan.jpg`。

**真机调试 80051 超过 2MB**  
同样检查打包忽略项，并确认没有把过大的 PNG 打进包内。

## 技术栈

- 小程序：微信原生  
- 商家后台：Vue 3、Vite、Element Plus  
- 后端：Node.js、Express、better-sqlite3、JWT  

## 许可证

ISC
