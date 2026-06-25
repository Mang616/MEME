const themedPage = require('../../behaviors/themed-page')
const auth = require('../../utils/auth')
const { PAGE_ROUTES } = require('../../utils/constants')
const { buildOrderCreateUrl, openHandlerSelect } = require('../../utils/nav')
const {
  buildOrderCreateState,
  loadOrderCoupons,
  patchQuantity,
  applyCouponSelection,
  applyHandlerSelection,
  submitOrderCreate,
} = require('../../utils/order-create-page')
const { consumeHandlerSelection } = require('../../utils/handler-selection')
const { showNotFoundAndExit, showTip } = require('../../utils/ui')
const { withCatalog } = require('../../utils/page-data')

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
    regionSheetOptions: [],
    regionSelectedId: '0',
    showRegionPicker: false,
    autoAssignPlayer: true,
    handlerId: '',
    handlerLabel: '',
    handlerLevelLabel: '',
    handlerLevelIcon: '',
    handlerGenderLabel: '',
    gameId: '',
    remark: '',
    unitPriceDisplay: '',
    subtotalDisplay: '',
    couponDiscountDisplay: '',
    totalPaidDisplay: '',
    selectedCouponId: '',
    selectedCouponLabel: '请选择优惠券',
    hasCouponDiscount: false,
    couponOptions: [],
    couponSheetOptions: [],
    couponLoading: false,
    showCouponPicker: false,
    notice: '',
    submitting: false,
  },

  onLoad(options) {
    const productId = options && options.id ? options.id : ''
    if (!auth.requireLogin({ redirect: buildOrderCreateUrl(productId) })) return

    withCatalog(() => {
      const state = buildOrderCreateState(productId)
      if (!state.found) {
        showNotFoundAndExit('商品不存在')
        return
      }
      this.setData({ ...state, couponLoading: true })
      void this.refreshCoupons(state)
    })
  },

  onShow() {
    const handler = consumeHandlerSelection()
    if (handler) {
      this.setData(applyHandlerSelection(this.data, handler))
    }
  },

  async refreshCoupons(baseState) {
    const state = baseState || this.data
    try {
      const next = await loadOrderCoupons(state)
      this.setData(next)
    } catch {
      this.setData({ couponLoading: false })
    }
  },

  onOpenRegionPicker() {
    if (this.data.submitting) return
    this.setData({ showRegionPicker: true })
  },

  onCloseRegionPicker() {
    this.setData({ showRegionPicker: false })
  },

  onSelectRegion(e) {
    const index = Number(e.detail.id) || 0
    const label = this.data.regionOptions[index] || ''
    this.setData({
      regionIndex: index,
      regionLabel: label,
      regionSelectedId: String(index),
      showRegionPicker: false,
    })
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

  onOpenCouponPicker() {
    if (this.data.submitting || this.data.couponLoading) return
    this.setData({ showCouponPicker: true })
  },

  onCloseCouponPicker() {
    this.setData({ showCouponPicker: false })
  },

  onSelectCoupon(e) {
    const couponId = e.detail.id || ''
    this.setData(applyCouponSelection(this.data, couponId))
  },

  onRejectCoupon() {
    showTip('当前订单不满足该优惠券使用条件')
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
