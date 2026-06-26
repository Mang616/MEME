/**
 * 选择打手页：Tab 筛选 + 列表视图模型
 */
const repository = require('./api/repository')
const { buildHandlerCardViewModel } = require('./handler-view-model')
const { AVATAR_GENDER } = require('./profile-avatar')
const { FILTER_ALL } = require('./line-tabs')

const HANDLER_FILTER_TABS = [
  { id: 'all', label: '全部' },
  { id: 'male', label: '男生' },
  { id: 'female', label: '女生' },
  { id: 'pc', label: '端游' },
  { id: 'mobile', label: '手游' },
  { id: 'escort', label: '护航' },
  { id: 'companion', label: '陪玩' },
]

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
  return repository
    .listHandlers()
    .filter((item) => matchesFilter(item, activeFilter))
    .map((item) => buildHandlerCardViewModel(item, selectedId))
}

function buildHandlerSelectState(selectedId = '', activeFilter = FILTER_ALL, lockedServiceType = '') {
  const initialFilter =
    lockedServiceType === 'escort' || lockedServiceType === 'companion'
      ? lockedServiceType
      : activeFilter
  const handlers = buildHandlerList(initialFilter, selectedId)
  return {
    filterTabs: HANDLER_FILTER_TABS,
    activeFilter: initialFilter,
    lockedServiceType,
    handlers,
    selectedId,
    resultCount: handlers.length,
    emptyText: lockedServiceType === 'companion' ? '暂无符合条件的陪玩' : '暂无符合条件的打手',
    emptyHint: lockedServiceType ? '当前商品仅支持该类型服务者' : '试试切换上方筛选',
  }
}

module.exports = {
  buildHandlerSelectState,
}
