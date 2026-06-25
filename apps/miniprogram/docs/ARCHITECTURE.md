# 迷因电竞小程序 · 结构说明

> Monorepo 路径：`apps/miniprogram/`（微信开发者工具打开此目录）

## 分层约定

```text
Page（薄控制器）
  ├── behaviors/themed-page
  ├── utils/api/              → apps/server REST
  ├── utils/catalog.js        → 商品列表状态（读 api 缓存）
  ├── utils/*-page.js         → 各页状态组装
  ├── utils/page-data.js      → withCatalog / withOrders 加载守卫
  ├── utils/doc-sections.js   → 协议/指引章节格式化
  ├── utils/sms-countdown.js  → 登录/绑定手机验证码倒计时
  ├── utils/mock/             → Banner、聊天、VIP 等展示数据（见 mock/README.md）
  ├── utils/nav.js / ui.js
  └── components/
```

**Page 只做：** `onLoad` → 等待 API 缓存（如需）→ `build*State` → `setData`；交互转发 `nav` / `ui`。

## API 与数据

| 数据 | 来源 | 模块 |
|------|------|------|
| 商品、分类、订单、打手 | `apps/server` | `utils/api/request.js` → `repository.js` |
| Banner、聊天、VIP、协议 | 本地 mock | `utils/mock/*.js` |
| 登录 | mock（待接 API） | `utils/auth-api.js` |

启动时 `app.js` → `api.warmup()` 预拉商品/订单/打手。页面用 `page-data.withCatalog()` 等确保缓存就绪。

| API 地址 | `utils/config.js` → `apiBase` |

## 商品与搜索

| 页面 | 说明 |
|------|------|
| `pages/products` | 薄 Page + **`products-panel`**（同构订单 Tab + 侧栏/主列表双 scroll） |
| `pages/search` | 全站搜索（`navigateTo`，不用 `subpage`）；列表 `layout=subpage` |

- 商品 Tab 搜索与侧栏筛选解耦
- 列表展示统一 `mapProductForDisplay`（`catalog.mapProductsForList`）

## 复用组件

| 组件 | 用途 |
|------|------|
| `line-tabs` | 顶栏下划线 Tab，`tabchange` 事件 |
| `products-panel` | 商品 Tab：`page-tab-main` + 侧栏/主列表双 scroll，内联 `product-row` |
| `filter-tab-page` | 订单/聊天：Tab + scroll + **list-empty** |
| `product-list-scroll` | 搜索等子页列表（`layout=subpage`） |
| `chat-item` | 聊天 Tab 会话行 |
| `cover-media` | 商品封面占位 + 加载淡入（列表/详情/订单共用） |
| `list-empty` | 列表空态 |
| `price-badge` | 价格标签 |

## 筛选列表页（订单 / 聊天）

`createFilterListHandlers` → `init*Page` + `build*Slice` + `<filter-tab-page>`

页面模式：

```javascript
onLoad() {
  mountFilterList(this, () => initXxxPage(FILTER_ALL), {
    cacheKey: '_listCache',
    pickCache: (r) => r.allItems,
    pickPageData: (r) => r.pageData,
  })
},
onTabChange(e) {
  applyFilterTabChange(this, e, {
    activeKey: 'activeXxx',
    cacheKey: '_listCache',
    buildSlice,
  })
}
```

## 状态组装入口

| 页面 | 入口 |
|------|------|
| 首页 | `catalog.buildHomeState`；Banner `home-banner.enrichBanners` |
| 商品 | `products-page` → `catalog.buildProductsPageState` / `buildProductsPageSlice` |
| 搜索 | `catalog.buildSearchPageState` |
| 详情 | `product-page.buildProductDetailState` |
| 创建订单 | `order-create-page` → `repository.createOrder` |
| 选打手 | `handler-select-page.buildHandlerSelectState` |
| 订单 | `orders-page` + `orders-refresh`（脏标记后 `refreshOrders`） |
| 聊天 | `chat-page.initChatPage`；Tab 角标 `chat-tab-badge` |
| 我的 | `profile-page.initProfilePage`；菜单 `profile-actions` |

## 登录

| 模块 | 说明 |
|------|------|
| `utils/auth.js` | Session、`loginBySms` / `loginByWechat`、`requireLogin` |
| `utils/auth-api.js` | 发码 / 验码 / `wx.login`（mock） |
| `utils/login-page.js` | 登录页状态（模式切换、验证码按钮文案） |
| `pages/login` | 验证码登录 + 底部「微信一键登录」；协议链至 `pages/legal` |
| `pages/bind-phone` | 已登录用户绑定手机（不换 token；无协议勾选、无微信入口） |
| `pages/legal` | 用户协议 / 隐私政策（`?type=agreement\|privacy`） |
| `styles/theme/phone-form.wxss` | 手机号 + 验证码表单样式（登录 / 绑定共用） |

- 默认未登录；`我的` 点头像区 / `设置` 可进入登录
- 开发环境验证码固定 **`123456`**

## 跨页跳转

| 方法 | 用途 |
|------|------|
| `openLogin` | 登录子页（`redirect`、`mode=sms\|wechat`） |
| `openBindPhone` | 绑定手机号子页（需已登录） |
| `openSearch` | 全站商品搜索 |
| `openProductsTab` | 商品 Tab（`pendingServiceType`） |
| `openProductDetail` / `openProductFromEvent` | 详情 |
| `openChatRoom` / `openServiceChat` | 聊天室 / 官方客服 |
| `openOrderCreate` / `openHandlerSelect` | 创建订单 / 选打手 |
| `openProfileEdit` | 个人资料 |

## Tab 事件约定

- `line-tabs` / `service-panel` / `filter-tab-page` 统一触发 **`tabchange`**，`detail.id`
- Tab 列表下拉刷新：`pull-refresh-scroll` + `utils/pull-refresh.js`（`runPullRefresh`）
- `service-panel`：单 Tab 内 bg + 右图 + 左文案；见 THEME.md、`wxs/service-panel.wxs`
- 页面用 `line-tabs.getTabChangeId(e, currentId)` 防重复切换

## 主题与底部

见 [THEME.md](./THEME.md)、[DESIGN_TOKENS.md](./DESIGN_TOKENS.md)。

新增子页或改路径后若报 `WXML file not found`，见 [DEVTOOLS.md](./DEVTOOLS.md)。

Tab 图标：`utils/tab-bar.js`，深浅各 5×2 张 PNG，随 `setTheme` 刷新。
