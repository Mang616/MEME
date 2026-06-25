/**
 * 页面加载前确保 API 缓存就绪
 */
const api = require('./api/index')
const { showTip } = require('./ui')

function createWithGuard(ensureFn, fallbackMessage) {
  return (task) =>
    ensureFn().then(task).catch((err) => {
      showTip(err.message || fallbackMessage)
      throw err
    })
}

const withCatalog = createWithGuard(() => api.ensureCatalog(), '商品加载失败')
const withOrders = createWithGuard(() => api.ensureOrders(), '订单加载失败')
const withHandlers = createWithGuard(() => api.ensureHandlers(), '打手加载失败')

module.exports = {
  withCatalog,
  withOrders,
  withHandlers,
}
