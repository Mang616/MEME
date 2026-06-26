const themedPage = require('../../behaviors/themed-page')
const {
  loadChatRoomState,
  addTextMessage,
  addOrderMessage,
  buildChatRoomState,
} = require('../../utils/chat-page')
const { markConversationReadAndSync } = require('../../utils/chat-tab-badge')
const { showNotFoundAndExit, showTip } = require('../../utils/ui')

Page({
  behaviors: themedPage,

  data: {
    conversation: null,
    messages: [],
    canSendOrder: false,
    canSendText: true,
    orderPickerItems: [],
    orderPickerVisible: false,
    inputPlaceholder: '',
    draft: '',
    scrollIntoView: '',
  },

  onLoad(options) {
    void loadChatRoomState(options.id).then((state) => {
      if (!state.conversation) {
        showNotFoundAndExit('会话不存在')
        return
      }
      this._conversationId = options.id
      markConversationReadAndSync(options.id)
      this.setData(state, () => this.scrollToBottom())
    })
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
    if (!this.data.canSendText) {
      showTip('会话已结束，仅可查看记录')
      return
    }
    const { draft } = this.data
    addTextMessage(this._conversationId, draft).then((msg) => {
      if (!msg) return
      this.setData({
        messages: [...this.data.messages, msg],
        draft: '',
      }, () => this.scrollToBottom())
    }).catch((err) => {
      if (err && err.code === 'CHAT_CLOSED') {
        this.setData(buildChatRoomState(this._conversationId))
        showTip('会话已结束，仅可查看记录')
        return
      }
      showTip('发送失败')
    })
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
