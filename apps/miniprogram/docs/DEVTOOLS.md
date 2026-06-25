# 微信开发者工具常见问题

## 主包体积建议 &lt; 1.5MB

微信开发者工具会提示「主包尺寸应小于 1.5MB」（上传硬上限仍为 **2MB**）。

**常见占用**：`assets/` 图片。大图已转为 **WebP**；勿再放未压缩 PNG。新增素材建议：

| 用途 | 建议 |
|------|------|
| 头像 / 图标 | WebP 或 PNG &lt; 80KB，边长 ≤ 256px |
| 首页人物 | WebP，画布约 360×216 |
| Tab 图标 | 81×81，&lt; 10KB |
| 自定义字体 | 避免打入主包（&gt;48KB 易 timeout） |

本地自检（不含 `docs/`，与打包忽略规则接近）：

```bash
cd apps/miniprogram && du -sh assets pages components utils styles
```

若仍超限：**详情 → 代码依赖分析** 定位大文件；低频页面可拆 **分包**。

---

## 本地图片不显示 /「图全没了」

**现象**：Logo、首页人物、头像、等级图标等空白；Tab 图标可能仍正常。

**常见原因**（按频率）：

1. **`ignoreDevUnusedFiles` 过滤了静态资源**  
   开发者工具默认会剔除「无依赖」文件。本项目大量图片路径写在 **JS 常量**里（如 `brandLogo`、`/assets/level/3.webp`），再经 `{{变量}}` 绑到 `<image>`，静态分析**追踪不到**，模拟器/预览包里就没有这些文件。  
   **处理**：`project.config.json` 已设 `ignoreDevUnusedFiles: false`、`ignoreUploadUnusedFiles: false`，并用 `packOptions.include` 强制打入 `assets/`。改完后 **清编译缓存 → 重新编译**（必要时重启开发者工具）。

2. **`assets/` 未纳入 Git**  
   若本机 `apps/miniprogram/assets/` 为空或未从仓库拉取，磁盘上无图则一定不显示。自检：  
   `ls apps/miniprogram/assets/brand/logo.png`  
   上线前需将 `assets/` 提交进仓库（勿提交 `assets/home/Library/`）。

3. **Banner / 商品封面本身无图**  
   `utils/mock/banners.js` 与 `server` 种子数据里 `image` / `cover` 多为空字符串，界面只显示**绿色渐变占位**，不是加载失败。

4. **WebP 在 Skyline 下本地图不显示**  
   网络图（Banner COS 等）可为 WebP；**包内静态图**请用 PNG。已提供 `utils/local-image.js` 自动把 `/assets/...webp` 映射为 `.png`，新增 WebP 后执行 `npm run miniprogram:assets-png` 生成 PNG。  
   `service-panel` 人物区用 `clip-path` 实现向上「突出」效果（原设计）；Skyline 控制台可能提示不支持，但视觉效果以此为准。图片请用 PNG（见上条）。

**勿**把 `assets/` 放进 `packOptions.ignore`（与 `miniapp/icons` 不同），否则模拟器会提示「文件已被配置忽略打包上传，模拟器无法获取」。

---

## 多端应用 · iOS IPA 签名失败（Apple ID）

### 错误 `[1008] 苹果账号或密码错误`

日志里若出现 `Init the sign environment for 17520471207` 这类**纯手机号**，需改为带区号格式，例如：

- `+8617520471207`，或
- 弹窗提示里的 `+86` 前缀 + 手机号

填的是 **iPhone 上登录的 Apple ID**（免费账号即可做临时签名），不是微信账号，也不是付费开发者账号（除非你用证书签名）。

### 账号密码存在哪？能改配置文件吗？

弹窗里写的「**外部开源签名插件**」即微信内置的 **MiniAppBuilder**（与开源项目 [ipa-mac-builder](https://github.com/yujon/ipa-mac-builder) 同源；你本机路径示例：`…/WeappMiniApp/miniapp-builder/0.1.30/MiniAppBuilder`）。账密由该程序按 **AppID** 缓存在本机，微信不上传服务器。

**不能**在项目仓库 `apps/miniprogram/` 里改，也**没有**可手改的明文密码文件。

相关本地目录（`{hash}` 为工具为当前登录用户生成的目录名，你本机示例为 `50a7d9210159a32f006158795f893857`）：

| 路径 | 内容 |
|------|------|
| `~/Library/Application Support/微信开发者工具/{hash}/WeappMiniApp/miniapp-builder/` | `MiniAppBuilder` 签名程序 |
| `~/Library/Application Support/微信开发者工具/{hash}/WeappLocalData/localstorage_*.json` | 项目本地配置（含 `signCertificateInfo`，仅签名**类型**，不含密码） |
| `~/Library/Application Support/微信开发者工具/{hash}/WeappMiniApp/v2-ipa/` | IPA 构建中间产物 |

### 如何重新输入账号密码（推荐）

1. **完全退出**微信开发者工具  
2. 菜单：**工具 → 清除缓存 → 清除签名缓存 → 清除 iOS 临时签名缓存**（仍无效可点「全部清除」）  
3. 重新打开项目，USB 连接 iPhone，再点 **运行 / 构建 IPA**  
4. 在弹窗中重新输入 Apple ID（手机号带 `+86`）和密码；可选「记住账号密码（只保存于本地）」

命令行也可清除该 AppID 的缓存 Apple ID（需先关掉正在构建的工具）：

```bash
"/Users/mang/Library/Application Support/微信开发者工具/{hash}/WeappMiniApp/miniapp-builder/0.1.30/MiniAppBuilder" \
  --action clear --appid wx9ddbc3532880cf6d
```

成功时会输出 `clearAppleId succeed`，下次构建会再次弹出账号密码框。

### 多端 App 图标与页面 Logo

**两类图标不要混用：**

| 类型 | 配置位置 | 说明 |
|------|----------|------|
| **桌面 App 图标**（IPA/APK 安装后） | `project.miniapp.json` → `mini-ios.icons` / `mini-android.icons` | 由 `miniapp/icons/` 下各尺寸 PNG 提供 |
| **小程序内品牌 Logo**（导航栏、登录页、下拉刷新） | `utils/config.js` → `brandLogo`（`/assets/brand/logo.png`） | 页面 `<image>` 引用 |
| **微信搜索/分享头像** | [微信公众平台](https://mp.weixin.qq.com/) → 设置 → 基本设置 → 小程序头像 | **不在代码库**，需后台单独上传 |

**生成 / 更新图标**（从 `assets/brand/logo.webp` 一键导出 iOS、Android 全尺寸 + 页面用 `logo.png`）：

```bash
npm run miniprogram:icons
```

输出目录：`apps/miniprogram/miniapp/icons/`（约 1.5MB，已在 `project.config.json` 的 `packOptions.ignore` 中排除，**不计入主包**，多端构建仍从磁盘读取）。

**「更新 App 图标可能不生效」**：开发者工具会**缓存图标构建结果**。改图标或 `project.miniapp.json` 后建议：

1. **工具 → 清缓存 → 清除编译缓存**（必要时勾选「全部清除」）  
2. 重新 **构建 IPA/APK**，或使用 **远程构建** 验证图标是否生效  
3. 确认 `project.miniapp.json` 里各 `icons` 路径非空且文件存在（勿留 `""`）

页面 Logo 若空白：优先使用 **PNG**（部分 Skyline / 真机对 WebP 的 `<image>` 支持不稳定）；改 `logo.webp` 后请重新执行 `npm run miniprogram:icons` 同步 `logo.png`。

### 其他日志说明

- **更新 App 图标可能不生效**：见上文「多端 App 图标与页面 Logo」；清缓存后重编或远程构建验证。
- **SharedArrayBuffer / Skyline**：见下文，与 IPA 签名无关。

官方说明：[运行于真机](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/miniapp/handbook/test/device.html)、[iOS 证书配置](https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/miniapp/handbook/certificate/ios.html)

---

## Skyline 打开后全页空白（只有顶栏 / 纯黑屏）

**现象**：模拟器已开 Skyline，所有 Tab 页、子页都看不到列表/卡片，像「没内容」；有时只剩自定义导航栏。

**最常见原因**（按顺序排查）：

1. **多端模式**（`project.config.json` 里 `"projectArchitecture": "multiPlatform"`）  
   日志里若出现 `wxext…` 扩展 ID，说明在用多端模拟器，对 **glass-easel + Skyline** 支持不完整，页面常会整页空白。  
   **处理**：日常开发请用 **普通小程序项目** 打开 `apps/miniprogram/`（不要用「多端应用」入口）；IPA/APK 打包再切多端。

2. **`scroll-view` 在 Skyline 下必须有明确高度**（主因）  
   旧方案用 `flex:1 + height:0`，或 `enableScrollViewAutoSize`——后者在 **基础库 3.6.x 开发者工具里会报 invalid 且不生效**。  
   **现方案**：`utils/page-layout.js` 用 `wx.getWindowInfo()` 算出 `--page-body-h`（px），由 `page-shell` 注入，各 `scroll-view` 设 `height:100%`。  
   改完后：**清缓存 → 重新编译**。

3. **未开 Skyline 调试**  
   **详情 → 本地设置 → 开启 Skyline 渲染调试**（`project.private.config.json` 里 `skylineRenderEnable: true`）。

4. **基础库过低**  
   调试基础库建议 ≥ **3.0.1**（当前 `libVersion`: 3.16.1）。

5. **临时联调**  
   模拟器右上角渲染模式切 **WebView**，可验证业务/API 是否正常（上线仍以 Skyline 真机为准）。

---

## Skyline / 控制台告警

### `无效的 app.json rendererOptions.skyline[...]`

**原因**：新版开发者工具对 `app.json` 里部分 Skyline 字段的 schema 校验滞后（[社区讨论](https://developers.weixin.qq.com/community/develop/doc/0006829bdd46d8caeb545b87966800)）。**不要**写 `enableScrollViewAutoSize`（3.6.x 会报 invalid 且不生效）；滚动区高度改由 `page-layout.js` 注入 `--page-body-h`。

**请同时确认**：

1. **详情 → 本地设置 → 开启 Skyline 渲染调试**（与 `app.json` 中 `"renderer": "skyline"` 一致；`project.private.config.json` 已设 `skylineRenderEnable: true`）。
2. **调试基础库** 建议 ≥ 3.0.1（`project.config.json` 的 `libVersion` 或工具内切换）。

### `No any glass-easel component configs found` / 不支持 glass-easel

**原因**：`app.json` 使用 `"componentFramework": "glass-easel"`（Skyline 必需），但当前运行环境不支持：

- 开发者工具版本过低（需 **≥ 1.06.2308142**）；或
- 处于 **多端模式**（日志里带 `wxext…` 扩展 ID）——多端模拟器对 glass-easel / Skyline 支持不完整。

**处理**：

1. 开发小程序本体时，用 **普通小程序模式** 打开 `apps/miniprogram/`，不要切「多端模式」。
2. 升级微信开发者工具到最新稳定版。
3. 清缓存后重新编译；仍失败可暂时在模拟器右上角将渲染模式切为 **WebView** 做功能联调（样式以 Skyline 真机为准）。

### `module 'utils/api.js' is not defined`

微信 `require` **不会**把 `require('./utils/api')` 解析为 `utils/api/index.js`。请写全路径，例如 `require('./utils/api/index')`、`require('../../utils/api/index')`、`require('./api/index')`。

### `需要保证页面[pages/index/index]同时在两种渲染模式下…`

这是工具自带的通用提示，示例页名为 `pages/index/index`。本项目首页为 **`pages/home/index`**，可忽略或点「不再提示」。

### `SharedArrayBuffer will require cross-origin isolation…`

Chrome / 开发者工具内核的弃用提示，与业务代码无关，可忽略。

### `getSystemInfo API 提示`（HarmonyOS）

基础库 3.7.0+ 建议用 `wx.getDeviceInfo()` 做平台判断；当前为文档推荐，非报错。

### 未设置「线上最低基础库版本」

本地调试不受影响。若已充分验证 Skyline，可在 [小程序后台](https://mp.weixin.qq.com/) → **设置 → 基本设置 → 基础库最低版本设置** 设为 **3.0.1** 或以上，减少低版本回退 WebView 的情况。

---

## `source size exceed max limit 2MB`（错误码 80051）

**现象**：真机调试 / 预览 / 上传时提示源码包超过 **2MB**（主包上限）。

**常见原因**：`assets/` 里图片过大（未压缩的 PNG/JPG）。本项目曾有两张默认头像各约 **2.8MB**（1254×1254），单独就超限。

**建议体积**（页面内展示）：

| 用途 | 建议尺寸 | 单文件 |
|------|----------|--------|
| 默认头像 | 256×256 | &lt; 80KB |
| 品牌 Logo | 400×400 | &lt; 120KB |
| Banner | 宽 1200px 内，JPEG 质量 80 | &lt; 200KB |
| Tab 图标 | 81×81 | &lt; 10KB |

macOS 可用 `sips -Z 256 图片.png` 等命令缩放；上线前用开发者工具 **详情 → 代码依赖分析** 查看体积。

本地自检：在 `apps/miniprogram/` 下执行 `du -sh .`，宜 **< 2MB**。

---

## service-panel 真机样式

- Tab 背景勿用 `inset:0`，用 `left/right/top/bottom:0`；背景/圆角切换勿 `transition`（会闪方块）
- Tab 文案色写在 `.service-panel__tab-label` 上，勿依赖 `color:inherit`（Skyline 真机不刷新）
- 导航栏高度：`--nav-total-h = --nav-safe-top + --nav-bar-h`；勿在 inner 与 center 重复 `padding-top`
- 下拉刷新用 `pull-refresh-scroll`：组件须设 `:host { flex:1; min-height:0 }`，内部 scroll **勿**再叠 `page-scroll`（会 height:0 塌缩）
- 人物在各自 Tab 内 `figure-wrap`，`right:0` 贴本格右缘；`clip-path: inset(-bleed 0 0 0)` 上探；勿 `translateX` 越过邻格
- 详见 THEME.md「首页 service-panel」

---

## `WXML file not found: ./pages/xxx/index.wxml`

**现象**：磁盘上文件存在，但编译报找不到 WXML，常伴随 `__route__ is not defined`。

**常见原因**（按频率）：

1. **项目根目录选错**  
   必须打开 **`apps/miniprogram/`**，不要打开 monorepo 根目录。

2. **编译缓存与 `app.json` 不一致**  
   改过页面路径或删过页面后，工具仍按旧 `app.json` 找文件（例如仍找 `bind-phone` 而磁盘已改名）。

3. **热重载未刷新页面列表**  
   `project.private.config.json` 里 `compileHotReLoad: true` 时，偶发新页面未纳入编译。

**处理步骤**（建议按顺序做一遍）：

1. 确认 `app.json` 的 `pages` 里路径与磁盘文件夹一致。  
2. **工具 → 清缓存 → 勾选「清除文件缓存」和「清除编译缓存」** → 确定。  
3. 点击 **编译**（或重新打开项目）。  
4. 仍失败：**关闭项目 → 重新导入 `apps/miniprogram/` 目录**（不要导入 monorepo 根目录）。  
5. 仍失败：删除本机该项目的编译缓存目录后重开（macOS 一般在  
   `~/Library/Application Support/微信开发者工具/` 下对应项目 hash 目录）。

**页面校验**（在 monorepo 根目录）：

```bash
npm run miniprogram:verify
```

## 新增子页建议

- 在 `app.json` 的 `pages` **末尾**追加路径（与 `login`、`legal` 一致）。  
- 四件套齐全：`index.js` / `index.json` / `index.wxml` / `index.wxss`。  
- 改路径时**不要只改一半**：`app.json`、`constants.js`、跳转 URL 保持一致。  
- 大改路径后务必 **清编译缓存** 再测。
