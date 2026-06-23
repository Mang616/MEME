/**
 * 订单 Tab 列表脏标记：下单等操作后标记，onShow / 下拉刷新时重载 mock 数据
 */
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

/** @param {string} [activeStatus] */
function reloadOrdersPage(activeStatus) {
  return initOrdersPage(activeStatus)
}

/** 重载 mock 订单并写回页面缓存（onShow 脏刷新 / 下拉刷新） */
function applyOrdersListToPage(page, cacheKey) {
  const activeStatus = page.data.activeStatus
  const { allOrders, pageData } = reloadOrdersPage(activeStatus)
  page[cacheKey] = allOrders
  page.setData(pageData)
  return allOrders
}

module.exports = {
  markOrdersListDirty,
  consumeOrdersListDirty,
  reloadOrdersPage,
  applyOrdersListToPage,
}
