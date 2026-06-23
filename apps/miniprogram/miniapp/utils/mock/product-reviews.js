/**
 * 商品评价 mock — 按商品 id 索引
 */

const REVIEWS_BY_PRODUCT = {
  p1: [
    {
      id: 'r1',
      user: '玩家***7K',
      rate: 5,
      content: '打手很稳，绝密一把出红，值这个价。',
      time: '2026-05-20',
    },
    {
      id: 'r2',
      user: '三角洲***猫',
      rate: 5,
      content: '客服响应快，车队语音清晰，会再来。',
      time: '2026-05-18',
    },
    {
      id: 'r3',
      user: '路人***9',
      rate: 4,
      content: '整体不错，晚上排队稍久。',
      time: '2026-05-15',
    },
    {
      id: 'r3b',
      user: '绝密***手',
      rate: 5,
      content: '炸单送局数说到做到，车队配合默契。',
      time: '2026-05-12',
    },
  ],
  p2: [
    {
      id: 'r4',
      user: '老板***救',
      rate: 5,
      content: '30杀撤离真的做到了，破产回血。',
      time: '2026-05-22',
    },
    {
      id: 'r5',
      user: '用户***A1',
      rate: 5,
      content: '打手意识很好，推荐。',
      time: '2026-05-19',
    },
  ],
  p5: [
    {
      id: 'r6',
      user: '开黑***鸭',
      rate: 5,
      content: '小姐姐声音好听，娱乐局很开心。',
      time: '2026-05-21',
    },
    {
      id: 'r7',
      user: '深夜***人',
      rate: 5,
      content: '一小时很快就过去了，体验轻松。',
      time: '2026-05-17',
    },
  ],
}

const PREVIEW_LIMIT = 3

function sortByTimeDesc(reviews) {
  return [...reviews].sort((a, b) => (b.time > a.time ? 1 : b.time < a.time ? -1 : 0))
}

function getReviewsByProductId(productId) {
  return sortByTimeDesc(REVIEWS_BY_PRODUCT[productId] || [])
}

/** 详情页：最新 N 条 + 是否显示「查看更多」 */
function getReviewPreview(productId, reviewCount = 0) {
  const all = getReviewsByProductId(productId)
  const latest = all.slice(0, PREVIEW_LIMIT)
  const total = Math.max(reviewCount, all.length)
  const hasMore = total > PREVIEW_LIMIT
  return { latest, hasMore, total }
}

module.exports = {
  REVIEWS_BY_PRODUCT,
  PREVIEW_LIMIT,
  getReviewsByProductId,
  getReviewPreview,
}
