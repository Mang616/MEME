const themedPage = require('../../behaviors/themed-page')
const auth = require('../../utils/auth')
const { PAGE_ROUTES } = require('../../utils/constants')
const { getTabChangeId, FILTER_ALL } = require('../../utils/line-tabs')
const { showTip } = require('../../utils/ui')
const {
  loadCouponsPage,
  applyCouponFilter,
} = require('../../utils/coupons-page')

Page({
  behaviors: themedPage,

  data: {
    loading: true,
    coupons: [],
    allCoupons: [],
    couponTabs: [],
    activeFilter: FILTER_ALL,
    emptyText: '',
    emptySubHint: '',
    totalCount: 0,
    availableCount: 0,
  },

  onLoad() {
    if (!auth.requireLogin({ redirect: PAGE_ROUTES.COUPONS })) return
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
      const state = await loadCouponsPage(this.data.activeFilter)
      this.setData({ ...state, loading: false })
    } catch (err) {
      this.setData({ loading: false })
      showTip(err.message || '加载失败')
    }
  },

  onTabChange(e) {
    const nextId = getTabChangeId(e, this.data.activeFilter)
    if (!nextId) return
    const patch = applyCouponFilter(this.data.allCoupons, nextId)
    this.setData(patch)
  },
})
