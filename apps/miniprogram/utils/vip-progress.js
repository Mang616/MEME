/** VIP 成长进度（累计消费来自用户 totalConsume，门槛读 CMS vip-activity） */
const { clampVipLevel, getVipConfigSync } = require('./vip-config')
const {
  getVipActivitySync,
  getCumulativeThreshold,
  getUpgradeTarget,
  resolveTemplate,
  levelTag,
} = require('./vip-activity')

function buildVipProgress(user) {
  const { vipMax } = getVipConfigSync()
  const cfg = getVipActivitySync()
  const totalConsume = Math.max(0, Number(user?.totalConsume) || 0)
  const level = clampVipLevel(user?.vipLevel ?? 0, 0)
  const nextLevel = Math.min(level + 1, vipMax)
  const isMax = level >= vipMax

  const currentCumulative = getCumulativeThreshold(level)
  const nextCumulative = getCumulativeThreshold(nextLevel)
  const consumeTarget = getUpgradeTarget(level)
  const consumeRemain = Math.max(0, nextCumulative - totalConsume)
  const percent = isMax
    ? 100
    : consumeTarget > 0
      ? Math.min(
          100,
          Math.round(((totalConsume - currentCumulative) / consumeTarget) * 100),
        )
      : 0

  const hintCtx = {
    level,
    unlockLevel: level,
    amount: 0,
    discount: '',
    levelTag: levelTag(level),
    nextTag: levelTag(nextLevel),
    remain: consumeRemain,
    consumeLabel: cfg.consumeLabel,
  }

  return {
    consumeAmount: String(totalConsume),
    consumeLabel: cfg.consumeLabel,
    progressPercent: percent,
    upgradeHint: isMax
      ? cfg.maxLevelHint
      : resolveTemplate(cfg.upgradeHintTemplate, hintCtx),
    promotionReward: {
      text: cfg.promotionRewardText,
    },
  }
}

module.exports = { buildVipProgress, buildVipProgressPreview: buildVipProgress }
