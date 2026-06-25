/**
 * 顶栏下划线 Tab（样式见 styles/theme/line-tabs.wxss）
 *
 * @property {Array} tabs - { id, label|tabLabel, count?, showCount? }
 * @property {string} activeId - 当前选中 id
 * @property {string} mode - scroll（横向滚动）| evenly（等分）
 * @fires tabchange detail.id
 */
Component({
  properties: {
    tabs: {
      type: Array,
      value: [],
    },
    activeId: {
      type: String,
      value: '',
    },
    mode: {
      type: String,
      value: 'scroll',
    },
  },

  methods: {
    onTabTap(e) {
      const { id } = e.currentTarget.dataset
      if (!id || id === this.properties.activeId) return
      this.triggerEvent('tabchange', { id })
    },
  },
})
