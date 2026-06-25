# 平台域名配置

**只需改本目录下的 `domains.json`，然后执行：**

```bash
npm run config:sync
```

## 生产环境子域名约定

| 用途 | 默认地址 |
|------|----------|
| 官网 | `https://memepw.top` |
| API | `https://api.memepw.top`（小程序 request 合法域名） |
| 运营后台 | `https://admin.memepw.top` |

## 各端如何读取

| 应用 | 说明 |
|------|------|
| 小程序 | `utils/platform-domains.js`（由 sync 生成，勿手改） |
| API | 启动时读取 `config/domains.json` + `apps/server/.env` |
| 运营后台 | 开发走 Vite 代理；生产构建用 `VITE_API_BASE`（见 `.env.example`） |
| 官网 | `NEXT_PUBLIC_*`（见 `apps/website/.env.example`） |

## 小程序上线前

1. `domains.json` → `miniprogram.env` 改为 `"prod"`
2. `npm run config:sync` 后重新编译小程序
3. 微信公众平台配置服务器域名：`wechat.requestLegalDomain` 等（见 `domains.json`）
4. 小程序「downloadFile 合法域名」需加入 COS 桶域名或 `COS_PUBLIC_BASE` 的域名

## 腾讯云 COS

在 `apps/server/.env` 配置（模板见 `apps/server/.env.example`），运营后台 Banner / 用户头像支持一键上传。

| 变量 | 说明 |
|------|------|
| `COS_SECRET_ID` / `COS_SECRET_KEY` | 子账号密钥（勿提交 Git） |
| `COS_BUCKET` | 存储桶名称，格式 `桶名-1322855353` |
| `COS_REGION` | 地域，如 `ap-guangzhou` |
| `COS_PUBLIC_BASE` | 可选 CDN，如 `https://img.memepw.top` |
