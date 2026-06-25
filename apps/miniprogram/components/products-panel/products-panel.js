/**
 * 商品 Tab：顶栏 Tab + 侧栏子分类 + 右侧商品列表（单 scroll）
 *
 * @fires tabchange | subcategorychange | producttap | buy | refresh
 */
Component({
  properties: {
    serviceTypes: { type: Array, value: [] },
    activeType: { type: String, value: '' },
    subCategories: { type: Array, value: [] },
    activeSubCategoryId: { type: String, value: '' },
    activeSubCategoryName: { type: String, value: '' },
    products: { type: Array, value: [] },
    productCount: { type: Number, value: 0 },
    listEmptyText: { type: String, value: '该分类暂无商品' },
    listEmptyHint: { type: String, value: '试试切换左侧其他分类' },
  },

  methods: {
    _relay(name, e) {
      this.triggerEvent(name, e.detail)
    },

    onTabChange(e) {
      this._relay('tabchange', e)
    },

    onSubCategoryTap(e) {
      const { id } = e.currentTarget.dataset
      if (!id || id === this.properties.activeSubCategoryId) return
      this.triggerEvent('subcategorychange', { id })
    },

    onProductTap(e) {
      this._relay('producttap', e)
    },

    onBuy(e) {
      this._relay('buy', e)
    },

    onPullRefresh() {
      this.triggerEvent('refresh')
    },
  },
})
