/**
 * 聊天 Tab 角标：汇总会话未读并同步到原生 tabBar
 */
const { TAB_ROUTES, TAB_ROUTE_LIST } = require('./constants')
const { formatCountBadge } = require('./format')
const {
  getTotalUnreadCount,
  markConversationRead,
} = require('./mock/chats')

function getChatTabIndex() {
  return TAB_ROUTE_LIST.indexOf(TAB_ROUTES.CHAT)
}

/** 根据当前会话未读总数更新/移除聊天 Tab 角标 */
function syncChatTabBadge() {
  const index = getChatTabIndex()
  if (index < 0) return

  const text = formatCountBadge(getTotalUnreadCount())
  if (!text) {
    wx.removeTabBarBadge({ index })
    return
  }

  wx.setTabBarBadge({ index, text })
}

/** 进入聊天室：清除该会话未读并刷新 Tab 角标 */
function markConversationReadAndSync(conversationId) {
  if (!conversationId) return false
  const changed = markConversationRead(conversationId)
  syncChatTabBadge()
  return changed
}

module.exports = {
  syncChatTabBadge,
  markConversationReadAndSync,
}
