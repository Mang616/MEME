/** VIP 成长进度 mock（后端就绪后由接口替换） */

const { VIP_MAX } = require('./vip-levels')

/**
 * @param {number} currentLevel
 * @returns {object}
 */
function buildVipProgressMock(currentLevel) {
  const level = Math.max(0, Math.min(VIP_MAX, currentLevel))
  const nextLevel = Math.min(level + 1, VIP_MAX)
  const isMax = level >= VIP_MAX

  const consumeCurrent = 996
  const consumeTarget = 1230
  const consumeRemain = Math.max(0, consumeTarget - consumeCurrent)
  const percent = isMax
    ? 100
    : Math.min(100, Math.round((consumeCurrent / consumeTarget) * 100))

  return {
    consumeAmount: '1231',
    consumeLabel: '消费金额',
    progressPercent: percent,
    upgradeHint: isMax
      ? '您已达到最高等级'
      : `还需${consumeRemain}元消费金额可升级至V${nextLevel}`,
    promotionReward: {
      text: '升级等级获取更多消费奖励',
    },
  }
}

module.exports = { buildVipProgressMock }
