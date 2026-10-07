# 蟹卡提货后端

为小程序和网页后台提供接口。数据使用 SQLite（`data/crab_card.db`），首次启动会建表并写入默认蟹卡。

## 安装与启动

需要 Node.js 14+。

```bash
cd server
npm install
npm start          # 生产
npm run dev        # 开发（nodemon）
```

默认监听 `http://localhost:3000`。可用 `GET /api/health` 确认进程是否为最新代码。

## 用户接口（无需管理员 token）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/cards/validate` | 校验卡号密码，返回卡片及是否已提货 |
| POST | `/api/orders` | 提交提货（姓名、手机、地址、备注） |
| GET | `/api/orders/bycard/:cardNo` | 按卡号查询订单 |
| POST | `/api/orders/mine` | 凭卡号密码查询自己的订单 |
| POST | `/api/orders/confirm` | 用户确认收货 |

## 管理接口（需 JWT）

请求头：`Authorization: Bearer <token>`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/admin/login` | 管理员登录 |
| GET | `/api/cards` | 卡片列表（search、status） |
| POST | `/api/cards/import` | 批量导入 |
| DELETE | `/api/cards/:cardNo` | 删除卡片 |
| GET | `/api/orders` | 订单列表（status） |
| PUT | `/api/orders/:orderId/status` | 改状态：pending / shipped / completed |
| GET | `/api/orders/export` | 导出 CSV |

默认管理员：`admin` / `admin123`。

## 数据

- 目录：`server/data/`  
- 主库：`crab_card.db`  
- 旧版 JSON 仅在库为空时尝试迁移一次  

请定期备份整个 `data` 目录。

## 默认测试卡

CRAB20240001～CRAB20240010，密码依次为：123456、abcdef、888888、666666、111111、222222、333333、444444、555555、777777。

## 注意

修改端口时，同步更新小程序 `utils/api.js` 的 `BASE_URL` 和 `admin-web/vite.config.js` 的代理目标。云主机部署后需重启正在运行的 Node 进程，仅 `pm2 restart` 而文件未覆盖不会生效。
