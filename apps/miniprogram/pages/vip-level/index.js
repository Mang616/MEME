const {
  loadVipLevelPageState,
  buildVipLevelPageState,
} = require('../../utils/vip-level')
const { clampVipLevel } = require('../../utils/vip-config')

Page({
  data: {
    loggedIn: false,
    previewLevel: 1,
    timeline: [],
    privilegeRows: [],
  },

  onLoad() {
    void loadVipLevelPageState().then((state) => this.setData(state))
  },

  onShow() {
    void loadVipLevelPageState(this.data.previewLevel).then((state) => this.setData(state))
  },

  applyPreviewLevel(level) {
    const next = clampVipLevel(level, this.data.userLevel || 1)
    if (next === this.data.previewLevel) return
    this.setData(buildVipLevelPageState(next))
  },

  onTimelineNodeTap(e) {
    const { level } = e.currentTarget.dataset
    if (level === undefined || level === '') return
    this.applyPreviewLevel(Number(level))
  },

  onProgressTap() {
    const { timeline, previewLevel } = this.data
    if (!timeline || !timeline.length) return
    const idx = timeline.findIndex((item) => item.level === previewLevel)
    const nextIdx = idx < 0 ? 0 : (idx + 1) % timeline.length
    this.applyPreviewLevel(timeline[nextIdx].level)
  },
})
