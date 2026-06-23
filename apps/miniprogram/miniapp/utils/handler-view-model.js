/**
 * 打手展示与回传字段（选择页卡片、下单页已选展示共用）
 */
const { HANDLER_GENDER_LABEL } = require('./mock/handlers')
const { AVATAR_GENDER } = require('./profile-avatar')
const { withEscortLevelDisplay } = require('./escort-level')

function buildGenderMeta(gender) {
  return {
    genderLabel: HANDLER_GENDER_LABEL[gender] || '',
    genderClass:
      gender === AVATAR_GENDER.FEMALE
        ? 'handler-card__gender--female'
        : 'handler-card__gender--male',
  }
}

/** 选择打手列表卡片 */
function buildHandlerCardViewModel(raw, selectedId = '') {
  if (!raw) return null
  return {
    ...raw,
    ...withEscortLevelDisplay(raw),
    ...buildGenderMeta(raw.gender),
    selected: raw.id === selectedId,
    onlineText: raw.online ? '在线' : '离线',
  }
}

/** 子页回传创建订单页的最小字段集 */
function buildHandlerSelectionPayload(raw) {
  const card = buildHandlerCardViewModel(raw)
  if (!card) return null
  return {
    id: card.id,
    name: card.name,
    level: card.level,
    levelLabel: card.levelLabel,
    levelIcon: card.levelIcon,
    gender: card.gender,
    genderLabel: card.genderLabel,
    avatar: card.avatar || '',
  }
}

/** 写入 order-create 页 data */
function toOrderCreateHandlerFields(handler) {
  if (!handler) return {}
  return {
    handlerId: handler.id,
    handlerLabel: handler.name,
    handlerLevelLabel: handler.levelLabel || '',
    handlerLevelIcon: handler.levelIcon || '',
    handlerGenderLabel: handler.genderLabel || '',
  }
}

module.exports = {
  buildHandlerCardViewModel,
  buildHandlerSelectionPayload,
  toOrderCreateHandlerFields,
}
