/**
 * 商品封面 / Banner 占位：绿色渐变底，避免加载前黑屏
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

module.exports = {
  DEFAULT_COVER_COLOR,
  COVER_MEDIA_RESET,
  buildCoverGradientStyle,
  hasCoverSrc,
}
