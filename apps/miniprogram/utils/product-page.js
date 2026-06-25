/**
 * 商品详情页数据组装
 */
const repository = require('./api/repository')
const { fetchContent } = require('./api/content')
const { buildIntroNodes } = require('./intro-nodes')
const { formatCount, formatPriceDisplay, userInitial, mapProductForDisplay } = require('./format')
const { formatLimitText } = require('./product-limit')

const PREVIEW_LIMIT = 3

function sortByTimeDesc(reviews) {
  return [...reviews].sort((a, b) => (b.time > a.time ? 1 : b.time < a.time ? -1 : 0))
}

function getReviewPreview(reviews, reviewCount = 0) {
  const all = sortByTimeDesc(reviews)
  const latest = all.slice(0, PREVIEW_LIMIT)
  const total = Math.max(reviewCount, all.length)
  const hasMore = total > PREVIEW_LIMIT
  return { latest, hasMore, total }
}

function resolveIntroNodes(productId, introPayload) {
  const sections =
    (introPayload && introPayload.sections && introPayload.sections[productId]) ||
    (introPayload && introPayload.defaultIntro) ||
    []
  return buildIntroNodes(sections)
}

function buildProductDetailState(productId, { reviews = [], introPayload = null } = {}) {
  const raw = repository.getProductDetail(productId)
  if (!raw) {
    return {
      product: null,
      latestReviews: [],
      hasMoreReviews: false,
      showReviewsBlock: false,
    }
  }

  const { latest, hasMore } = getReviewPreview(reviews, raw.reviewCount)
  const showReviewsBlock = raw.reviewCount > 0 || latest.length > 0

  return {
    product: {
      ...mapProductForDisplay(raw),
      soldText: formatCount(raw.sold),
      viewsText: formatCount(raw.views),
      limitText: formatLimitText(raw.limitPerUser),
      introNodes: resolveIntroNodes(productId, introPayload),
    },
    latestReviews: latest.map((r) => ({
      ...r,
      userInitial: userInitial(r.user),
    })),
    hasMoreReviews: hasMore,
    showReviewsBlock,
  }
}

async function loadProductDetailState(productId) {
  const [reviewsRes, introPage] = await Promise.all([
    repository.fetchProductReviews(productId),
    fetchContent('product-intros').catch(() => null),
  ])
  return buildProductDetailState(productId, {
    reviews: reviewsRes.items || [],
    introPayload: introPage ? introPage.payload : null,
  })
}

module.exports = {
  buildProductDetailState,
  loadProductDetailState,
}
