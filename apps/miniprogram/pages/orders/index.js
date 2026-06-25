const themedPage = require('../../behaviors/themed-page')
const { FILTER_ALL } = require('../../utils/line-tabs')
const {
  initOrdersPage,
  buildOrdersSlice,
  dispatchOrderCardEvent,
} = require('../../utils/orders-page')
const {
  consumeOrdersListDirty,
  applyOrdersListToPage,
} = require('../../utils/orders-refresh')
const {
  mountFilterList,
  applyFilterTabChange,
  runCachedListPullRefresh,
} = require('../../utils/page-helpers')
const { withOrders } = require('../../utils/page-data')

const LIST_CACHE_KEY = '_orders'
const SCROLL_SELECTOR = '#orderList'

Page({
  behaviors: themedPage,

  data: {
    activeStatus: FILTER_ALL,
    statusTabs: [],
    orders: [],
    emptyHint: '',
  },

  onLoad() {
    withOrders(() => {
      mountFilterList(this, () => initOrdersPage(FILTER_ALL), {
        cacheKey: LIST_CACHE_KEY,
        pickCache: (r) => r.allOrders,
        pickPageData: (r) => r.pageData,
      })
    })
  },

  onShow() {
    if (!this[LIST_CACHE_KEY]) return
    if (!consumeOrdersListDirty()) return
    void applyOrdersListToPage(this, LIST_CACHE_KEY)
  },

  onTabChange(e) {
    applyFilterTabChange(this, e, {
      activeKey: 'activeStatus',
      cacheKey: LIST_CACHE_KEY,
      buildSlice: buildOrdersSlice,
    })
  },

  onOrderCardEvent(e) {
    dispatchOrderCardEvent(e.detail)
  },

  onPullRefresh() {
    runCachedListPullRefresh(this, {
      scrollSelector: SCROLL_SELECTOR,
      cacheKey: LIST_CACHE_KEY,
      reload: (page) => applyOrdersListToPage(page, LIST_CACHE_KEY),
    })
  },
})
