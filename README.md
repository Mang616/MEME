# MEME

迷因电竞 MEME — 陪玩品牌官网 + 微信小程序下单端（monorepo）。

## 目录结构

```text
apps/
  website/        Next.js 官网（品牌宣传、引导下单）
  miniprogram/    微信原生小程序（miniapp/ 用开发者工具打开）
  client/         客户端占位（规划中）
  admin/          运营后台占位（规划中）
packages/
  theme/          Web 设计 token（tokens.css）
docs/             产品与视觉说明
scripts/
  check.mjs       仓库级校验（官网 + 小程序）
```

## 常用命令

在仓库根目录执行：

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动官网开发服务 |
| `npm run check` | 校验官网关键文件 + 小程序页面完整性 |
| `npm run miniprogram:verify` | 仅校验小程序 `app.json` 页面文件 |
| `npm run website:build` | 构建官网 |
| `npm run website:start` | 启动官网生产预览 |

官网开发地址：http://localhost:4173/

## 官网路由

| 路径 | 说明 |
|------|------|
| `/` | 首页 |
| `/order` | 去下单（打开下单站 / 下载应用 / 微信小程序） |
| `/#about` | 关于我们（首页锚点） |
| `/download` | 重定向到 `/order#install` |
| `/mini-program` | 重定向到 `/order#wechat` |

## 环境变量（官网）

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_SITE_URL` | 官网域名，默认 `https://meme.example.com` |
| `NEXT_PUBLIC_ORDER_SITE_URL` | 外部下单站地址，默认 `https://order.meme.example.com` |

## 小程序

微信开发者工具打开：

```text
apps/miniprogram/miniapp/
```

开发 mock 登录验证码：`123456`

## 设计规范

小程序为视觉基准；Web 侧通过 `packages/theme/tokens.css` 对齐黑/白模式、薄荷绿 `#d1ffbd`、强调红 `#ff3b30` 等 token。详见 `docs/design-system.md`。
