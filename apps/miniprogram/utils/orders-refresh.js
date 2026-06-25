/**
 * 订单 Tab 列表脏标记：下单后刷新 API 数据
 */
const repository = require('./api/repository')
const { initOrdersPage } = require('./orders-page')

let listDirty = false

function markOrdersListDirty() {
  listDirty = true
}

function consumeOrdersListDirty() {
  const dirty = listDirty
  listDirty = false
  return dirty
}

function reloadOrdersPage(activeStatus) {
  return initOrdersPage(activeStatus)
}

async function applyOrdersListToPage(page, cacheKey) {
  await repository.refreshOrders()
  const activeStatus = page.data.activeStatus
  const { allOrders, pageData } = reloadOrdersPage(activeStatus)
  page[cacheKey] = allOrders
  page.setData(pageData)
  return allOrders
}

module.exports = {
  markOrdersListDirty,
  consumeOrdersListDirty,
  applyOrdersListToPage,
}
