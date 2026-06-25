const themedPage = require('../../behaviors/themed-page')
const { FILTER_ALL } = require('../../utils/line-tabs')
const {
  initChatPage,
  buildChatListSlice,
  applyChatListToPage,
  markAllConversationsAsRead,
} = require('../../utils/chat-page')
const { openChatRoom } = require('../../utils/nav')
const {
  mountFilterList,
  applyFilterTabChange,
  runCachedListPullRefresh,
} = require('../../utils/page-helpers')
const { CHAT_ASSETS } = require('../../utils/constants')
const { showTip } = require('../../utils/ui')

const LIST_CACHE_KEY = '_conversations'
const SCROLL_SELECTOR = '#chatList'

Page({
  behaviors: themedPage,

  data: {
    activeFilter: FILTER_ALL,
    filterTabs: [],
    conversations: [],
    emptyHint: '',
    clearReadIcon: CHAT_ASSETS.CLEAR_READ,
  },

  onLoad() {
    mountFilterList(this, () => initChatPage(FILTER_ALL), {
      cacheKey: LIST_CACHE_KEY,
      pickCache: (r) => r.conversations,
      pickPageData: (r) => r.pageData,
    })
  },

  onShow() {
    applyChatListToPage(this, LIST_CACHE_KEY, this.data.activeFilter || FILTER_ALL)
  },

  onTabChange(e) {
    applyFilterTabChange(this, e, {
      activeKey: 'activeFilter',
      cacheKey: LIST_CACHE_KEY,
      buildSlice: buildChatListSlice,
    })
  },

  onConversationTap(e) {
    const { id } = e.detail || {}
    if (id) openChatRoom(id)
  },

  onMarkAllRead() {
    const filterId = this.data.activeFilter || FILTER_ALL
    if (!markAllConversationsAsRead(this, LIST_CACHE_KEY, filterId)) {
      showTip('暂无未读消息')
      return
    }
    showTip('已全部标为已读', 'success')
  },

  onPullRefresh() {
    runCachedListPullRefresh(this, {
      scrollSelector: SCROLL_SELECTOR,
      cacheKey: LIST_CACHE_KEY,
      reload: (page) =>
        applyChatListToPage(page, LIST_CACHE_KEY, page.data.activeFilter),
    })
  },
})
