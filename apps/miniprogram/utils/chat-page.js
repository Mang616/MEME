/**
 * 聊天列表 / 聊天室状态组装
 */
const { CHAT_TYPE, getChatTypeLabel } = require('./constants')
const { listOrders, refreshOrders } = require('./api/repository')
const auth = require('./auth')
const {
  ensureLoaded,
  ensureMessages,
  listConversations,
  getConversationById,
  getMessages,
  appendMessage,
  markAllConversationsRead,
} = require('./chat-store')
const { FILTER_ALL } = require('./line-tabs')
const { formatTimeHm, formatCountBadge, formatOnlineStatus } = require('./format')
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
    closedText: item.closedAt ? '已结束' : '',
  }
}

function enrichChatRoomConversation(raw) {
  return {
    ...raw,
    ...conversationLevelFields(raw),
    typeLabel: getChatTypeLabel(raw.type, 'room'),
    onlineText: raw.closedAt ? '会话已结束' : formatOnlineStatus(raw.online),
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

async function prepareChatPage(filterId = FILTER_ALL) {
  await ensureLoaded()
  return initChatPage(filterId)
}

async function refreshChatFromApi(filterId = FILTER_ALL) {
  const { refreshFromApi } = require('./chat-store')
  await refreshFromApi()
  return initChatPage(filterId)
}

async function loadChatRoomState(conversationId) {
  await ensureLoaded()
  await ensureMessages(conversationId)
  const raw = getConversationById(conversationId)
  if (raw?.type === CHAT_TYPE.SERVICE && auth.isLoggedIn()) {
    await refreshOrders()
  }
  return buildChatRoomState(conversationId)
}

function buildChatRoomState(conversationId) {
  const raw = getConversationById(conversationId)
  if (!raw) {
    return {
      conversation: null,
      messages: [],
      canSendOrder: false,
      canSendText: false,
      orderPickerItems: [],
      inputPlaceholder: '',
    }
  }

  const isService = raw.type === CHAT_TYPE.SERVICE
  const isClosed = Boolean(raw.closedAt)
  const ownerUserId = auth.getUser()?.userId
  const ownOrders = isService && ownerUserId
    ? listOrders().filter((order) => order.ownerUserId === ownerUserId)
    : []
  return {
    conversation: enrichChatRoomConversation(raw),
    messages: getMessages(conversationId).map(enrichMessage),
    canSendOrder: isService && !isClosed,
    canSendText: !isClosed,
    orderPickerItems: isService && !isClosed ? buildOrderPickerList(ownOrders) : [],
    orderPickerVisible: false,
    inputPlaceholder: isClosed
      ? '会话已结束，仅可查看记录'
      : isService
        ? '输入消息，或发送订单给客服'
        : '输入消息',
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
  if (!text) return Promise.resolve(null)
  return require('./chat-store')
    .sendTextMessage(conversationId, text)
    .then((message) => (message ? enrichMessage(message) : null))
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
  initChatPage,
  prepareChatPage,
  refreshChatFromApi,
  buildChatListSlice,
  applyChatListToPage,
  markAllConversationsAsRead,
  buildChatRoomState,
  loadChatRoomState,
  addTextMessage,
  addOrderMessage,
}
