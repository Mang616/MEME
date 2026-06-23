/**
 * 商品详情页数据组装
 */
const { getProductDetail } = require('./mock/products')
const { getReviewPreview } = require('./mock/product-reviews')
const { getIntroNodes } = require('./mock/product-intros')
const { formatCount, formatPriceDisplay, tagClass, userInitial } = require('./format')
const { formatLimitText } = require('./product-limit')

function buildProductDetailState(productId) {
  const raw = getProductDetail(productId)
  if (!raw) {
    return {
      product: null,
      latestReviews: [],
      hasMoreReviews: false,
      showReviewsBlock: false,
    }
  }

  const { latest, hasMore } = getReviewPreview(productId, raw.reviewCount)
  const showReviewsBlock = raw.reviewCount > 0 || latest.length > 0

  return {
    product: {
      ...raw,
      priceDisplay: formatPriceDisplay(raw.price),
      soldText: formatCount(raw.sold),
      viewsText: formatCount(raw.views),
      limitText: formatLimitText(raw.limitPerUser),
      tagClass: raw.tag ? tagClass(raw.tag) : '',
      introNodes: getIntroNodes(productId),
    },
    latestReviews: latest.map((r) => ({
      ...r,
      userInitial: userInitial(r.user),
    })),
    hasMoreReviews: hasMore,
    showReviewsBlock,
  }
}

module.exports = {
  buildProductDetailState,
}
