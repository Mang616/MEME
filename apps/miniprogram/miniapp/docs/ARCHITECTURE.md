# 迷因电竞小程序 · 结构说明

> 产品名称：**迷因电竞**（GitHub 仓库 [Mang616/MEME](https://github.com/Mang616/MEME) 为 monorepo 代号，与界面展示名称无关）  
> **本目录在 monorepo 中的路径**：`apps/miniprogram/`（本地 Esports 开发时对应 `miniapp/`）

## 分层约定

```
Page（薄控制器）
  ├── behaviors/themed-page      → theme-behavior（主题订阅）
  ├── components/page-shell    → navigation-bar + 主题 scope
  ├── utils/catalog.js / *-page.js
  ├── utils/filter-list-page.js
  ├── utils/page-helpers.js    → 筛选列表页 mount / Tab 切换
  ├── utils/line-tabs.js       → Tab 数据 + getTabChangeId
  ├── utils/nav.js
  └── components/
```

**Page 只做：** `onLoad` → `init*Page` / `build*State` → `setData`；交互转发 `nav` / `ui`。

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
| 创建订单 | `order-create-page.buildOrderCreateState` / `submitOrderCreate` |
| 选打手 | `handler-select-page.buildHandlerSelectState` |
| 订单 | `orders-page.initOrdersPage`；脏刷新 `orders-refresh` |
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
