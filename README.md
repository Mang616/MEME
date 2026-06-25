# MEME

迷因电竞 MEME — 陪玩品牌官网 + 微信小程序 + 统一 API + 运营后台（monorepo）。

## 目录结构

```text
apps/
  website/          Next.js 官网
  miniprogram/      微信小程序（开发者工具打开此目录）
  server/           统一后端 API
  admin/            运营后台
  client/           客户端占位（未启动）
packages/
  theme/            Web 设计 token
  types/            跨端共享类型与常量（server 使用）
docs/               产品与架构文档
config/
  domains.json      平台域名唯一配置源（改后 npm run config:sync）
scripts/
  check.mjs         全仓库校验
  miniprogram/      小程序校验脚本
```

完整说明见 [docs/architecture.md](docs/architecture.md)。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动官网（:4173） |
| `npm run server:dev` | 启动 API（:3000） |
| `npm run admin:dev` | 启动运营后台（:4180） |
| `npm run stack:dev` | API + 运营后台 |
| `npm run check` | 全仓库校验 |
| `npm run config:sync` | 将 `config/domains.json` 同步到小程序等 |
| `npm run miniprogram:verify` | 校验小程序页面文件 |

## 域名配置（memepw.top）

**只改一处：** [config/domains.json](config/domains.json)，然后执行 `npm run config:sync`。

| 环境 | 地址 |
|------|------|
| 官网 | https://memepw.top |
| API | https://api.memepw.top |
| 运营后台 | https://admin.memepw.top |

详见 [config/README.md](config/README.md)。

## 开发入口

| 应用 | 打开方式 |
|------|----------|
| 官网 | http://localhost:4173 |
| 运营后台 | http://localhost:4180（`admin` / `admin123`） |
| API | http://localhost:3000/api |
| 小程序 | 微信开发者工具 → `apps/miniprogram/`，勾选不校验合法域名 |

小程序开发前需先 `npm run server:dev`。登录 mock 验证码：`123456`。

## 文档

| 文档 | 说明 |
|------|------|
| [docs/architecture.md](docs/architecture.md) | Monorepo 架构与数据流 |
| [docs/design-system.md](docs/design-system.md) | 跨端视觉规范 |
| [docs/product-plan.md](docs/product-plan.md) | 产品规划 |
| [apps/miniprogram/README.md](apps/miniprogram/README.md) | 小程序开发 |
| [apps/server/README.md](apps/server/README.md) | API |
| [apps/admin/README.md](apps/admin/README.md) | 运营后台 |

## 环境变量（官网）

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SITE_URL` | 官网域名（默认 `https://memepw.top`） |
| `NEXT_PUBLIC_ORDER_SITE_URL` | 下单页（默认 `https://memepw.top/order`） |
| `NEXT_PUBLIC_API_ORIGIN` | API 根路径（默认 `https://api.memepw.top`） |

生产域名以 `config/domains.json` 为准，见 `apps/website/.env.example`。
