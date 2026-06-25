/** VIP 活动 seed 兜底（默认数据来自 vip-activity-defaults，等级范围对齐 vip-levels） */
const { VIP_MIN, VIP_MAX } = require('./vip-levels')
const defaults = require('../vip-activity-defaults')

function buildLevelList() {
  return defaults.buildDefaultLevelList(VIP_MIN, VIP_MAX)
}

const VIP_ACTIVITY_DEFAULT = defaults.createDefaultPayload(VIP_MIN, VIP_MAX)

module.exports = {
  VIP_ACTIVITY_DEFAULT,
  VIP_CUMULATIVE_THRESHOLDS: defaults.VIP_CUMULATIVE_THRESHOLDS,
  getDefaultCumulativeThreshold: (level) =>
    defaults.getDefaultCumulativeThreshold(level, VIP_MIN, VIP_MAX),
  calcUpgradeTarget: (level, cumulative, nextCumulative) =>
    defaults.calcUpgradeTarget(level, cumulative, nextCumulative, VIP_MAX),
  buildPrivilegeRowsForLevel: (level) =>
    defaults.buildPrivilegeRowsForLevel(level, VIP_MIN, VIP_MAX),
  buildLevelList,
}
