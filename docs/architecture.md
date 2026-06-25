# MEME Monorepo 架构

## 应用一览

| 应用 | 路径 | 技术 | 端口 |
|------|------|------|------|
| 官网 | `apps/website` | Next.js 15 | 4173 |
| 小程序 | `apps/miniprogram` | 微信原生 | — |
| API | `apps/server` | Express + MySQL / JSON | 3000 |
| 运营端 | `apps/admin` | Vite + React + Arco | 4180 |
| 客户端 | `apps/client` | 占位，未启动 | — |

## 数据流

```text
                    apps/server → MySQL（DATABASE_URL）
                    或 data/db.json（无 DATABASE_URL 时）
                              ↑
         ┌────────────────────┼────────────────────┐
         │                    │                    │
   GET/POST /api/*     /api/admin/*          seed/initial.json
         │                    │
  miniprogram/utils/api   apps/admin/lib/api
         │                    │
   微信小程序 UI          运营后台 UI
```

## 共享包

| 包 | 路径 | 用途 |
|----|------|------|
| theme | `packages/theme/tokens.css` | Web 端设计 token |
| types | `packages/types` | 订单状态等常量（server 引用） |

小程序 token 源：`apps/miniprogram/styles/theme/tokens.wxss`（视觉基准，与 Web 人工对齐）。

## 脚本

| 路径 | 用途 |
|------|------|
| `scripts/check.mjs` | 官网 + 小程序 + admin + server 校验 |
| `scripts/miniprogram/verify-pages.js` | 小程序 `app.json` 页面完整性 |

## 常用命令

```bash
npm run dev              # 官网
npm run server:dev       # API
npm run stack:dev        # API + 运营端
npm run check
```

## 文档索引

| 文档 | 内容 |
|------|------|
| [README.md](../README.md) | 仓库入口 |
| [product-plan.md](./product-plan.md) | 产品规划 |
| [design-system.md](./design-system.md) | 视觉规范 |
| [apps/miniprogram/README.md](../apps/miniprogram/README.md) | 小程序 |
| [apps/miniprogram/docs/ARCHITECTURE.md](../apps/miniprogram/docs/ARCHITECTURE.md) | 小程序代码结构 |
| [apps/server/README.md](../apps/server/README.md) | API |
| [apps/admin/README.md](../apps/admin/README.md) | 运营端 |
