/**
 * 下拉刷新滚动容器（展示品牌 Logo，刷新后收起）
 * @property {string} logoSrc
 * @property {number} threshold 触发刷新距离（px）
 * @fires refresh
 */
const { brandLogo } = require('../../utils/config')

Component({
  options: {
    multipleSlots: true,
  },

  properties: {
    logoSrc: {
      type: String,
      value: brandLogo,
    },
    threshold: {
      type: Number,
      value: 56,
    },
    extClass: {
      type: String,
      value: '',
    },
  },

  data: {
    refreshing: false,
    showIndicator: false,
    indicatorOpacity: 0,
    indicatorScale: 0.65,
  },

  lifetimes: {
    detached() {
      if (this._autoStopTimer) clearTimeout(this._autoStopTimer)
    },
  },

  methods: {
    onRefresherPulling(e) {
      if (this.data.refreshing) return
      const dy = e.detail.dy || 0
      const threshold = this.properties.threshold
      const progress = Math.min(dy / threshold, 1)
      this.setData({
        showIndicator: dy > 4,
        indicatorOpacity: progress,
        indicatorScale: 0.65 + progress * 0.35,
      })
    },

    onRefresherRestore() {
      if (this.data.refreshing) return
      this.setData({
        showIndicator: false,
        indicatorOpacity: 0,
        indicatorScale: 0.65,
      })
    },

    onRefresherRefresh() {
      if (this.data.refreshing) return
      this.setData({
        refreshing: true,
        showIndicator: true,
        indicatorOpacity: 1,
        indicatorScale: 1,
      })
      this.triggerEvent('refresh')
      if (this._autoStopTimer) clearTimeout(this._autoStopTimer)
      this._autoStopTimer = setTimeout(() => this.stopRefresh(), 12000)
    },

    /** 由页面在数据刷新完成后调用 */
    stopRefresh() {
      if (this._autoStopTimer) {
        clearTimeout(this._autoStopTimer)
        this._autoStopTimer = null
      }
      this.setData({
        refreshing: false,
        showIndicator: false,
        indicatorOpacity: 0,
        indicatorScale: 0.65,
      })
    },
  },
})
