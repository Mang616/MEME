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
    const serviceType = options && options.serviceType ? options.serviceType : ''
    withHandlers(() => {
      this.setData(buildHandlerSelectState(selectedId, FILTER_ALL, serviceType))
    })
  },

  onTabChange(e) {
    if (this.data.lockedServiceType) return
    const filterId = getTabChangeId(e, this.data.activeFilter)
    if (!filterId) return
    this.setData(buildHandlerSelectState(this.data.selectedId, filterId, this.data.lockedServiceType))
  },

  onSelect(e) {
    const { id } = e.currentTarget.dataset
    if (!id) return
    setHandlerSelection(id)
    wx.navigateBack()
  },
})
