#!/usr/bin/env bash
# 将 assets 下 WebP 转为同名 PNG（Skyline 本地图优先用 PNG）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
count=0

while IFS= read -r -d '' src; do
  out="${src%.webp}.png"
  sips -s format png "$src" --out "$out" >/dev/null
  count=$((count + 1))
done < <(find "$ROOT/assets" -name '*.webp' -print0)

echo "OK: converted $count webp -> png under $ROOT/assets"
