const {
  buildVipLevelPageState,
  clampLevel,
} = require('../../utils/vip-level')

Page({
  data: buildVipLevelPageState(),

  onShow() {
    this.setData(buildVipLevelPageState())
  },

  applyPreviewLevel(level) {
    const next = clampLevel(level)
    if (next === this.data.previewLevel) return
    this.setData(buildVipLevelPageState(next))
  },

  /** 点击时间轴节点，预览该等级特权 */
  onTimelineNodeTap(e) {
    const { level } = e.currentTarget.dataset
    if (level === undefined || level === '') return
    this.applyPreviewLevel(Number(level))
  },

  /** 点击进度条，在时间轴范围内切换预览等级 */
  onProgressTap() {
    const { timeline, previewLevel } = this.data
    if (!timeline || !timeline.length) return
    const idx = timeline.findIndex((item) => item.level === previewLevel)
    const nextIdx = idx < 0 ? 0 : (idx + 1) % timeline.length
    this.applyPreviewLevel(timeline[nextIdx].level)
  },
})
