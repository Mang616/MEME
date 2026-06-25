#!/usr/bin/env bash
# 从 assets/brand/logo.webp 生成多端 App 图标（iOS / Android）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/assets/brand/logo.webp"
OUT="$ROOT/miniapp/icons"
MASTER="$(mktemp /tmp/meme-logo-master.XXXXXX.png)"

if [[ ! -f "$SRC" ]]; then
  echo "missing: $SRC" >&2
  exit 1
fi

mkdir -p "$OUT/ios" "$OUT/android" "$OUT/splash"
sips -s format png "$SRC" --out "$MASTER" >/dev/null

ios_size() {
  local size="$1" name="$2"
  sips -z "$size" "$size" "$MASTER" --out "$OUT/ios/${name}.png" >/dev/null
}

android_size() {
  local size="$1" name="$2"
  sips -z "$size" "$size" "$MASTER" --out "$OUT/android/${name}.png" >/dev/null
}

ios_size 120 mainIcon120
ios_size 180 mainIcon180
ios_size 80 spotlightIcon80
ios_size 120 spotlightIcon120
ios_size 58 settingsIcon58
ios_size 87 settingsIcon87
ios_size 40 notificationIcon40
ios_size 60 notificationIcon60
ios_size 1024 appStore1024

android_size 72 hdpi
android_size 96 xhdpi
android_size 144 xxhdpi
android_size 192 xxxhdpi

sips -z 1024 1024 "$MASTER" --out "$OUT/splash/ios-splash.png" >/dev/null
cp "$OUT/android/xxhdpi.png" "$OUT/splash/android-xxhdpi.png"

# 页面内 Logo 用 PNG（兼容性优于 webp）
sips -s format png -z 288 288 "$SRC" --out "$ROOT/assets/brand/logo.png" >/dev/null

rm -f "$MASTER"
echo "OK: icons -> $OUT"
du -sh "$OUT" "$ROOT/assets/brand/logo.png"
