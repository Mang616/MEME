const themedPage = require('../../behaviors/themed-page')
const auth = require('../../utils/auth')
const { PAGE_ROUTES } = require('../../utils/constants')
const { buildOrderCreateUrl } = require('../../utils/nav')
const {
  buildOrderCreateState,
  patchQuantity,
  applyHandlerSelection,
  submitOrderCreate,
} = require('../../utils/order-create-page')
const { consumeHandlerSelection } = require('../../utils/handler-selection')
const { openHomeTab, openHandlerSelect } = require('../../utils/nav')
const { showTip } = require('../../utils/ui')

Page({
  behaviors: themedPage,

  data: {
    found: false,
    product: null,
    quantity: 1,
    maxQty: 1,
    canDecrease: false,
    canIncrease: true,
    regionOptions: [],
    regionIndex: 0,
    regionLabel: '',
    autoAssignPlayer: true,
    handlerId: '',
    handlerLabel: '',
    handlerLevelLabel: '',
    handlerLevelIcon: '',
    handlerGenderLabel: '',
    gameId: '',
    remark: '',
    unitPriceDisplay: '',
    totalPaidDisplay: '',
    notice: '',
    submitting: false,
  },

  onLoad(options) {
    const productId = options && options.id ? options.id : ''
    if (!auth.requireLogin({ redirect: buildOrderCreateUrl(productId) })) return

    const state = buildOrderCreateState(productId)
    if (!state.found) {
      showTip('商品不存在')
      setTimeout(() => {
        if (getCurrentPages().length > 1) wx.navigateBack()
        else openHomeTab()
      }, 600)
      return
    }
    this.setData(state)
  },

  onShow() {
    const handler = consumeHandlerSelection()
    if (handler) {
      this.setData(applyHandlerSelection(this.data, handler))
    }
  },

  onRegionChange(e) {
    const index = Number(e.detail.value) || 0
    const label = this.data.regionOptions[index] || ''
    this.setData({ regionIndex: index, regionLabel: label })
  },

  onAutoAssignChange(e) {
    const autoAssignPlayer = !!e.detail.value
    this.setData({ autoAssignPlayer })
  },

  onPickHandler() {
    if (this.data.submitting) return
    openHandlerSelect(this.data.handlerId)
  },

  onGameIdInput(e) {
    this.setData({ gameId: e.detail.value })
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  onQtyMinus() {
    if (!this.data.canDecrease || this.data.submitting) return
    this.setData(patchQuantity(this.data, -1))
  },

  onQtyPlus() {
    if (!this.data.canIncrease || this.data.submitting) return
    this.setData(patchQuantity(this.data, 1))
  },

  async onSubmit() {
    if (this.data.submitting || !this.data.found) return

    this.setData({ submitting: true })
    try {
      const order = await submitOrderCreate(this.data)
      showTip('下单成功', 'success')
      wx.redirectTo({
        url: `${PAGE_ROUTES.ORDER_DETAIL}?id=${encodeURIComponent(order.id)}`,
      })
    } catch (err) {
      showTip(err.message || '下单失败，请重试')
      this.setData({ submitting: false })
    }
  },
})
