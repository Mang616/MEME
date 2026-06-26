/**
 * 订单 / 聊天等：line-tabs + 可滚动列表 + 统一空态
 */
Component({
  options: {
    multipleSlots: true,
  },

  properties: {
    tabs: { type: Array, value: [] },
    activeId: { type: String, value: 'all' },
    mode: { type: String, value: 'scroll' },
    showEmpty: { type: Boolean, value: false },
    emptyText: { type: String, value: '暂无数据' },
    emptyHint: { type: String, value: '' },
  },

  methods: {
    onTabChange(e) {
      this.triggerEvent('tabchange', e.detail)
    },

    onPullRefresh() {
      this.triggerEvent('refresh')
    },
  },
})
