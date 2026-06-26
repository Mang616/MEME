/**
 * 页面加载前确保 API 缓存就绪（接口失败时仍用本地/缓存数据渲染）
 */
const api = require('./api/index')

function withResource(ensureFn, label, task) {
  return ensureFn()
    .catch((err) => {
      console.warn(`[page-data] ${label}`, err.message)
    })
    .then(() => task())
}

const withCatalog = (task) =>
  withResource(() => api.ensureCatalog(), 'catalog unavailable', task)

const withOrders = (task) =>
  withResource(() => api.ensureOrders(), 'orders unavailable', task)

const withHandlers = (task) =>
  withResource(() => api.ensureHandlers(), 'handlers unavailable', task)

module.exports = {
  withCatalog,
  withOrders,
  withHandlers,
}
