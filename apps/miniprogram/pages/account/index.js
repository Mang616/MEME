const themedPage = require('../../behaviors/themed-page')
const auth = require('../../utils/auth')
const { PAGE_ROUTES } = require('../../utils/constants')
const { showTip } = require('../../utils/ui')
const {
  RECHARGE_AMOUNTS,
  loadAccountPage,
  refreshAccountPage,
  formatRechargeMessage,
} = require('../../utils/account-page')

Page({
  behaviors: themedPage,

  data: {
    loading: true,
    balanceText: '0.00',
    totalConsumeText: '0.00',
    ledgerRows: [],
    emptyLedger: true,
  },

  onLoad() {
    if (!auth.requireLogin({ redirect: PAGE_ROUTES.ACCOUNT })) return
    void this.reload()
  },

  onShow() {
    if (!auth.isLoggedIn()) return
    if (!this.data.loading) {
      void this.reload()
    }
  },

  async reload() {
    this.setData({ loading: true })
    try {
      const state = await loadAccountPage()
      this.setData({ ...state, loading: false })
    } catch (err) {
      this.setData({ loading: false })
      showTip(err.message || '加载失败')
    }
  },

  onRechargeTap() {
    wx.showActionSheet({
      itemList: RECHARGE_AMOUNTS.map((amount) => `充值 ¥${amount}`),
      success: (res) => {
        const amount = RECHARGE_AMOUNTS[res.tapIndex]
        if (!amount) return
        void this.handleRecharge(amount)
      },
    })
  },

  async handleRecharge(amount) {
    wx.showLoading({ title: '充值中', mask: true })
    try {
      const result = await auth.recharge(amount)
      const state = await refreshAccountPage()
      this.setData(state)
      wx.showToast({
        title: formatRechargeMessage(result),
        icon: 'none',
        duration: 2800,
      })
    } catch (err) {
      wx.showToast({
        title: err.message || '充值失败',
        icon: 'none',
      })
    } finally {
      wx.hideLoading()
    }
  },
})
