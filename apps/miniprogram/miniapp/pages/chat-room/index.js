const themedPage = require('../../behaviors/themed-page')
const {
  buildChatRoomState,
  addTextMessage,
  addOrderMessage,
} = require('../../utils/chat-page')
const { markConversationReadAndSync } = require('../../utils/chat-tab-badge')
const { showTip } = require('../../utils/ui')

Page({
  behaviors: themedPage,

  data: {
    conversation: null,
    messages: [],
    canSendOrder: false,
    orderPickerItems: [],
    orderPickerVisible: false,
    inputPlaceholder: '',
    draft: '',
    scrollIntoView: '',
  },

  onLoad(options) {
    const state = buildChatRoomState(options.id)
    if (!state.conversation) {
      showTip('会话不存在')
      setTimeout(() => wx.navigateBack(), 600)
      return
    }
    this._conversationId = options.id
    markConversationReadAndSync(options.id)
    this.setData(state, () => this.scrollToBottom())
  },

  scrollToBottom() {
    const { messages } = this.data
    if (!messages.length) return
    const last = messages[messages.length - 1]
    this.setData({ scrollIntoView: `msg-${last.id}` })
  },

  onInput(e) {
    this.setData({ draft: e.detail.value })
  },

  onSendText() {
    const { draft } = this.data
    const msg = addTextMessage(this._conversationId, draft)
    if (!msg) return
    this.setData({
      messages: [...this.data.messages, msg],
      draft: '',
    }, () => this.scrollToBottom())
  },

  onOpenOrderPicker() {
    if (!this.data.canSendOrder) return
    this.setData({ orderPickerVisible: true })
  },

  onCloseOrderPicker() {
    this.setData({ orderPickerVisible: false })
  },

  onPickOrder(e) {
    const { id } = e.currentTarget.dataset
    const orderItem = this.data.orderPickerItems.find((o) => o.id === id)
    if (!orderItem) return
    const msg = addOrderMessage(this._conversationId, orderItem)
    if (!msg) return
    this.setData({
      orderPickerVisible: false,
      messages: [...this.data.messages, msg],
    }, () => {
      this.scrollToBottom()
      showTip('已发送订单，客服将联系打手', 'success')
    })
  },

  preventClose() {},
})
