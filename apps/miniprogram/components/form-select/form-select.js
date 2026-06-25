/** 表单选择行：标签 + 统一选择框（点击打开自定义弹层） */
Component({
  properties: {
    label: { type: String, value: '' },
    placeholder: { type: String, value: '请选择' },
    value: { type: String, value: '' },
    active: { type: Boolean, value: false },
    loading: { type: Boolean, value: false },
    disabled: { type: Boolean, value: false },
  },

  data: {
    displayText: '',
    isEmpty: true,
  },

  observers: {
    'value, placeholder, loading': function updateDisplay() {
      const { value, placeholder, loading } = this.properties
      const displayText = loading ? '加载中…' : value || placeholder
      this.setData({
        displayText,
        isEmpty: !loading && !value,
      })
    },
  },

  methods: {
    onTap() {
      if (this.properties.disabled || this.properties.loading) return
      this.triggerEvent('tap')
    },
  },
})
