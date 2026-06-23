/**
 * 选择打手页：Tab 筛选 + 列表视图模型
 */
const { HANDLER_FILTER_TABS, listHandlers } = require('./mock/handlers')
const { buildHandlerCardViewModel } = require('./handler-view-model')
const { AVATAR_GENDER } = require('./profile-avatar')
const { FILTER_ALL } = require('./line-tabs')

function matchesFilter(handler, filterId) {
  if (!filterId || filterId === FILTER_ALL) return true
  if (filterId === AVATAR_GENDER.MALE || filterId === AVATAR_GENDER.FEMALE) {
    return handler.gender === filterId
  }
  if (filterId === 'pc' || filterId === 'mobile') {
    return handler.region === filterId
  }
  if (filterId === 'escort' || filterId === 'companion') {
    return handler.serviceType === filterId
  }
  return false
}

function buildHandlerList(activeFilter, selectedId) {
  return listHandlers()
    .filter((item) => matchesFilter(item, activeFilter))
    .map((item) => buildHandlerCardViewModel(item, selectedId))
}

function buildHandlerSelectState(selectedId = '', activeFilter = FILTER_ALL) {
  const handlers = buildHandlerList(activeFilter, selectedId)
  return {
    filterTabs: HANDLER_FILTER_TABS,
    activeFilter,
    handlers,
    selectedId,
    resultCount: handlers.length,
    emptyText: '暂无符合条件的打手',
    emptyHint: '试试切换上方筛选',
  }
}

module.exports = {
  buildHandlerSelectState,
}
