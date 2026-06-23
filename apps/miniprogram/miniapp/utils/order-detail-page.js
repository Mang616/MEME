/**
 * 订单详情页状态
 */
const { getOrderById } = require('./mock/orders')
const { enrichOrder } = require('./orders-page')

function buildOrderDetailState(orderId) {
  const raw = getOrderById(orderId)
  if (!raw) {
    return {
      found: false,
      order: null,
    }
  }
  const order = enrichOrder({ ...raw, compact: false })
  const buttons = (order.buttons || []).filter((item) => item.action !== 'detail')

  return {
    found: true,
    order: {
      ...order,
      buttons,
      hasActions: buttons.length > 0,
    },
  }
}

module.exports = {
  buildOrderDetailState,
}
