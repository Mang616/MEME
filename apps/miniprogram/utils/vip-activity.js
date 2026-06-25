/**
 * VIP 活动配置：从 CMS `/content/vip-activity` 加载，本地缺省见 vip-activity-defaults。
 */
const { fetchContent } = require('./api/content')
const { getVipConfigSync } = require('./vip-config')
const {
  VIP_ACTIVITY_DEFAULT,
  normalizeVipActivityPayload,
  getDefaultCumulativeThreshold,
  calcUpgradeTarget,
} = require('./vip-activity-defaults')

let config = null
let task = null

function getLevelRange() {
  const { vipMin, vipMax } = getVipConfigSync()
  return { vipMin, vipMax }
}

function normalizeConfig(payload) {
  const { vipMin, vipMax } = getLevelRange()
  return normalizeVipActivityPayload(payload, vipMin, vipMax)
}

async function ensureVipActivity() {
  if (config) return config
  if (!task) {
    task = fetchContent('vip-activity')
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

/** 同步读取；未拉取 API 前返回与 vip-config 范围对齐的默认 payload */
function getVipActivitySync() {
  if (config) return config
  const { vipMin, vipMax } = getLevelRange()
  return normalizeVipActivityPayload(VIP_ACTIVITY_DEFAULT, vipMin, vipMax)
}

function levelTag(level) {
  return level === 0 ? 'VIP0' : `V${level}`
}

function resolveTemplate(template, ctx) {
  return String(template || '')
    .replace(/\{level\}/g, String(ctx.level))
    .replace(/\{unlockLevel\}/g, String(ctx.unlockLevel))
    .replace(/\{amount\}/g, String(ctx.amount))
    .replace(/\{discount\}/g, ctx.discount)
    .replace(/\{levelTag\}/g, ctx.levelTag)
    .replace(/\{nextTag\}/g, ctx.nextTag)
    .replace(/\{remain\}/g, String(ctx.remain))
    .replace(/\{consumeLabel\}/g, ctx.consumeLabel)
}

function findLevelConfig(level) {
  const cfg = getVipActivitySync()
  const { vipMin, vipMax } = getLevelRange()
  const lv = Math.max(vipMin, Math.min(vipMax, parseInt(level, 10) || vipMin))
  return cfg.levelList.find((item) => item.level === lv) || cfg.levelList[0]
}

function getCumulativeThreshold(level) {
  const item = findLevelConfig(level)
  if (item?.cumulativeThreshold != null) {
    return Math.max(0, Number(item.cumulativeThreshold) || 0)
  }
  const { vipMin, vipMax } = getLevelRange()
  return getDefaultCumulativeThreshold(level, vipMin, vipMax)
}

function getUpgradeTarget(level) {
  const item = findLevelConfig(level)
  if (item?.upgradeTarget != null) {
    return Math.max(0, Number(item.upgradeTarget) || 0)
  }
  const { vipMax } = getLevelRange()
  const cum = getCumulativeThreshold(level)
  const nextCum = getCumulativeThreshold(Number(level) + 1)
  return calcUpgradeTarget(level, cum, nextCum, vipMax)
}

function getPrivilegesForLevel(level) {
  const item = findLevelConfig(level)
  if (!item?.privilegeRows?.length) return []
  return item.privilegeRows.map((row) => ({
    id: row.id,
    name: row.name,
    value: row.value,
    unlocked: Boolean(row.unlocked),
  }))
}

function buildPrivilegeSection(previewLevel) {
  const cfg = getVipActivitySync()
  const { vipMin, vipMax } = getLevelRange()
  const level = Math.max(vipMin, Math.min(vipMax, parseInt(previewLevel, 10) || vipMin))
  return {
    sectionTitle: cfg.sectionTitle,
    sectionSubtitle: resolveTemplate(cfg.sectionSubtitleTemplate, {
      level,
      levelTag: levelTag(level),
      unlockLevel: level,
      amount: 0,
      discount: '',
      nextTag: '',
      remain: 0,
      consumeLabel: cfg.consumeLabel,
    }),
    privilegeRows: getPrivilegesForLevel(level),
  }
}

module.exports = {
  ensureVipActivity,
  getVipActivitySync,
  levelTag,
  resolveTemplate,
  getCumulativeThreshold,
  getUpgradeTarget,
  getPrivilegesForLevel,
  buildPrivilegeSection,
}
