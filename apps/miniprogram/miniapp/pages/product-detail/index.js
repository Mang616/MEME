const themedPage = require('../../behaviors/themed-page')
const { buildProductDetailState } = require('../../utils/product-page')
const { PLATFORM_NOTICE } = require('../../utils/mock/products')
const { openHomeTab, openOrderCreateWithAuth, openServiceChat } = require('../../utils/nav')
const { showMockFeature, showTip } = require('../../utils/ui')

Page({
  behaviors: themedPage,

  data: {
    product: null,
    latestReviews: [],
    hasMoreReviews: false,
    showReviewsBlock: false,
    platformNotice: PLATFORM_NOTICE,
    scrollTop: 0,
  },

  onLoad(options) {
    const state = buildProductDetailState(options.id)
    if (!state.product) {
      showTip('商品不存在')
      setTimeout(() => {
        if (getCurrentPages().length > 1) {
          wx.navigateBack()
        } else {
          openHomeTab()
        }
      }, 800)
      return
    }
    this.setData({
      ...state,
      scrollTop: 0,
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
