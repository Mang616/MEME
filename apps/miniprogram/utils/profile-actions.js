/**
 * 「我的」页菜单与快捷入口动作映射
 */
const {
  openSettings,
  openAgreement,
  openPrivacy,
  openFeedback,
  openMinorGuide,
} = require('./nav')
const { presentGuideOnPage } = require('./guide-present')

const PROFILE_MENU_ACTIONS = {
  settings: () => openSettings(),
  agreement: () => openAgreement(),
  privacy: () => openPrivacy(),
  feedback: () => openFeedback(),
  minor: () => openMinorGuide(),
}

/** 帮助网格：统一打开 guide-modal（含客服二维码说明） */
function dispatchProfileHelpTap(page, entryId) {
  return presentGuideOnPage(page, entryId)
}

function dispatchProfileMenuTap(entryId) {
  const action = PROFILE_MENU_ACTIONS[entryId]
  if (!action) return false
  action()
  return true
}

module.exports = {
  PROFILE_MENU_ACTIONS,
  dispatchProfileHelpTap,
  dispatchProfileMenuTap,
}
