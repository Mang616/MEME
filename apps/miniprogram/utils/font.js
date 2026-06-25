/**
 * 价格展示字体：包内 ttf 已移除以控制主包体积，统一用 CSS 斜体 + 系统字体（见 price-badge）
 */

const FONT_FAMILY = 'PriceItalic'

function loadPriceFont() {
  return Promise.resolve()
}

function scheduleLoadPriceFont() {}

module.exports = {
  loadPriceFont,
  scheduleLoadPriceFont,
  FONT_FAMILY,
}
