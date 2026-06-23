/**
 * 订单摘要：列表卡片 / 聊天发单 / 商品快照共用
 */
const { getProductById } = require('./mock/products')
const { formatMoney } = require('./format')

function mergeProductSnapshot(order, catalog) {
  const snapshot = order.product || {}
  return {
    ...snapshot,
    cover: catalog?.cover || snapshot.cover || '',
    coverColor: snapshot.coverColor || catalog?.coverColor || '',
  }
}

/** 聊天「选择订单」列表项 */
function buildOrderPickerItem(order) {
  const catalog = order.productId ? getProductById(order.productId) : null
  return {
    id: order.id,
    title: order.product?.title || catalog?.title || '订单商品',
    statusText: order.statusText,
    totalPaid: order.totalPaid,
    totalPaidDisplay: formatMoney(order.totalPaid),
    servicePlayer: order.servicePlayer || '—',
    orderTime: order.orderTime,
  }
}

function buildOrderPickerList(orders) {
  return (orders || []).map(buildOrderPickerItem)
}

/** 聊天消息中的订单卡片 payload */
function buildOrderMessageCard(orderItem) {
  if (!orderItem) return null
  return {
    id: orderItem.id,
    title: orderItem.title,
    statusText: orderItem.statusText,
    totalPaid: orderItem.totalPaid,
    totalPaidDisplay: formatMoney(orderItem.totalPaid),
    servicePlayer: orderItem.servicePlayer,
  }
}

module.exports = {
  mergeProductSnapshot,
  buildOrderPickerItem,
  buildOrderPickerList,
  buildOrderMessageCard,
}
