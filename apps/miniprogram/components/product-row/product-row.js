/**
 * 商品 Tab 列表行
 * @fires tap      detail.product
 * @fires buy      detail.product
 */
Component({
  properties: {
    product: {
      type: Object,
      value: {},
    },
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { product: this.properties.product })
    },
    onBuy() {
      this.triggerEvent('buy', { product: this.properties.product })
    },
  },
})
