/**
 * 页面加载前确保 API 缓存就绪
 */
const api = require('./api/index')
const { showTip } = require('./ui')

function withCatalog(task) {
  return api.ensureCatalog().then(task).catch((err) => {
    showTip(err.message || '商品加载失败')
    throw err
  })
}

function withOrders(task) {
  return api.ensureOrders().then(task).catch((err) => {
    showTip(err.message || '订单加载失败')
    throw err
  })
}

function withHandlers(task) {
  return api.ensureHandlers().then(task).catch((err) => {
    showTip(err.message || '打手加载失败')
    throw err
  })
}

module.exports = {
  withCatalog,
  withOrders,
  withHandlers,
}
