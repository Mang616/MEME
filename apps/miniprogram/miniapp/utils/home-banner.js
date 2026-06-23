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

module.exports = {
  enrichBanners,
  buildHomeBannerMeta,
  markBannerImageReady,
  markBannerImageFailed,
}
