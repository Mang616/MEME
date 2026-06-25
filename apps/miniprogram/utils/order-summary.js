/**
 * 订单摘要：列表卡片 / 聊天发单 / 商品快照共用
 */
const { getProductById } = require('./api/repository')
const { formatMoney } = require('./format')

function mergeProductSnapshot(order, catalog) {
  const snapshot = order.product || {}
  return {
    ...snapshot,
    cover: catalog?.cover || snapshot.cover || '',
    coverColor: snapshot.coverColor || catalog?.coverColor || '',
  }
}

function buildOrderCardCore(order, catalog) {
  return {
    id: order.id,
    title: order.title || order.product?.title || catalog?.title || '订单商品',
    statusText: order.statusText,
    totalPaid: order.totalPaid,
    totalPaidDisplay: formatMoney(order.totalPaid),
    servicePlayer: order.servicePlayer || '—',
  }
}

/** 聊天「选择订单」列表项 */
function buildOrderPickerItem(order) {
  const catalog = order.productId ? getProductById(order.productId) : null
  return {
    ...buildOrderCardCore(order, catalog),
    orderTime: order.orderTime,
  }
}

function buildOrderPickerList(orders) {
  return (orders || []).map(buildOrderPickerItem)
}

/** 聊天消息中的订单卡片 payload */
function buildOrderMessageCard(orderItem) {
  if (!orderItem) return null
  return buildOrderCardCore(orderItem)
}

module.exports = {
  mergeProductSnapshot,
  buildOrderPickerItem,
  buildOrderPickerList,
  buildOrderMessageCard,
}
