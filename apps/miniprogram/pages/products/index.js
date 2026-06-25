/**
 * 商品 Tab
 */
const themedPage = require('../../behaviors/themed-page')
const {
  initProductsPage,
  applyServiceType,
  applySubCategory,
  DEFAULT_SERVICE_TYPE,
} = require('../../utils/products-page')
const {
  consumePendingServiceType,
  openProductFromEvent,
  openOrderCreateFromEvent,
  openSearch,
} = require('../../utils/nav')
const { getTabChangeId } = require('../../utils/line-tabs')
const { runPullRefresh, getPullRefresh } = require('../../utils/pull-refresh')
const { withCatalog } = require('../../utils/page-data')
const api = require('../../utils/api/index')

Page({
  behaviors: themedPage,

  onLoad() {
    withCatalog(() => {
      this.setData(initProductsPage(DEFAULT_SERVICE_TYPE))
    })
  },

  onShow() {
    const pending = consumePendingServiceType()
    if (pending && pending !== this.data.activeType) {
      this.setData(applyServiceType(pending))
    }
  },

  onOpenSearch() {
    openSearch()
  },

  onTabChange(e) {
    const id = getTabChangeId(e, this.data.activeType)
    if (!id) return
    this.setData(applyServiceType(id))
  },

  onSubCategoryChange(e) {
    const { id } = e.detail || {}
    if (!id || id === this.data.activeSubCategoryId) return
    this.setData(
      applySubCategory(this.data.activeType, id, this.data.subCategories),
    )
  },

  onProductTap(e) {
    openProductFromEvent(e)
  },

  onBuy(e) {
    openOrderCreateFromEvent(e)
  },

  onPullRefresh() {
    const pr = getPullRefresh(this, '#productsPanel')
    const { activeType, activeSubCategoryId, subCategories } = this.data
    runPullRefresh(pr, () =>
      api.refreshCatalog().then(() => {
        this.setData(applySubCategory(activeType, activeSubCategoryId, subCategories))
      }),
    )
  },
})
