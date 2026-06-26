# 迷因电竞 · 运营后台

Vite + React + Arco Design，对接 `apps/server` API。

```bash
npm run stack:dev     # 推荐：API + 本应用
npm run admin:dev     # 仅前端（需另开 server:dev）
```

- 地址：http://localhost:4180
- 默认账号：`admin` / `admin123`（与 `apps/server` 的 `ADMIN_*` 环境变量一致）

### 预置角色与测试账号

| 角色 | 标识 | 测试账号 | 密码 | 说明 |
|------|------|----------|------|------|
| 超级管理员 | `super_admin` | `admin` | `admin123` | 全部权限 |
| 运营 | `operator` | `yunying` | `yunying123` | 商品、订单、内容、打手档案 |
| 客服 | `cs` | `kefu` | `kefu123` | 会话、派单、售后、反馈 |
| **打手** | `handler` | h1、h2、h4 | `dashou123` / `handler123` | 仅护航单 |
| **陪玩** | `companion` | h3、h5、h6 | `handler123` | 仅陪玩单 |

**打手（`handler`）默认权限**

| 权限 | 能力 |
|------|------|
| `orders.mine` | 我的订单：用户指定单 + 已接订单 |
| `orders.accept` | 接单大厅：抢「系统自动分配」订单 |
| `chats.player` | 打手会话：与用户按单沟通 |
| `chats.reply` | 回复会话消息 |

测试打手账号 `dashou` 绑定护航打手 `h1`；其余种子服务者账号见上表。新建打手/陪玩时会同步创建后台用户。

若登录后菜单不对，到 **系统 → 角色权限** 选中「打手」点 **恢复默认**。

## 环境变量

| 文件 | 变量 | 说明 |
|------|------|------|
| `apps/server/.env` | `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `AUTH_SECRET` | 登录与 Token 签名，见 `.env.example` |
| `apps/admin/.env` | `VITE_API_BASE` | 生产构建 API 根路径（默认 `https://api.memepw.top/api`，见 `config/domains.json`） |

入口文件保留 Arco `setCreateRoot` 注入（`src/lib/arco-react19.ts`）。`element.ref` 警告由 `src/shims/arco-react-dom.ts` + Vite 插件处理；**改 vite 配置或 shim 后需重启 dev 并清 `node_modules/.vite` 缓存**。
