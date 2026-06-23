/**
 * 护航等级：魔王 / 王牌 / 新锐（图标与展示字段）
 */
const ESCORT_LEVEL = {
  DEMON: 'demon',
  ACE: 'ace',
  ROOKIE: 'rookie',
}

const ESCORT_LEVEL_DEFS = {
  [ESCORT_LEVEL.DEMON]: {
    id: ESCORT_LEVEL.DEMON,
    label: '魔王',
    icon: '/assets/escort/demon.png',
    badgeClass: 'handler-card__level--demon',
  },
  [ESCORT_LEVEL.ACE]: {
    id: ESCORT_LEVEL.ACE,
    label: '王牌',
    icon: '/assets/escort/ace.png',
    badgeClass: 'handler-card__level--ace',
  },
  [ESCORT_LEVEL.ROOKIE]: {
    id: ESCORT_LEVEL.ROOKIE,
    label: '新锐',
    icon: '/assets/escort/rookie.png',
    badgeClass: 'handler-card__level--rookie',
  },
}

const EMPTY_LEVEL_FIELDS = {
  level: '',
  levelLabel: '',
  levelIcon: '',
  levelClass: '',
  showLevelIcon: false,
}

function resolveEscortLevelDef(level) {
  return ESCORT_LEVEL_DEFS[level] || null
}

/**
 * 从打手/会话对象或等级 id 解析护航等级
 * @param {{ level?: string, escortLevel?: string, name?: string }|string} source
 */
function resolveEscortLevelId(source) {
  if (!source) return ''
  if (typeof source === 'string') return source
  if (source.escortLevel) return source.escortLevel
  if (source.level) return source.level
  if (source.name) {
    // 延迟加载，避免与 mock/handlers 循环依赖
    const { getHandlerByName } = require('./mock/handlers')
    const handler = getHandlerByName(source.name)
    return handler ? handler.level : ''
  }
  return ''
}

function enrichEscortLevel(level) {
  const def = resolveEscortLevelDef(level)
  if (!def) {
    return { ...EMPTY_LEVEL_FIELDS, level: level || '' }
  }
  return {
    level: def.id,
    levelLabel: def.label,
    levelIcon: def.icon,
    levelClass: def.badgeClass,
    showLevelIcon: true,
  }
}

/** 列表/卡片用：含 showLevelIcon */
function withEscortLevelDisplay(source) {
  return enrichEscortLevel(resolveEscortLevelId(source))
}

module.exports = {
  ESCORT_LEVEL,
  ESCORT_LEVEL_DEFS,
  resolveEscortLevelDef,
  resolveEscortLevelId,
  enrichEscortLevel,
  withEscortLevelDisplay,
  EMPTY_LEVEL_FIELDS,
}
