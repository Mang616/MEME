const themedPage = require('../../behaviors/themed-page')
const { loadProductDetailState } = require('../../utils/product-page')
const { platformNotice } = require('../../utils/config')
const { openOrderCreateWithAuth, openServiceChat } = require('../../utils/nav')
const { showMockFeature, showNotFoundAndExit } = require('../../utils/ui')
const { withCatalog } = require('../../utils/page-data')

Page({
  behaviors: themedPage,

  data: {
    product: null,
    latestReviews: [],
    hasMoreReviews: false,
    showReviewsBlock: false,
    platformNotice,
    scrollTop: 0,
  },

  onLoad(options) {
    withCatalog(() => {
      void loadProductDetailState(options.id).then((state) => {
        if (!state.product) {
          showNotFoundAndExit('商品不存在', { delay: 800 })
          return
        }
        this.setData({
          ...state,
          scrollTop: 0,
        })
      })
    })
  },

  onReady() {
    this._resetScrollTop()
  },

  /** 固定底栏高度后仍重置 scroll-top，防止 scroll-view 首帧停在底部 */
  _resetScrollTop() {
    this.setData({ scrollTop: 0 })
    wx.nextTick(() => {
      this.setData({ scrollTop: 1 })
      wx.nextTick(() => this.setData({ scrollTop: 0 }))
    })
  },

  onShare() {
    showMockFeature('分享')
  },

  onMoreReviews() {
    showMockFeature('全部评价')
  },

  onContact() {
    openServiceChat()
  },

  onBuy() {
    const { product } = this.data
    if (!product) return
    openOrderCreateWithAuth(product.id)
  },
})
