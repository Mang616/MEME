# 主题系统说明

## 配色约定

- **主色**：淡绿 `#d1ffbd`（品牌、按钮、选中态、链接等）
- **点缀色**：红 `#ff3b30`（仅**价格红底标签** + **「新品」等角标**，其余用主题色）
- **辅色**：深绿 `#6db85a` / `#9ed482`
- 背景：浅色 `#ffffff` / 深色 `#000000`
- CSS 变量：`--color-accent`、`--color-accent-dim`、`--color-cta-accent-gradient`
- **价格展示**：红底黑字斜体标签 `.price-badge`（`font-style: italic` + `--font-display` 系统字体）。包内 `price-italic.ttf` 超过 48KB 时不再 `loadFontFace`（避免真机 timeout）；上线后可换 CDN https 小字库或子集化 ttf

## 架构

```
utils/theme.js           # 存储、原生壳层（胶囊/导航栏、TabBar、窗口色）、订阅发布
behaviors/theme-behavior.js   # 页面注入 theme / navColor / navBg
components/page-shell/        # 主题容器 + 导航栏（消除 5 页重复 WXML）
navigation-bar 左侧 `showThemeToggle`  # 「我的」页主题切换（`assets/profile/dark.png` / `light.png`）
styles/theme/
  tokens.wxss              # CSS 变量（.theme-light / .theme-dark）
  layout.wxss              # page-root、page-scroll、page-line-tabs-host
  line-tabs.wxss           # 顶栏下划线 Tab（分类 / 订单）
  components.wxss          # card、button、price 等通用类
```

## 数据流

1. `App.onLaunch` → `theme.initTheme()` 读本地存储并应用 **胶囊/导航栏色**（`wx.setNavigationBarColor`）、TabBar、窗口背景
2. 各 Tab 页 `behaviors: require('.../themed-page')` → `show` 时与存储对齐
3. 「我的」页标题栏左侧太阳/月亮 → `theme.setTheme()` → 通知所有订阅页 `setData`

## 顶栏 line-tabs 尺寸

变量均在 `tokens.wxss`，勿在业务页覆写 Tab 字号/指示条高度。

| 变量 | 默认值 | 含义 |
|------|--------|------|
| `--line-tabs-bar-height` | 88rpx | Tab 栏固定高度（真机 scroll-view 需明确高度） |
| `--line-tabs-font-size` | 28rpx | Tab 文案 |
| `--line-tabs-item-pt/pb/px` | 16/20/24rpx | Tab 内边距 |
| `--line-tabs-indicator-h` | 5rpx | 选中下划线高度 |
| `--line-tabs-indicator-active` | `--color-mint-deep` | 选中下划线颜色（深绿） |
| `--line-tabs-host-gap-below` | 8rpx | Tab 与下方区块间距 |
| `--page-header-block-gap` | 20rpx | 顶栏内块间距（如 Tab→搜索） |
| `--page-header-content-gap` | 24rpx | 顶栏与主内容区间距 |

## 导航栏（navigation-bar）

| `page-shell` `navVariant` | 布局 |
|---------------------------|------|
| `default`（默认） | 标题在 **bar 内** 水平居中（`position:absolute`），左侧仅占图标宽 |
| `home`（仅首页） | Logo + 品牌名 + 推广按钮 |

高度：`utils/nav-layout.js` 注入 `--nav-safe-top` + `--nav-bar-h`（iOS 44 / Android 48），**安全区只加一次**于 `inner.padding-top`。首页：`nav-variant="home"`。

## 首页其它

- 推广活动点击：`onPromoTap`（当前 mock）；邀请有礼卡片在「我的」页
- 导航栏下方、轮播上方：**未成年人禁止下单**提示条（`minor-notice-bar`，文案 `config.minorOrderNotice`）
- 下拉刷新：`pull-refresh-scroll`（品牌 Logo 指示，刷新后收起）；Tab 页首页/商品/订单/聊天/我的已接入

## 首页 service-panel

- 组件：`components/service-panel`；类名：`wxs/service-panel.wxs`；样式：`service-panel.wxss`（含 `.service-panel__col-half` 各 50%）
- Tab 数据：`normalizeTabs(SERVICE_TYPES)`，文案字段 `label`（mock 里写 `tabLabel`）
- 人物素材：`assets/home/*.png`，统一画布 **360×216**，右下对齐；`widthFix` + `--service-figure-width`（58%）
- **单 Tab 半格**（自下而上 z-index）：`tab-bg` → `figure-wrap` 人物 → `tab-label` 文案
- 人物：`right:0` 贴本格右缘；`transform-origin:100% 100%` 选中向左上放大
- 文案：`--service-tab-label-left` / `--service-tab-label-bottom`，层级高于背景、低于商品 `body`
- 商品区为**双列** `flex-wrap` + `.service-panel__cell`（**勿用 `display:grid`**，Skyline 真机不支持）
- Tab 切换：Tab 背景/圆角与 body **勿加 transition**（会闪方块）；人物仅 opacity/scale 短过渡
- 颜色在 `tokens.wxss` 的 `.theme-dark` / `.theme-light` 下分别定义 `--color-service-*`
- **深色模式**：未选 Tab 透明无底，选中/商品区深底 `#1a1d1c`、浅色字
- **浅色模式**：未选 Tab 白底，选中/商品区淡绿底 `#dfffd6`、深色字

## 商品详情页

- 价格：`price-badge` 红底黑字；其余按钮/链接用薄荷绿主题色
- 「新品」角标：`tag-new` 用点缀红；「推荐」仍用薄荷绿
- Hero 区：固定深绿渐变底 + `--color-detail-hero-title`（同 Banner 薄荷绿标题），随深浅主题微调渐变与阴影
- 正文/底栏背景、文字：随 `--color-bg`、`--color-text*` 切换

## 底部高度对齐（Tab 页 vs 详情页）

### 原生 TabBar（五个 Tab 页共用）

- 高度由微信客户端统一渲染，**各 Tab 页 TabBar 本身高度一致**
- `--tab-bar-inner-h`（100rpx）+ `--tab-bar-safe` 仅用于**非 Tab 子页**与详情底栏对齐，勿在 Tab 页重复扣减高度

### TabBar 图标与主题

| 主题 | 未选中 / 选中资源 |
|------|-------------------|
| 深色 `dark`（默认） | `assets/tab/{key}-dark.png` / `{key}-dark-active.png` |
| 浅色 `light` | `assets/tab/{key}.png` / `{key}-active.png` |

`key`：`home` · `products` · `order` · `chat` · `profile`

切换主题时 `theme.applyNativeChrome` → `tab-bar.applyTabBarIcons`（`wx.setTabBarItem`）。`app.json` 内路径与默认深色主题一致，仅作首帧占位。

深色 Tab 未选中文字色：`#B8B8B8`（`theme.js` `TAB_BAR_STYLE.dark.color`），选中仍为 `#d1ffbd`。

### Tab 页内容区底部间距（业务统一）

| 类名 | 用途 |
|------|------|
| `page-tab-bottom-gap` | 整块滚动末尾留白（仅首页 Banner+面板） |
| `page-tab-scroll-body` | 整块滚动内边距（我的） |
| `page-tab-list-inner` | 列表 scroll 内层（订单 / 聊天） |
| `product-list-scroll` `layout=tab` | 商品 Tab 右栏列表底留白 |

统一变量：`--page-content-bottom-gap`（32rpx）、`--page-pad-x`（24rpx）

### 非 Tab 页（详情 / 聊天室）

- `page-shell` 设 `subpage` → `page-root--subpage` 减去 `--tab-bar-total-h`（仅详情等需底栏对齐 TabBar 占位时用；**聊天室等 navigateTo 全屏页勿用**）
- 详情底栏：`page-footer-bar`（高度 = TabBar token）
- 滚动区：`page-scroll`；详情末尾 `page-bottom-spacer`

## 设计 Token 审计

完整对照表、字号阶梯与例外清单见 **[DESIGN_TOKENS.md](./DESIGN_TOKENS.md)**。

## 扩展

- 新增 Tab 页：注册 `page-shell`，`behaviors: require('.../themed-page')`，根节点用 `<page-shell>` 包裹
- 新增语义色 / 字号：改 `styles/theme/tokens.wxss`，勿在页面写死 hex / 散落 rpx
