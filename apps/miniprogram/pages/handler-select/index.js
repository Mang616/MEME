const themedPage = require('../../behaviors/themed-page')
const { getTabChangeId, FILTER_ALL } = require('../../utils/line-tabs')
const { buildHandlerSelectState } = require('../../utils/handler-select-page')
const { setHandlerSelection } = require('../../utils/handler-selection')
const { withHandlers } = require('../../utils/page-data')

Page({
  behaviors: themedPage,

  data: {
    filterTabs: [],
    activeFilter: FILTER_ALL,
    handlers: [],
    selectedId: '',
    resultCount: 0,
    emptyText: '',
    emptyHint: '',
  },

  onLoad(options) {
    const selectedId = options && options.selectedId ? options.selectedId : ''
    withHandlers(() => {
      this.setData(buildHandlerSelectState(selectedId))
    })
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
