/**
 * Skyline 对包内 WebP 支持不稳定，本地静态图统一走 PNG。
 * 网络图（COS / https）保持原样。
 */
function resolveLocalImage(src) {
  const raw = String(src ?? '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw) || raw.startsWith('cos:') || raw.startsWith('data:')) {
    return raw
  }
  if (/\.webp$/i.test(raw)) {
    return raw.replace(/\.webp$/i, '.png')
  }
  return raw
}

module.exports = {
  resolveLocalImage,
}
