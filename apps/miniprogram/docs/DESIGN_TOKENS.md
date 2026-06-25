# 设计 Token 规范与一致性审计

> 单一事实来源：`styles/theme/tokens.wxss` + `styles/theme/components.wxss`  
> 主题切换：`utils/theme.js` 与 `.theme-dark` / `.theme-light`

## 结论（是否有统一标准）

**有统一标准，但执行程度不均：**

| 维度 | 统一程度 | 说明 |
|------|----------|------|
| **语义色** | 高 | 背景/文字/边框/主色/点缀在 `tokens.wxss`，业务组件多数用 `var(--color-*)` |
| **圆角 / 间距** | 中高 | `--radius-*`、`--page-pad-x`、`--page-content-bottom-gap` 等已集中 |
| **字号 / 字重** | 中 | 根字号 28rpx；各页仍有 20–64rpx 散落写法，已补充 `--font-size-*` 待逐步替换 |
| **字体族** | 中 | 价格与首页 Tab 大标题用 `--font-display`；正文多为系统默认 |
| **写死 hex** | 低～中 | 见下文「例外清单」，多为品牌固定或装饰渐变 |

---

## 配色标准

### 语义角色（必用变量）

| 角色 | 变量 | 深色典型值 | 浅色典型值 |
|------|------|------------|------------|
| 页面底 | `--color-bg` | `#000` | `#fff` |
| 卡片底 | `--color-card` | `#141414` | `#f7f8f7` |
| 主文字 | `--color-text` | 白 | `#111` |
| 次要文字 | `--color-text-secondary` | 68% 白 | 55% 黑 |
| 弱化文字 | `--color-text-muted` | 42% 白 | 38% 黑 |
| 品牌薄荷绿 | `--color-mint` / `--color-primary` | `#d1ffbd` | 同左（主色不随主题变） |
| 价格文字色 | `--color-price` | 薄荷绿 | 深绿 `#5a9e47` |
| 点缀红 | `--color-accent` | `#ff3b30` | 同左 |
| 边框 | `--color-border` | 薄荷绿 12% | 深绿 22% |

### 使用约定

- **薄荷绿**：按钮、选中、链接、Tab 指示条、推荐角标（`tag-recommend`）
- **红色**：仅 `price-badge` 底 + `tag-new`（新品）
- **Hero / Banner 标题**：`--color-banner-title`（固定薄荷绿，叠在深底图上）
- **勿**在页面 wxss 新增 hex；新语义色先加 token

### 已知例外（可保留）

| 位置 | 写法 | 原因 |
|------|------|------|
| `price-display.wxss` | 红底 `#000` 字 | 品牌价格标签规范 |
| `home/index.wxss` | Banner 无图时的装饰渐变 | 纯装饰，非主题语义 |
| API 商品数据 `coverColor` | 占位色字段 | 服务端商品快照，非 UI token |
| `utils/mock/*.js` | 装饰色等 | 展示类 mock，非 UI token |
| `layout.wxss` `page` | `#000` | `page` 节点在 `.theme-scope` 外，减轻切主题闪屏 |
| `navigation-bar` | `12px` / `17px` | 微信导航栏组件惯例用 px |

---

## 字体标准

### 字体族

| 用途 | 变量 |
|------|------|
| 价格、首页护航/陪玩 Tab 文案 | `--font-display`（DIN Alternate → 系统） |
| 正文、列表、订单 | 继承 `.theme-scope` 默认（系统黑体） |

`PriceItalic` 字库过大时已跳过 `loadFontFace`，价格区靠 `font-style: italic` + `--font-display`。

### 字号阶梯（`tokens.wxss`）

| 变量 | 默认 | 建议用途 |
|------|------|----------|
| `--font-size-xs` | 20rpx | 角标、弱化标签 |
| `--font-size-sm` | 22rpx | 辅助说明、已售 |
| `--font-size-md` | 24rpx | 元信息、hint |
| `--font-size-base` | 28rpx | 正文、按钮、列表主文案 |
| `--font-size-lg` | 30rpx | 搜索框、输入框 |
| `--font-size-xl` | 34rpx | 昵称、区块标题 |
| `--font-size-2xl` | 40rpx | Banner 标题 |
| `--font-size-display` | 44rpx | service-panel Tab 文案 |

字重：`--font-weight-medium` (500)、`--font-weight-semibold` (600)、`--font-weight-bold` (700)。

### 尚未完全统一的页面

以下文件仍含**局部** `font-size: XXrpx`，后续可改为上表变量：

- `order-card`、`product-detail`、`profile`、`chat-room`、`service-panel`（除已用 token 部分）

---

## 主题与原生壳层

`utils/theme.js` 中 `THEME_TOKENS` / `TAB_BAR_STYLE` 必须与 `tokens.wxss` 保持一致：

| 模式 | 导航栏字色 | 窗口底 | Tab 选中色 |
|------|------------|--------|------------|
| dark | `#fff` / `#000` 底 | `#000` | `#d1ffbd` |
| light | `#111` / `#fff` 底 | `#fff` | `#6db85a` |

---

## 扩展检查清单

新增 UI 时自检：

1. 颜色是否全部来自 `var(--color-*)` 或 `components.wxss` 工具类？
2. 字号是否优先 `--font-size-*`？
3. 红/绿是否只用在意图位置（价格标签 vs 主按钮）？
4. 深浅主题下是否各测一遍？

详见 [THEME.md](./THEME.md)、[ARCHITECTURE.md](./ARCHITECTURE.md)。
