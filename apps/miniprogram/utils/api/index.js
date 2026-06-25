/**
 * 启动时预热商品与打手缓存
 */
const repository = require('./repository')

function warmup() {
  const { ensureVipConfig } = require('../vip-config')
  return Promise.all([
    repository.ensureCatalog().catch((err) => {
      console.warn('[api] catalog warmup failed', err.message)
    }),
    repository.ensureBanners().catch((err) => {
      console.warn('[api] banners warmup failed', err.message)
    }),
    repository.ensureHandlers().catch((err) => {
      console.warn('[api] handlers warmup failed', err.message)
    }),
    repository.ensureOrders().catch((err) => {
      console.warn('[api] orders warmup failed', err.message)
    }),
    ensureVipConfig().catch((err) => {
      console.warn('[api] vip-config warmup failed', err.message)
    }),
  ])
}

module.exports = {
  warmup,
  ...repository,
}
