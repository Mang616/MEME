#!/usr/bin/env bash
# 将 Esports 小程序同步到已克隆的 MEME 仓库 apps/miniprogram/
# 用法：
#   cd /Users/mang/Documents/GanSa/Project
#   git clone https://github.com/Mang616/MEME.git
#   bash Esports/scripts/sync-to-meme-repo.sh /Users/mang/Documents/GanSa/Project/MEME

set -euo pipefail

MEME_ROOT="${1:-}"
ESPORTS_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if [[ -z "$MEME_ROOT" ]]; then
  echo "用法: bash scripts/sync-to-meme-repo.sh <MEME 仓库根目录>"
  echo "示例: bash scripts/sync-to-meme-repo.sh ../MEME"
  exit 1
fi

MEME_ROOT="$(cd "$MEME_ROOT" && pwd)"
MINI_TARGET="$MEME_ROOT/apps/miniprogram"

if [[ ! -d "$MEME_ROOT/.git" ]]; then
  echo "错误: $MEME_ROOT 不是 git 仓库，请先 git clone"
  exit 1
fi

mkdir -p "$MINI_TARGET" "$MEME_ROOT/scripts"

echo "→ 同步 miniapp → apps/miniprogram/"
rsync -a --delete \
  --exclude '.DS_Store' \
  --exclude 'assets/home/Library/' \
  "$ESPORTS_ROOT/miniapp/" "$MINI_TARGET/"

echo "→ 同步开发脚本 → scripts/"
rsync -a \
  "$ESPORTS_ROOT/scripts/verify-miniapp-pages.js" \
  "$ESPORTS_ROOT/scripts/resolve-miniprogram-root.js" \
  "$MEME_ROOT/scripts/"

if [[ -d "$ESPORTS_ROOT/server" ]]; then
  echo "→ 同步 server/（若 MEME 尚无后端目录）"
  rsync -a "$ESPORTS_ROOT/server/" "$MEME_ROOT/server/"
fi

# MEME .gitignore 补充小程序缓存路径
GITIGNORE="$MEME_ROOT/.gitignore"
MARKER="apps/miniprogram/assets/home/Library"
if [[ -f "$GITIGNORE" ]] && ! grep -qF "$MARKER" "$GITIGNORE" 2>/dev/null; then
  echo "" >> "$GITIGNORE"
  echo "# miniprogram 误提交缓存" >> "$GITIGNORE"
  echo "apps/miniprogram/assets/home/Library/" >> "$GITIGNORE"
fi

echo ""
echo "完成。下一步："
echo "  cd \"$MEME_ROOT\""
echo "  git status"
echo "  git add apps/miniprogram scripts server .gitignore 2>/dev/null || git add apps/miniprogram scripts .gitignore"
echo "  git commit -m \"feat(miniprogram): 接入迷因电竞小程序\""
echo "  git push origin main"
