/** 底部选项弹层（替代原生 picker） */
Component({
  properties: {
    show: { type: Boolean, value: false },
    title: { type: String, value: '请选择' },
    options: { type: Array, value: [] },
    selectedId: { type: String, value: '' },
    emptyText: { type: String, value: '暂无可选项' },
    loading: { type: Boolean, value: false },
  },

  methods: {
    onClose() {
      this.triggerEvent('close')
    },

    onSelectItem(e) {
      const { id, index, disabled } = e.currentTarget.dataset
      if (disabled) {
        this.triggerEvent('reject', { id, index: Number(index) || 0 })
        return
      }
      this.triggerEvent('select', {
        id: id != null ? String(id) : '',
        index: Number(index) || 0,
      })
    },
  },
})
