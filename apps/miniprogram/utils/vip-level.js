/**
 * VIP 等级解析与详情页数据
 */
const auth = require('./auth')
const { VIP_MIN, VIP_MAX, VIP_LEVEL_LIST, getVipLevelDef } = require('./mock/vip-levels')
const { buildVipProgressMock } = require('./mock/vip-progress')
const { buildPrivilegeSection, levelTag } = require('./mock/vip-privileges')

const VIP_ASSETS = {
  bg: '/assets/level/bg.webp',
  decoLeft: '/assets/level/left.webp',
  decoRight: '/assets/level/right.webp',
  gift: '/assets/level/gift.webp',
}

const TIMELINE_WINDOW = 5

/** 时间轴：previewLevel 为选中预览档，userLevel 为用户真实等级 */
function buildTimeline(previewLevel, userLevel) {
  const preview = clampLevel(previewLevel)
  const user = clampLevel(userLevel)
  const startMin = VIP_MIN === 0 ? 0 : 1
  let start = Math.max(startMin, preview - 2)
  let end = start + TIMELINE_WINDOW - 1
  if (end > VIP_MAX) {
    end = VIP_MAX
    start = Math.max(startMin, end - TIMELINE_WINDOW + 1)
  }

  const items = []
  for (let level = start; level <= end; level += 1) {
    const isSelected = level === preview
    items.push({
      level,
      label: level === 0 ? 'V0' : `V${level}`,
      isSelected,
      labelStyle: isSelected
        ? 'font-size:32rpx;font-weight:700;color:#ff3b30;'
        : 'font-size:24rpx;color:rgba(255,255,255,0.38);',
      dotStyle: isSelected
        ? 'width:20rpx;height:20rpx;background:#ff3b30;box-shadow:0 0 12rpx rgba(255,59,48,0.85);'
        : '',
      isUserLevel: level === user,
      isPast: level < user,
    })
  }
  return items
}

function clampLevel(level) {
  const n = parseInt(level, 10)
  if (Number.isNaN(n)) return 1
  return Math.max(VIP_MIN, Math.min(VIP_MAX, n))
}

/**
 * @param {number|string|undefined} vipLevel
 * @param {{ guest?: boolean }} [options]
 */
function resolveVipLevel(vipLevel, options = {}) {
  let level = 1
  if (typeof vipLevel === 'number') {
    level = vipLevel
  } else if (vipLevel !== undefined && vipLevel !== null && vipLevel !== '') {
    const digits = String(vipLevel).replace(/\D/g, '')
    level = digits ? parseInt(digits, 10) : 1
  }
  level = clampLevel(level)
  const def = getVipLevelDef(level)
  const label = options.guest ? '登录查看' : def.label
  return {
    level: def.level,
    label,
    title: def.title,
    icon: def.icon,
    bg: def.bg,
    color: def.color,
    subtitle: options.guest ? '会员等级' : `${def.label} · ${def.title}`,
  }
}

function buildVipLevelPageState(previewLevel) {
  const loggedIn = auth.isLoggedIn()
  const raw = loggedIn ? auth.getUser() : null
  const current = resolveVipLevel(loggedIn ? raw.vipLevel : 0)
  const userLevel = current.level
  const preview = clampLevel(
    previewLevel !== undefined && previewLevel !== null ? previewLevel : userLevel,
  )
  const progress = buildVipProgressMock(userLevel)
  const timeline = buildTimeline(preview, userLevel)
  const privilege = buildPrivilegeSection(preview)
  return {
    loggedIn,
    current,
    userLevel,
    previewLevel: preview,
    previewLevelTag: levelTag(preview),
    assets: VIP_ASSETS,
    progress,
    timeline,
    levelTag: levelTag(userLevel),
    privilegeSectionTitle: privilege.sectionTitle,
    privilegeSectionSubtitle: privilege.sectionSubtitle,
    privilegeRows: privilege.privilegeRows,
    maxLevel: VIP_MAX,
  }
}

module.exports = {
  resolveVipLevel,
  buildVipLevelPageState,
  buildTimeline,
  clampLevel,
}
