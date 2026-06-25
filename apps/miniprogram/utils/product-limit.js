/**
 * 商品限购文案与数量上限（列表 / 详情 / 下单页共用）
 */

const DEFAULT_MAX_QTY = 99

/** @param {number} limitPerUser */
function formatLimitText(limitPerUser) {
  const limit = Number(limitPerUser) || 0
  return limit > 0 ? `每人限购 ${limit} 单` : ''
}

/** @param {number} limitPerUser */
function getMaxPurchaseQty(limitPerUser) {
  const limit = Number(limitPerUser) || 0
  return limit > 0 ? limit : DEFAULT_MAX_QTY
}

module.exports = {
  DEFAULT_MAX_QTY,
  formatLimitText,
  getMaxPurchaseQty,
}
