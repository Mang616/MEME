# 提交到 GitHub（Mang616/MEME）

产品名：**迷因电竞**。代码应进入 monorepo 的 **`apps/miniprogram/`**，不是仓库根下的 `miniapp/`。

远程仓库：<https://github.com/Mang616/MEME>

---

## 一、前置条件

1. 本机已安装 Git
2. 已登录 GitHub（SSH 或 HTTPS + Personal Access Token）
3. 对 `Mang616/MEME` 有 **push** 权限

检查登录：

```bash
git --version
ssh -T git@github.com    # 若使用 SSH
```

---

## 二、推荐流程（接入 MEME monorepo）

### 1. 克隆远程仓库

```bash
cd /Users/mang/Documents/GanSa/Project
git clone https://github.com/Mang616/MEME.git
# 或 SSH：git clone git@github.com:Mang616/MEME.git
```

### 2. 同步当前 Esports 代码

```bash
bash Esports/scripts/sync-to-meme-repo.sh MEME
```

脚本会把 `Esports/miniapp/` → `MEME/apps/miniprogram/`，并复制校验脚本到 `MEME/scripts/`。

### 3. 检查变更

```bash
cd MEME
git status
node scripts/verify-miniapp-pages.js
```

### 4. 提交并推送

```bash
git add apps/miniprogram scripts .gitignore
# 若同步了 server：git add server
git commit -m "feat(miniprogram): 接入迷因电竞小程序"
git push origin main
```

### 5. 微信开发者工具

以后打开目录改为：

```
MEME/apps/miniprogram/
```

---

## 三、目录对照

| 本地 Esports | MEME 仓库 |
|--------------|-----------|
| `miniapp/` | `apps/miniprogram/` |
| `scripts/verify-*.js` | `scripts/` |
| `server/` | `server/`（可选，MEME 原仓库暂无） |

---

## 四、日常开发

```bash
cd MEME
# 改 apps/miniprogram/ 下代码
git add apps/miniprogram
git commit -m "fix: 描述本次修改"
git push
```

---

## 五、常见问题

**clone 超时 / 443 连不上**  
检查网络或代理，或改用 SSH 地址克隆。

**push 被拒绝**  
确认 GitHub 账号有仓库写权限；若远程已有新提交，先 `git pull --rebase origin main` 再 push。

**不要**在 MEME 根目录再建 `miniapp/`，小程序代码只放 `apps/miniprogram/`。
