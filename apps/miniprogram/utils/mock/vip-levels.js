/** VIP 等级配置（0–10，图标 assets/level/{n}.webp） */

const VIP_MIN = 0
const VIP_MAX = 10

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

/** @type {{ level: number, title: string, icon: string, bg: string, color: string }[]} */
const VIP_LEVEL_STYLES = [
  { bg: 'rgba(120, 120, 128, 0.22)', color: '#B8B8C0' },
  { bg: 'rgba(180, 120, 72, 0.28)', color: '#E8C4A0' },
  { bg: 'rgba(160, 168, 184, 0.28)', color: '#D8DEE8' },
  { bg: 'rgba(212, 168, 64, 0.3)', color: '#F5D98C' },
  { bg: 'rgba(120, 176, 208, 0.28)', color: '#B8E0F5' },
  { bg: 'rgba(96, 168, 255, 0.28)', color: '#A8D4FF' },
  { bg: 'rgba(168, 112, 255, 0.28)', color: '#D4B8FF' },
  { bg: 'rgba(255, 112, 168, 0.26)', color: '#FFB8D8' },
  { bg: 'rgba(255, 152, 64, 0.28)', color: '#FFC898' },
  { bg: 'rgba(209, 255, 189, 0.22)', color: '#D1FFBD' },
  { bg: 'rgba(255, 215, 120, 0.32)', color: '#FFE8A8' },
]

function buildLevelDef(level) {
  const style = VIP_LEVEL_STYLES[level] || VIP_LEVEL_STYLES[0]
  return {
    level,
    label: `VIP${level}`,
    title: VIP_TITLES[level] || `等级${level}`,
    icon: `/assets/level/${level}.webp`,
    bg: style.bg,
    color: style.color,
  }
}

const VIP_LEVEL_LIST = Array.from({ length: VIP_MAX - VIP_MIN + 1 }, (_, i) =>
  buildLevelDef(VIP_MIN + i),
)

function getVipLevelDef(level) {
  const n = Math.max(VIP_MIN, Math.min(VIP_MAX, parseInt(level, 10) || 0))
  return VIP_LEVEL_LIST[n]
}

module.exports = {
  VIP_MIN,
  VIP_MAX,
  VIP_LEVEL_LIST,
  getVipLevelDef,
}
