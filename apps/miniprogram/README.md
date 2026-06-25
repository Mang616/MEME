# 迷因电竞 · 微信小程序

微信开发者工具打开目录：

```text
apps/miniprogram/
```

## 目录结构

```text
apps/miniprogram/
  pages/              页面
  components/         组件
  utils/
    api/              HTTP 与数据缓存（对接 apps/server）
    mock/             展示类本地数据（Banner、聊天、VIP 等）
  styles/theme/       设计 token（视觉基准）
  docs/               开发文档
```

仓库级脚本：`scripts/miniprogram/verify-pages.js`（`npm run miniprogram:verify`）。

## 开发

在 monorepo 根目录：

```bash
npm run server:dev      # 必须先启动 API（:3000）
npm run miniprogram:verify
npm run miniprogram:icons   # 从 logo.webp 生成多端 App 图标与 logo.png
```

微信开发者工具：**详情 → 本地设置 → 不校验合法域名**。

| 配置 | 位置 |
|------|------|
| API 地址 | `config/domains.json` → `npm run config:sync` → `utils/platform-domains.js` |
| 登录 mock 验证码 | `123456`（`utils/auth-api.js`） |

### 数据流

- **商品 / 订单 / 打手 / 分类** → `utils/api/` → `apps/server`
- **Banner / 聊天 / VIP / 协议** → `utils/mock/`（待后续上 API）

详见 [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)。

## 主要页面

| Tab | 路径 |
|-----|------|
| 首页 | `pages/home` |
| 商品 | `pages/products` |
| 订单 | `pages/orders` |
| 聊天 | `pages/chat` |
| 我的 | `pages/profile` |

## 文档

| 文档 | 说明 |
|------|------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | 分层、API、页面组装 |
| [THEME.md](./docs/THEME.md) | 深浅色与组件主题 |
| [DESIGN_TOKENS.md](./docs/DESIGN_TOKENS.md) | Token 审计 |
| [DEVTOOLS.md](./docs/DEVTOOLS.md) | 开发者工具排错 |

## 相关应用

`apps/server`（API）、`apps/admin`（运营端）。根目录 `npm run stack:dev` 可同时启动 API 与运营后台。
