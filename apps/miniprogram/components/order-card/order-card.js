/**
 * 订单卡片：仅负责展示与事件冒泡，业务由 orders-page 分发
 * @fires event detail.type = copy | producttap | action
 */
Component({
  properties: {
    order: {
      type: Object,
      value: {},
    },
    /** list：订单列表；detail：订单详情 */
    mode: {
      type: String,
      value: 'list',
    },
  },

  methods: {
    emitCardEvent(type, payload) {
      this.triggerEvent('event', { type, ...payload })
    },

    onCopy(e) {
      const { text } = e.currentTarget.dataset
      if (text) this.emitCardEvent('copy', { text })
    },

    onAction(e) {
      const { action, id, productId } = e.currentTarget.dataset
      this.emitCardEvent('action', { action, id, productId })
    },

    onProductTap() {
      const { productId } = this.properties.order
      if (productId) this.emitCardEvent('producttap', { productId })
    },

    onCardTap() {
      const { order } = this.properties
      if (!order || !order.compact) return
      this.emitCardEvent('action', {
        action: 'detail',
        id: order.id,
        productId: order.productId,
      })
    },
  },
})
