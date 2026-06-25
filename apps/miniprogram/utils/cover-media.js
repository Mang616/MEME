/**
 * 商品封面 / Banner 占位：渐变底 + 图片加载态字段
 */
const DEFAULT_COVER_COLOR = '#2d4a35'

const COVER_MEDIA_RESET = {
  coverImageReady: false,
  coverLoadFailed: false,
}

function buildCoverGradientStyle(color) {
  const c = color || DEFAULT_COVER_COLOR
  return `background: linear-gradient(135deg, #1a2a1f 0%, ${c} 52%, #1e3a28 100%);`
}

function hasCoverSrc(src) {
  return !!String(src || '').trim()
}

/** 首页 Banner 与封面组件共用的图片加载视图字段 */
function enrichCoverMedia(raw = {}, options = {}) {
  const imageKey = options.imageKey || 'image'
  const colorKey = options.colorKey || 'bgColor'
  const image = String(raw[imageKey] || '').trim()
  const bgColor = raw[colorKey] || DEFAULT_COVER_COLOR

  return {
    image,
    bgColor,
    fallbackStyle: buildCoverGradientStyle(bgColor),
    hasImage: hasCoverSrc(image),
    showImage: false,
  }
}

module.exports = {
  DEFAULT_COVER_COLOR,
  COVER_MEDIA_RESET,
  buildCoverGradientStyle,
  hasCoverSrc,
  enrichCoverMedia,
}
