# MEME Server

统一后端 API，服务微信小程序、运营后台及后续客户端。

## 结构

```text
src/
  index.ts          入口与路由挂载
  db.ts             JSON 持久化（data/db.json）
  services.ts       商品 / 订单 / 打手 / 分类业务
  constants.ts      订单状态等共享常量
  lib/              订单工厂、Admin 行映射
  routes/
    public.ts       小程序只读 + 下单
    admin/          运营端鉴权 API
seed/
  initial.json      首次启动种子数据（与历史 mock 对齐）
```

## 启动

```bash
npm run server:dev    # http://localhost:3000
npm run stack:dev     # API + 运营后台
```

## 主要接口

| 路径 | 说明 |
|------|------|
| `GET /api/catalog` | 商品子分类 |
| `GET /api/products` | 已上架商品 |
| `POST /api/orders` | 创建订单 |
| `GET /api/orders` | 订单列表 |
| `POST /api/admin/auth/login` | 运营端登录 |

开发数据写入 `data/db.json`；需重置时删除该文件后重启。
