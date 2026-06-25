# 迷因电竞 · 运营后台

Vite + React + Arco Design，对接 `apps/server` API。

```bash
npm run stack:dev     # 推荐：API + 本应用
npm run admin:dev     # 仅前端（需另开 server:dev）
```

- 地址：http://localhost:4180
- 默认账号：`admin` / `admin123`（与 `apps/server` 的 `ADMIN_*` 环境变量一致）

## 环境变量

| 文件 | 变量 | 说明 |
|------|------|------|
| `apps/server/.env` | `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `AUTH_SECRET` | 登录与 Token 签名，见 `.env.example` |
| `apps/admin/.env` | `VITE_API_BASE` | 生产构建 API 根路径，开发默认 `/api`（Vite 代理到 :3000） |

入口文件保留 Arco `setCreateRoot` 注入（`src/lib/arco-react19.ts`）。`element.ref` 警告由 `src/shims/arco-react-dom.ts` + Vite 插件处理；**改 vite 配置或 shim 后需重启 dev 并清 `node_modules/.vite` 缓存**。
