/**
 * 接口不可用时的本地兜底数据（Banner 等）
 */
const { BANNERS } = require('./mock/banners')

const FALLBACK_BANNERS = BANNERS.map((item) => ({ ...item }))

function cloneFallbackBanners() {
  return FALLBACK_BANNERS.map((item) => ({ ...item }))
}

/** 接口返回空列表时使用本地 Banner */
function resolveBanners(list) {
  const items = Array.isArray(list) ? list : []
  return items.length ? items : FALLBACK_BANNERS
}

module.exports = {
  FALLBACK_BANNERS,
  cloneFallbackBanners,
  resolveBanners,
}
