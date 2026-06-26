/**
 * 商品列表滚动区（product-row + 空态）
 * layout: tab=嵌入 Tab 页右栏；subpage=navigateTo 全屏子页（含安全区底留白）
 */
Component({
  properties: {
    products: {
      type: Array,
      value: [],
    },
    emptyText: {
      type: String,
      value: '暂无商品',
    },
    emptyHint: {
      type: String,
      value: '',
    },
    /** tab | subpage */
    layout: {
      type: String,
      value: 'tab',
    },
  },

  methods: {
    onProductTap(e) {
      this.triggerEvent('producttap', e.detail)
    },

    onBuy(e) {
      this.triggerEvent('buy', e.detail)
    },
  },
})
