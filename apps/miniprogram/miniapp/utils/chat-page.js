/**
 * 聊天列表 / 聊天室状态组装
 */
const { CHAT_TYPE, getChatTypeLabel } = require('./constants')
const { listOrders } = require('./mock/orders')
const {
  listConversations,
  getConversationById,
  getMessages,
  appendMessage,
  markAllConversationsRead,
} = require('./mock/chats')
const { FILTER_ALL } = require('./line-tabs')
const { formatTimeHm, formatCountBadge } = require('./format')
const { withEscortLevelDisplay, EMPTY_LEVEL_FIELDS } = require('./escort-level')
const { syncChatTabBadge } = require('./chat-tab-badge')
const {
  buildOrderPickerList,
  buildOrderMessageCard,
} = require('./order-summary')
const { createFilterListHandlers } = require('./filter-list-page')

const CHAT_FILTER_TABS = [
  { id: FILTER_ALL, label: '全部' },
  { id: CHAT_TYPE.PLAYER, label: '打手' },
  { id: CHAT_TYPE.SERVICE, label: '客服' },
]

const EMPTY_HINT = {
  [FILTER_ALL]: '暂无会话，下单后可联系打手或客服',
  [CHAT_TYPE.PLAYER]: '暂无打手会话',
  [CHAT_TYPE.SERVICE]: '暂无客服会话',
}

const chatFilterApi = createFilterListHandlers({
  tabDefs: CHAT_FILTER_TABS,
  emptyHints: EMPTY_HINT,
  getGroupKey: (item) => item.type,
  getSourceItems: () => listConversations(),
  enrichItem: enrichConversation,
  fields: {
    active: 'activeFilter',
    tabs: 'filterTabs',
    list: 'conversations',
    hint: 'emptyHint',
  },
})

function conversationLevelFields(raw) {
  return raw.type === CHAT_TYPE.SERVICE
    ? EMPTY_LEVEL_FIELDS
    : withEscortLevelDisplay(raw)
}

function enrichConversation(item) {
  return {
    ...item,
    typeLabel: getChatTypeLabel(item.type, 'list'),
    ...conversationLevelFields(item),
    showUnread: item.unread > 0,
    unreadText: formatCountBadge(item.unread),
  }
}

function enrichChatRoomConversation(raw) {
  return {
    ...raw,
    ...conversationLevelFields(raw),
    typeLabel: getChatTypeLabel(raw.type, 'room'),
    onlineText: raw.online ? '在线' : '离线',
  }
}

function initChatPage(filterId = FILTER_ALL) {
  const { cache, pageData } = chatFilterApi.init(filterId)
  return { conversations: cache, pageData }
}

function buildChatListSlice(conversations, filterId = FILTER_ALL) {
  return chatFilterApi.buildSlice(conversations, filterId)
}

/**
 * 重新拉取会话列表写入页面并同步 Tab 角标（onShow / 一键已读 / 下拉刷新）
 */
function applyChatListToPage(page, cacheKey, filterId = FILTER_ALL) {
  const { conversations, pageData } = initChatPage(filterId)
  page[cacheKey] = conversations
  page.setData(pageData)
  syncChatTabBadge()
  return conversations
}

/** @returns {boolean} 是否有未读被清除 */
function markAllConversationsAsRead(page, cacheKey, filterId = FILTER_ALL) {
  if (!markAllConversationsRead()) return false
  applyChatListToPage(page, cacheKey, filterId)
  return true
}

function buildChatRoomState(conversationId) {
  const raw = getConversationById(conversationId)
  if (!raw) {
    return {
      conversation: null,
      messages: [],
      canSendOrder: false,
      orderPickerItems: [],
      inputPlaceholder: '',
    }
  }

  const isService = raw.type === CHAT_TYPE.SERVICE
  return {
    conversation: enrichChatRoomConversation(raw),
    messages: getMessages(conversationId).map(enrichMessage),
    canSendOrder: isService,
    orderPickerItems: isService ? buildOrderPickerList(listOrders()) : [],
    orderPickerVisible: false,
    inputPlaceholder: isService ? '输入消息，或发送订单给客服' : '输入消息',
    draft: '',
  }
}

function enrichMessage(msg) {
  const isSelf = msg.from === 'self'
  return {
    ...msg,
    isSelf,
    bubbleClass: isSelf ? 'chat-bubble--self' : 'chat-bubble--other',
    showOrder: msg.type === 'order' && !!msg.orderCard,
  }
}

function addTextMessage(conversationId, content) {
  const text = (content || '').trim()
  if (!text) return null

  const message = {
    id: `msg_${Date.now()}`,
    from: 'self',
    type: 'text',
    content: text,
    time: formatTimeHm(),
  }
  appendMessage(conversationId, message)
  return enrichMessage(message)
}

function addOrderMessage(conversationId, orderItem) {
  const orderCard = buildOrderMessageCard(orderItem)
  if (!orderCard) return null

  const message = {
    id: `order_${Date.now()}`,
    from: 'self',
    type: 'order',
    time: formatTimeHm(),
    orderCard,
  }
  appendMessage(conversationId, message)
  return enrichMessage(message)
}

module.exports = {
  CHAT_FILTER_TABS,
  initChatPage,
  buildChatListSlice,
  applyChatListToPage,
  markAllConversationsAsRead,
  buildChatRoomState,
  addTextMessage,
  addOrderMessage,
}
