/**
 * 首页 Banner 视图模型（单张/多张 swiper 配置 + 图片加载态）
 */
const { BANNERS } = require('./mock/banners')
const {
  DEFAULT_COVER_COLOR,
  buildCoverGradientStyle,
  hasCoverSrc,
} = require('./cover-media')

function enrichBanner(raw, index) {
  const image = String(raw.image || '').trim()
  const bgColor = raw.bgColor || DEFAULT_COVER_COLOR

  return {
    ...raw,
    index,
    image,
    bgColor,
    fallbackStyle: buildCoverGradientStyle(bgColor),
    hasImage: hasCoverSrc(image),
    showImage: false,
    showPhoto: false,
  }
}

function enrichBanners(list = BANNERS) {
  return (list || []).map(enrichBanner)
}

/** 单张不轮播、不显示指示点；多张开启 autoplay / circular */
function buildHomeBannerMeta(banners) {
  const count = (banners || []).length
  const multi = count > 1
  return {
    bannerCount: count,
    bannerShowDots: multi,
    bannerAutoplay: multi,
    bannerCircular: multi,
  }
}

function patchBannerById(banners, id, patch) {
  return (banners || []).map((item) =>
    item.id === id ? { ...item, ...patch } : item,
  )
}

function markBannerImageReady(banners, id) {
  return patchBannerById(banners, id, { showImage: true, showPhoto: true })
}

function markBannerImageFailed(banners, id) {
  return patchBannerById(banners, id, { showImage: false, showPhoto: false })
}

/** 合并 swiper 配置与 enrich 后的 banners，供 setData 使用 */
function buildHomeBannerState(list) {
  const banners = enrichBanners(list)
  return { ...buildHomeBannerMeta(banners), banners }
}

/** API 优先，失败回退 mock；force 时跳过 ensure 缓存（下拉刷新） */
async function loadHomeBanners(api, { force = false } = {}) {
  try {
    if (force) await api.refreshBanners()
    else await api.ensureBanners()
    const items = api.getBanners()
    if (items && items.length) return items
  } catch (err) {
    console.warn('[home] banners fallback to mock', err.message)
  }
  return BANNERS
}

module.exports = {
  enrichBanners,
  buildHomeBannerMeta,
  buildHomeBannerState,
  loadHomeBanners,
  markBannerImageReady,
  markBannerImageFailed,
}
