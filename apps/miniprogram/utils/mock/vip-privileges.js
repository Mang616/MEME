/** 各 VIP 等级会员特权 mock */

const { VIP_MIN, VIP_MAX } = require('./vip-levels')

function levelTag(level) {
  return level === 0 ? 'VIP0' : `V${level}`
}

/**
 * @param {number} level
 * @returns {{ id: string, name: string, value: string, unlocked: boolean }[]}
 */
function getPrivilegesForLevel(level) {
  const lv = Math.max(VIP_MIN, Math.min(VIP_MAX, parseInt(level, 10) || 0))
  return [
    {
      id: 'consume_reward',
      name: '消费奖励',
      value: lv >= 1 ? `专享优惠券×${lv}` : '—',
      unlocked: lv >= 1,
    },
    {
      id: 'upgrade_reward',
      name: '升级消费奖励',
      value: lv >= 1 ? `礼券${lv * 100}元` : '—',
      unlocked: lv >= 1,
    },
    {
      id: 'service',
      name: '专属客服',
      value: lv >= 3 ? '7×24 在线' : 'V3 解锁',
      unlocked: lv >= 3,
    },
    {
      id: 'birthday',
      name: '生日礼金',
      value: lv >= 5 ? `${lv * 50}元` : 'V5 解锁',
      unlocked: lv >= 5,
    },
    {
      id: 'priority',
      name: '优先匹配打手',
      value: lv >= 7 ? '已开通' : 'V7 解锁',
      unlocked: lv >= 7,
    },
    {
      id: 'discount',
      name: '全场折扣',
      value: lv >= 9 ? `${(99 - lv * 0.5).toFixed(1)}折` : 'V9 解锁',
      unlocked: lv >= 9,
    },
  ]
}

function buildPrivilegeSection(previewLevel) {
  const level = Math.max(VIP_MIN, Math.min(VIP_MAX, parseInt(previewLevel, 10) || 0))

  return {
    sectionTitle: '会员特权',
    sectionSubtitle: `${levelTag(level)} 专属特权`,
    privilegeRows: getPrivilegesForLevel(level),
  }
}

module.exports = {
  getPrivilegesForLevel,
  buildPrivilegeSection,
  levelTag,
}
