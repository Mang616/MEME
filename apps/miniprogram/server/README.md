# Server（预留）

后端与 `miniapp/` 平级，负责 API、支付回调、管理端等。

当前 **未开始业务开发**。小程序阶段使用 `miniapp/utils/mock/` 假数据。

## 对接约定（草案）

- 基础路径：`/api`
- 鉴权：微信小程序 `code` 换 `session`，请求头携带 token
- 与小程序配置：`miniapp/utils/config.js` → `apiBase`

待前端页面稳定后再启动本目录工程。
