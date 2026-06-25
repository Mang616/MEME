/**
 * VIP 等级解析与详情页状态
 */
const auth = require('./auth')
const {
  ensureVipConfig,
  getVipConfigSync,
  clampVipLevel,
  getVipLevelDef,
} = require('./vip-config')
const {
  ensureVipActivity,
  buildPrivilegeSection,
  levelTag,
} = require('./vip-activity')
const { buildVipProgress } = require('./vip-progress')
const { resolveLocalImage } = require('./local-image')

const VIP_ASSETS = {
  bg: resolveLocalImage('/assets/level/bg.webp'),
  decoLeft: resolveLocalImage('/assets/level/left.webp'),
  decoRight: resolveLocalImage('/assets/level/right.webp'),
  gift: resolveLocalImage('/assets/level/gift.webp'),
}

const TIMELINE_WINDOW = 5

function parseVipLevelInput(vipLevel) {
  if (typeof vipLevel === 'number') return vipLevel
  if (vipLevel === undefined || vipLevel === null || vipLevel === '') return null
  const digits = String(vipLevel).replace(/\D/g, '')
  return digits ? parseInt(digits, 10) : null
}

function timelineNodeStyles(isSelected) {
  if (!isSelected) {
    return {
      labelStyle: 'font-size:24rpx;color:rgba(255,255,255,0.38);',
      dotStyle: '',
    }
  }
  return {
    labelStyle: 'font-size:32rpx;font-weight:700;color:#ff3b30;',
    dotStyle:
      'width:20rpx;height:20rpx;background:#ff3b30;box-shadow:0 0 12rpx rgba(255,59,48,0.85);',
  }
}

function buildTimeline(previewLevel, userLevel) {
  const { vipMin, vipMax } = getVipConfigSync()
  const preview = clampVipLevel(previewLevel, 1)
  const user = clampVipLevel(userLevel, 1)
  const startMin = vipMin === 0 ? 0 : 1
  let start = Math.max(startMin, preview - 2)
  let end = start + TIMELINE_WINDOW - 1
  if (end > vipMax) {
    end = vipMax
    start = Math.max(startMin, end - TIMELINE_WINDOW + 1)
  }

  const items = []
  for (let level = start; level <= end; level += 1) {
    const isSelected = level === preview
    const styles = timelineNodeStyles(isSelected)
    items.push({
      level,
      // 时间轴用 V0/Vn，与详情区 levelTag（VIP0/Vn）区分
      label: level === 0 ? 'V0' : `V${level}`,
      isSelected,
      ...styles,
      isUserLevel: level === user,
      isPast: level < user,
    })
  }
  return items
}

function resolveVipLevel(vipLevel, options = {}) {
  const parsed = parseVipLevelInput(vipLevel)
  const level = clampVipLevel(parsed === null ? 1 : parsed, 1)
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
  const preview =
    previewLevel !== undefined && previewLevel !== null
      ? clampVipLevel(previewLevel, userLevel)
      : userLevel
  const { vipMax } = getVipConfigSync()
  const progress = loggedIn ? buildVipProgress(raw) : buildVipProgress({ vipLevel: 0, totalConsume: 0 })
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
    maxLevel: vipMax,
  }
}

async function loadVipLevelPageState(previewLevel) {
  await Promise.all([ensureVipConfig(), ensureVipActivity()])
  if (auth.isLoggedIn()) {
    try {
      await auth.syncProfile()
    } catch (err) {
      console.warn('[vip-level] sync profile failed', err.message)
    }
  }
  return buildVipLevelPageState(previewLevel)
}

module.exports = {
  resolveVipLevel,
  buildVipLevelPageState,
  loadVipLevelPageState,
}
