/**
 * 聊天 mock — 后续由 IM / WebSocket API 替换
 */
const { CHAT_TYPE } = require('../constants')
const { ESCORT_LEVEL } = require('../escort-level')

const INITIAL_CONVERSATIONS = [
  {
    id: 'chat_service',
    type: CHAT_TYPE.SERVICE,
    name: '迷因官方客服',
    roleLabel: '平台客服',
    avatarText: '客',
    avatarColor: '#3d5240',
    lastMessage: '收到，已为您联系打手处理',
    lastTime: '15:20',
    unread: 1,
    online: true,
  },
  {
    id: 'chat_player_1',
    type: CHAT_TYPE.PLAYER,
    name: '魔王s 贰拾',
    roleLabel: '服务打手',
    escortLevel: ESCORT_LEVEL.DEMON,
    avatarText: '魔',
    avatarColor: '#4a5f52',
    linkedOrderId: 'D_260524154235_231533',
    lastMessage: '今晚 8 点可以开局，您方便吗？',
    lastTime: '14:52',
    unread: 0,
    online: true,
  },
  {
    id: 'chat_player_2',
    type: CHAT_TYPE.PLAYER,
    name: '阿凯',
    roleLabel: '服务打手',
    escortLevel: ESCORT_LEVEL.ACE,
    avatarText: '凯',
    avatarColor: '#3a4540',
    linkedOrderId: 'D_260520180000_998877',
    lastMessage: '订单已完成，欢迎评价～',
    lastTime: '昨天',
    unread: 0,
    online: false,
  },
]

/** @type {typeof INITIAL_CONVERSATIONS} */
let conversations = INITIAL_CONVERSATIONS.map((item) => ({ ...item }))

const MESSAGES = {
  chat_service: [
    {
      id: 'm1',
      from: 'other',
      type: 'text',
      content: '您好，我是迷因电竞客服，有什么可以帮您？',
      time: '14:30',
    },
    {
      id: 'm2',
      from: 'self',
      type: 'text',
      content: '我有一单想催一下打手',
      time: '14:32',
    },
    {
      id: 'm3',
      from: 'other',
      type: 'text',
      content: '您可以直接发送订单卡片，我会联系对应打手',
      time: '14:33',
    },
    {
      id: 'm4',
      from: 'other',
      type: 'text',
      content: '收到，已为您联系打手处理',
      time: '15:20',
    },
  ],
  chat_player_1: [
    {
      id: 'p1',
      from: 'other',
      type: 'text',
      content: '老板好，我是您这单的护航打手魔王',
      time: '14:10',
    },
    {
      id: 'p2',
      from: 'self',
      type: 'text',
      content: '好的，大概什么时候开始？',
      time: '14:15',
    },
    {
      id: 'p3',
      from: 'other',
      type: 'text',
      content: '今晚 8 点可以开局，您方便吗？',
      time: '14:52',
    },
  ],
  chat_player_2: [
    {
      id: 'p4',
      from: 'other',
      type: 'text',
      content: '绝密单已撤离成功',
      time: '昨天 18:00',
    },
    {
      id: 'p5',
      from: 'other',
      type: 'text',
      content: '订单已完成，欢迎评价～',
      time: '昨天 18:05',
    },
  ],
}

function listConversations() {
  return conversations
}

function getTotalUnreadCount() {
  return conversations.reduce((sum, item) => sum + (Number(item.unread) || 0), 0)
}

function markConversationRead(conversationId) {
  const item = conversations.find((c) => c.id === conversationId)
  if (!item) return false
  if (item.unread > 0) {
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
  return MESSAGES[conversationId] ? [...MESSAGES[conversationId]] : []
}

function appendMessage(conversationId, message) {
  if (!MESSAGES[conversationId]) MESSAGES[conversationId] = []
  MESSAGES[conversationId].push(message)
}

module.exports = {
  listConversations,
  getTotalUnreadCount,
  markConversationRead,
  markAllConversationsRead,
  getConversationById,
  getMessages,
  appendMessage,
}
