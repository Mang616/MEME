# 展示类本地数据（待接 API）

| 模块 | 用途 |
|------|------|
| `banners.js` | 首页轮播 |
| `chats.js` | 会话与消息 |
| `vip-levels.js` | 等级静态表（种子 / API 兜底） |
| `vip-activity.js` | VIP 活动 seed 兜底（默认数据见 `utils/vip-activity-defaults.js`） |
| `legal.js` / `minor-guide.js` | 协议与指引正文 |
| `quick-entries.js` | 「我的」快捷入口图标 |
| `product-reviews.js` / `product-intros.js` | 商品详情展示 |
| `invite-banner.js` / `invite-activity.js` | 邀请活动 seed 兜底（默认数据见 `utils/invite-activity-defaults.js`） |

业务数据（商品 / 订单 / 打手 / 分类）已走 `utils/api/`，不在此目录。

VIP 活动运行时配置见 `utils/vip-activity.js`（`GET /content/vip-activity`）；修改默认门槛/特权模板请改 `packages/vip-activity-defaults` 后执行 `npm run miniprogram:sync-vip-activity`。

邀请活动运行时配置见 `GET /content/invite-activity`；修改默认文案/规则请改 `packages/invite-activity-defaults` 后执行 `npm run miniprogram:sync-invite-activity`。
