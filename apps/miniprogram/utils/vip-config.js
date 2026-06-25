/**
 * VIP 等级配置（从 /content/vip-config 加载，与后台 apps/admin/src/lib/vip-config.ts 对齐）
 */
const { fetchContent } = require('./api/content')
const { resolveLocalImage } = require('./local-image')
const { VIP_MIN, VIP_MAX, VIP_BADGE_BG, VIP_BADGE_COLOR, VIP_LEVEL_LIST, VIP_TITLES } = require('./mock/vip-levels')

let config = null
let task = null

function buildDefaultLevelList(vipMin = VIP_MIN, vipMax = VIP_MAX) {
  return Array.from({ length: vipMax - vipMin + 1 }, (_, index) =>
    normalizeLevelItem({ level: vipMin + index }),
  )
}

function normalizeLevelItem(item) {
  const level = Number(item.level)
  const safeLevel = Number.isFinite(level) ? level : 0
  return {
    level: safeLevel,
    label: (item.label && String(item.label).trim()) || `VIP${safeLevel}`,
    title: (item.title && String(item.title).trim()) || VIP_TITLES[safeLevel] || `等级${safeLevel}`,
    icon: item.icon ? resolveLocalImage(String(item.icon).trim()) : resolveLocalImage(`/assets/level/${safeLevel}.webp`),
    bg: (item.bg && String(item.bg).trim()) || VIP_BADGE_BG,
    color: (item.color && String(item.color).trim()) || VIP_BADGE_COLOR,
  }
}

function normalizeConfig(payload) {
  const raw = payload && typeof payload === 'object' ? payload : {}
  const vipMin = raw.vipMin ?? VIP_MIN
  const vipMax = raw.vipMax ?? VIP_MAX
  let levelList = Array.isArray(raw.levelList) ? raw.levelList : []
  if (!levelList.length) {
    levelList = buildDefaultLevelList(vipMin, vipMax)
  } else {
    levelList = levelList.map((item) => normalizeLevelItem(item))
  }
  return { vipMin, vipMax, levelList }
}

function getDefaultConfig() {
  return normalizeConfig({
    vipMin: VIP_MIN,
    vipMax: VIP_MAX,
    levelList: VIP_LEVEL_LIST,
  })
}

async function ensureVipConfig() {
  if (config) return config
  if (!task) {
    task = fetchContent('vip-config')
      .then((page) => {
        config = normalizeConfig(page.payload)
        return config
      })
      .catch((err) => {
        task = null
        throw err
      })
  }
  return task
}

function getVipConfigSync() {
  return config || getDefaultConfig()
}

/** 将等级限制在 vipMin–vipMax；解析失败时用 fallback（默认 vipMin） */
function clampVipLevel(level, fallback) {
  const { vipMin, vipMax } = getVipConfigSync()
  const fb = fallback !== undefined ? fallback : vipMin
  const n = parseInt(level, 10)
  const value = Number.isNaN(n) ? fb : n
  return Math.max(vipMin, Math.min(vipMax, value))
}

function getVipLevelDef(level) {
  const cfg = getVipConfigSync()
  const n = clampVipLevel(level, cfg.vipMin)
  const found = cfg.levelList.find((item) => item.level === n)
  if (found) return normalizeLevelItem(found)
  const byIndex = cfg.levelList[n]
  if (byIndex) return normalizeLevelItem(byIndex)
  return normalizeLevelItem({ level: n })
}

module.exports = {
  ensureVipConfig,
  getVipConfigSync,
  clampVipLevel,
  getVipLevelDef,
  normalizeLevelItem,
}
