# MEME Server

统一后端 API，服务微信小程序、运营后台及后续客户端。

## 存储

| 模式 | 条件 | 说明 |
|------|------|------|
| **MySQL**（推荐上线） | 设置 `DATABASE_URL` | 自建服务器 / Docker |
| **JSON**（仅本地） | 未设置 `DATABASE_URL` | `data/db.json`，勿用于生产 |

ORM：[Drizzle](https://orm.drizzle.team/) + `mysql2`

## 结构

```text
src/
  index.ts          入口
  db/
    schema.ts       表结构
    mysql-store.ts  MySQL 读写
    json-store.ts   JSON 回退
    seed.ts         空库自动灌 seed
  services.ts       业务层
  routes/           API 路由
seed/
  initial.json      初始数据
drizzle/            SQL 迁移
```

## 自建服务器 MySQL（推荐）

### 1. 在服务器上创建库与用户

```sql
CREATE DATABASE meme CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'meme'@'%' IDENTIFIED BY '你的强密码';
GRANT ALL PRIVILEGES ON meme.* TO 'meme'@'%';
FLUSH PRIVILEGES;
```

若 API 与 MySQL 同机，可把 `'%'` 改为 `'localhost'`。

### 2. 配置环境变量

```bash
cp apps/server/.env.example apps/server/.env
```

编辑 `apps/server/.env`：

```env
DATABASE_URL=mysql://meme:你的强密码@127.0.0.1:3306/meme
ADMIN_PASSWORD=...
AUTH_SECRET=...
```

### 3. 建表并启动

在 monorepo 根目录：

```bash
npm install
npm run server:db:push    # 根据 schema 建表
npm run server:dev        # 空库会自动灌 seed/initial.json
```

手动重灌种子数据（会清空表）：

```bash
npm run server:db:seed
```

### 4. 生产运行

```bash
npm run server:build
cd apps/server && node --env-file=.env dist/index.js
```

建议用 **systemd / pm2** 守护进程，MySQL 定期备份。

## 本地用 Docker 模拟自建 MySQL

```bash
cd apps/server
docker compose up -d
cp .env.example .env   # DATABASE_URL 已指向 127.0.0.1:3306/meme
npm run db:push
npm run dev
```

## 启动（无 MySQL 时）

不配置 `DATABASE_URL` 时仍用 JSON，适合快速联调：

```bash
npm run server:dev
npm run stack:dev     # API + 运营后台
```

## 主要接口

| 路径 | 说明 |
|------|------|
| `GET /api/health` | 健康检查（含 `storage: mysql/json`） |
| `GET /api/catalog` | 商品子分类 |
| `GET /api/products` | 已上架商品 |
| `POST /api/orders` | 创建订单 |
| `POST /api/admin/auth/login` | 运营端登录 |

## 从 JSON 迁到 MySQL

1. 按上文建好 MySQL 并 `db:push`
2. 若需保留 `data/db.json` 里的改动，可先备份 JSON，再写一次性导入脚本；默认用 `seed/initial.json` 灌库
3. 生产环境设置 `NODE_ENV=production` 且必须配置 `DATABASE_URL`
