const themedPage = require('../../behaviors/themed-page')
const { getTabChangeId } = require('../../utils/line-tabs')
const { buildHandlerSelectState } = require('../../utils/handler-select-page')
const { setHandlerSelection } = require('../../utils/handler-selection')

Page({
  behaviors: themedPage,

  data: {
    filterTabs: [],
    activeFilter: 'all',
    handlers: [],
    selectedId: '',
    resultCount: 0,
    emptyText: '',
    emptyHint: '',
  },

  onLoad(options) {
    const selectedId = options && options.selectedId ? options.selectedId : ''
    this.setData(buildHandlerSelectState(selectedId))
  },

  onTabChange(e) {
    const filterId = getTabChangeId(e, this.data.activeFilter)
    if (!filterId) return
    this.setData(buildHandlerSelectState(this.data.selectedId, filterId))
  },

  onSelect(e) {
    const { id } = e.currentTarget.dataset
    if (!id) return
    setHandlerSelection(id)
    wx.navigateBack()
  },
})
