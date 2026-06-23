# 迷因电竞 · 三角洲点单

> 产品名称：**迷因电竞**。界面、首页、登录页等均只显示「迷因电竞」；完整称谓「迷因电竞（meme电竞）」仅用于 README、协议等文档场景。

## Git 仓库

远程 monorepo：**[github.com/Mang616/MEME](https://github.com/Mang616/MEME)**

| 本机目录（Esports） | MEME 仓库路径 | 说明 |
|---------------------|---------------|------|
| `miniapp/` | **`apps/miniprogram/`** | 微信小程序（微信开发者工具打开此目录） |
| `server/` | 待定（后端尚未进 MEME） | 本地预留 API |
| `scripts/` | `scripts/`（与 MEME 根脚本合并时需协调） | 校验等开发脚本 |

当前 **Esports 目录未 `git init`**，与 GitHub 尚未关联。接入步骤见 **[docs/GIT_SETUP.md](docs/GIT_SETUP.md)**。

```bash
cd /Users/mang/Documents/GanSa/Project
git clone https://github.com/Mang616/MEME.git
bash Esports/scripts/sync-to-meme-repo.sh MEME
cd MEME && git add apps/miniprogram scripts .gitignore && git commit -m "feat(miniprogram): 接入迷因电竞小程序" && git push origin main
```

MEME 仓库还包含 `apps/website`、`apps/client`、`apps/admin` 等，与本小程序并列。

## 目录约定（本地 Esports）

```
Esports/
├── miniapp/          # ≡ MEME 的 apps/miniprogram/
├── server/           # 后端 API（预留）
├── scripts/          # 仓库级脚本（不参与小程序打包）
└── README.md
```

- 小程序通过 `miniapp/utils/config.js` 的 `apiBase` 对接后端。
- 开发阶段可在开发者工具勾选「不校验合法域名」，本地调试 `http://localhost`。

## 小程序

微信开发者工具打开 **`miniapp/`**（接入 MEME 后改为 **`apps/miniprogram/`**）。

| Tab | 路径 | 说明 |
|-----|------|------|
| 首页 | `pages/home` | 公告、快捷入口、服务大卡、商品网格 |
| 商品 | `pages/products` | 顶栏搜索 + 护航/陪玩 Tab + 侧栏筛选 + 商品列表 |
| 订单 | `pages/orders` | 状态 Tab + 订单卡片 |
| 聊天 | `pages/chat` | 会话筛选、未读角标、一键已读 |
| 我的 | `pages/profile` | 用户资产、帮助入口、设置 |

**主要子页**：`product-detail`、`order-create`、`handler-select`、`order-detail`、`search`、`chat-room`、`login`、`bind-phone`、`profile-edit`、`settings`、`legal`、`feedback`、`minor-guide`、`vip-level`。

若编译报 `WXML file not found`，见 `miniapp/docs/DEVTOOLS.md`。

**真机调试包体 ≤ 2MB**：勿在 `assets/` 下放入 `Library` 等本地缓存；页面校验：

```bash
node scripts/verify-miniapp-pages.js
```

Mock 数据：`utils/mock/`。登录 mock 见 `utils/auth-api.js`（开发环境验证码 **`123456`**）。

**深浅色模式**：见 `miniapp/docs/THEME.md`。  
**代码结构**：见 `miniapp/docs/ARCHITECTURE.md`。

## 后端（预留）

建议 `server/` 提供 REST API，例如：

- `GET /api/products`
- `GET /api/orders`
- `POST /api/orders`
- `POST /api/auth/*`（登录、绑定手机）

具体技术栈待选型；MEME  monorepo 内后端位置待与仓库结构统一。
