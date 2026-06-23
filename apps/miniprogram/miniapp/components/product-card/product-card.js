/**
 * 首页 service-panel 网格商品卡
 * @fires tap  detail.product
 */
Component({
  options: {
    virtualHost: true,
  },

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
  },
})
