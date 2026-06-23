const themedPage = require('../../behaviors/themed-page')
const { buildOrderDetailState } = require('../../utils/order-detail-page')
const { dispatchOrderCardEvent } = require('../../utils/orders-page')

Page({
  behaviors: themedPage,

  data: {
    found: false,
    order: null,
  },

  onLoad(options) {
    const id = options && options.id ? decodeURIComponent(options.id) : ''
    this.applyState(id)
  },

  applyState(orderId) {
    const { found, order } = buildOrderDetailState(orderId)
    this.setData({ found, order })
  },

  onOrderCardEvent(e) {
    dispatchOrderCardEvent(e.detail)
  },
})
