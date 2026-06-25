/**
 * 会话列表行（聊天 Tab）
 * @property {object} conversation
 * @fires tap detail.id
 */
Component({
  properties: {
    conversation: {
      type: Object,
      value: null,
    },
  },

  methods: {
    onTap() {
      const id = this.properties.conversation?.id
      if (id) this.triggerEvent('tap', { id })
    },
  },
})
