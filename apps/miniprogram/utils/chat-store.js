/**
 * 聊天会话内存态（列表/消息从 API 加载，发消息/已读持久化到服务端）
 */
const { request } = require('./api/request')

let conversations = []
let messagesByConv = {}
let loadTask = null

async function refreshFromApi() {
  const res = await request('/chats/conversations')
  conversations = (res.items || []).map((item) => ({ ...item }))
  messagesByConv = {}
  return conversations
}

function ensureLoaded() {
  if (!loadTask) {
    loadTask = refreshFromApi().catch((err) => {
      loadTask = null
      throw err
    })
  }
  return loadTask
}

async function ensureMessages(conversationId) {
  await ensureLoaded()
  if (messagesByConv[conversationId]) {
    return messagesByConv[conversationId]
  }
  const res = await request(`/chats/${encodeURIComponent(conversationId)}/messages`)
  const list = (res.items || []).map((item) => ({ ...item }))
  messagesByConv[conversationId] = list
  return list
}

async function ensureServiceConversation() {
  const conv = await request('/chats/service/ensure', { method: 'POST' })
  await ensureLoaded()
  const index = conversations.findIndex((item) => item.id === conv.id)
  if (index >= 0) {
    conversations[index] = { ...conversations[index], ...conv }
  } else {
    conversations.unshift(conv)
  }
  return conv
}

async function ensureOrderConversation(orderId) {
  const conv = await request(`/chats/by-order/${encodeURIComponent(orderId)}`)
  await ensureLoaded()
  const index = conversations.findIndex((item) => item.id === conv.id)
  if (index >= 0) {
    conversations[index] = { ...conversations[index], ...conv }
  } else {
    conversations.unshift(conv)
  }
  return conv
}

function listConversations() {
  return conversations
}

function getTotalUnreadCount() {
  return conversations.reduce((sum, item) => sum + (Number(item.unread) || 0), 0)
}

async function markConversationRead(conversationId) {
  const item = conversations.find((c) => c.id === conversationId)
  try {
    await request(`/chats/${encodeURIComponent(conversationId)}/read`, { method: 'POST' })
  } catch (err) {
    /* 忽略已读同步失败 */
  }
  if (item && item.unread > 0) {
    item.unread = 0
    return true
  }
  return false
}

function markAllConversationsRead() {
  let changed = false
  conversations.forEach((item) => {
    if (item.unread > 0) {
      item.unread = 0
      changed = true
    }
  })
  return changed
}

function getConversationById(id) {
  return conversations.find((c) => c.id === id) || null
}

function getMessages(conversationId) {
  return messagesByConv[conversationId] ? [...messagesByConv[conversationId]] : []
}

async function appendMessage(conversationId, message) {
  if (!messagesByConv[conversationId]) messagesByConv[conversationId] = []
  messagesByConv[conversationId].push(message)
  const conv = conversations.find((c) => c.id === conversationId)
  if (conv) {
    conv.lastMessage = message.content || conv.lastMessage
    conv.lastTime = message.time || conv.lastTime
  }
}

async function sendTextMessage(conversationId, content) {
  const text = String(content || '').trim()
  if (!text) return null
  try {
    const message = await request(`/chats/${encodeURIComponent(conversationId)}/messages`, {
      method: 'POST',
      body: { content: text },
    })
    await appendMessage(conversationId, message)
    return message
  } catch (err) {
    const message = err instanceof Error ? err.message : ''
    if (message.includes('会话已结束')) {
      const conv = conversations.find((c) => c.id === conversationId)
      if (conv) conv.closedAt = conv.closedAt || 'closed'
      const closedErr = new Error('CHAT_CLOSED')
      closedErr.code = 'CHAT_CLOSED'
      throw closedErr
    }
    throw err
  }
}

function resetChatStore() {
  conversations = []
  messagesByConv = {}
  loadTask = null
}

module.exports = {
  ensureLoaded,
  ensureMessages,
  ensureServiceConversation,
  ensureOrderConversation,
  refreshFromApi,
  listConversations,
  getTotalUnreadCount,
  markConversationRead,
  markAllConversationsRead,
  getConversationById,
  getMessages,
  appendMessage,
  sendTextMessage,
  resetChatStore,
}
