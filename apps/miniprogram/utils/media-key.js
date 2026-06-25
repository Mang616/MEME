/**
 * 网络图稳定标识：用于判断「是否同一张图」，与签名 query / 缓存参数无关
 */

function resolveMediaKey(src) {
  const raw = String(src ?? '').trim()
  if (!raw) return ''

  if (raw.startsWith('cos:')) return raw
  if (raw.startsWith('meme/') || raw.startsWith('images/')) {
    return raw.startsWith('cos:') ? raw : `cos:${raw}`
  }
  if (raw.startsWith('/assets/') || raw.startsWith('data:')) return raw

  const withoutQuery = raw.split('?')[0].split('#')[0]
  try {
    const url = new URL(withoutQuery)
    return url.pathname || withoutQuery
  } catch {
    return withoutQuery
  }
}

/** 标识 + 版本号：换图（同路径覆盖）时 rev 变化，触发重新加载 */
function resolveMediaIdentity(src, rev) {
  const key = resolveMediaKey(src)
  if (!key) return ''
  const n = parseInt(rev, 10)
  if (Number.isNaN(n) || n <= 0) return key
  return `${key}@${n}`
}

function appendMediaCacheBuster(src, rev) {
  const raw = String(src ?? '').trim()
  if (!raw) return ''
  const n = parseInt(rev, 10)
  if (Number.isNaN(n) || n <= 0) return raw
  const sep = raw.includes('?') ? '&' : '?'
  return `${raw}${sep}v=${n}`
}

module.exports = {
  resolveMediaKey,
  resolveMediaIdentity,
  appendMediaCacheBuster,
}
