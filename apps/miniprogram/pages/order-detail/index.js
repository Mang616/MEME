const themedPage = require('../../behaviors/themed-page')
const { buildOrderDetailState } = require('../../utils/order-detail-page')
const { dispatchOrderCardEvent } = require('../../utils/orders-page')
const { withOrders } = require('../../utils/page-data')

Page({
  behaviors: themedPage,

  data: {
    found: false,
    order: null,
  },

  onLoad(options) {
    const id = options && options.id ? decodeURIComponent(options.id) : ''
    withOrders(() => this.applyState(id))
  },

  applyState(orderId) {
    const { found, order } = buildOrderDetailState(orderId)
    this.setData({ found, order })
  },

  onOrderCardEvent(e) {
    dispatchOrderCardEvent(e.detail)
  },
})
