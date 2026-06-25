/** VIP 等级配置（0–10，图标 assets/level/{n}.png） */
const { resolveLocalImage } = require('../local-image')

const VIP_MIN = 0
const VIP_MAX = 10

const VIP_BADGE_BG = '#C9A020'
const VIP_BADGE_COLOR = '#C9A020'

const VIP_TITLES = [
  '新秀',
  '青铜',
  '白银',
  '黄金',
  '铂金',
  '钻石',
  '大师',
  '宗师',
  '王者',
  '传奇',
  '至尊',
]

function buildLevelDef(level) {
  return {
    level,
    label: `VIP${level}`,
    title: VIP_TITLES[level] || `等级${level}`,
    icon: resolveLocalImage(`/assets/level/${level}.webp`),
    bg: VIP_BADGE_BG,
    color: VIP_BADGE_COLOR,
  }
}

const VIP_LEVEL_LIST = Array.from({ length: VIP_MAX - VIP_MIN + 1 }, (_, i) =>
  buildLevelDef(VIP_MIN + i),
)

module.exports = {
  VIP_MIN,
  VIP_MAX,
  VIP_BADGE_BG,
  VIP_BADGE_COLOR,
  VIP_TITLES,
  VIP_LEVEL_LIST,
}
