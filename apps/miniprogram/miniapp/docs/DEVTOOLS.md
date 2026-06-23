# 微信开发者工具常见问题

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

本地自检：`du -sh miniapp` 宜 **&lt; 2MB**（当前工程约 2MB 内）。

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
   必须打开 **`miniapp/`**，不要打开上一级 `Esports/`。

2. **编译缓存与 `app.json` 不一致**  
   改过页面路径或删过页面后，工具仍按旧 `app.json` 找文件（例如仍找 `bind-phone` 而磁盘已改名）。

3. **热重载未刷新页面列表**  
   `project.private.config.json` 里 `compileHotReLoad: true` 时，偶发新页面未纳入编译。

**处理步骤**（建议按顺序做一遍）：

1. 确认 `app.json` 的 `pages` 里路径与磁盘文件夹一致。  
2. **工具 → 清缓存 → 勾选「清除文件缓存」和「清除编译缓存」** → 确定。  
3. 点击 **编译**（或重新打开项目）。  
4. 仍失败：**关闭项目 → 重新导入 `miniapp` 目录**（不要导入 `Esports`）。  
5. 仍失败：删除本机该项目的编译缓存目录后重开（macOS 一般在  
   `~/Library/Application Support/微信开发者工具/` 下对应项目 hash 目录）。

**本地自检**（在 `miniapp/` 下执行）：

```bash
node ../scripts/verify-miniapp-pages.js
```

若有 `MISSING` 输出，说明 `app.json` 登记了不存在的页面，需补文件或改配置。

## 新增子页建议

- 在 `app.json` 的 `pages` **末尾**追加路径（与 `login`、`legal` 一致）。  
- 四件套齐全：`index.js` / `index.json` / `index.wxml` / `index.wxss`。  
- 改路径时**不要只改一半**：`app.json`、`constants.js`、跳转 URL 保持一致。  
- 大改路径后务必 **清编译缓存** 再测。
