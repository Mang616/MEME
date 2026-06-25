const themedPage = require('../../behaviors/themed-page')
const { FILTER_ALL } = require('../../utils/line-tabs')
const {
  prepareChatPage,
  refreshChatFromApi,
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
const { ensureLoaded } = require('../../utils/chat-store')

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
    this._chatReady = mountFilterList(this, () => prepareChatPage(FILTER_ALL), {
      cacheKey: LIST_CACHE_KEY,
      pickCache: (r) => r.conversations,
      pickPageData: (r) => r.pageData,
    }).catch((err) => {
      this._chatReady = null
      showTip(err.message || '会话加载失败')
    })
  },

  onShow() {
    const filterId = this.data.activeFilter || FILTER_ALL
    const ready = this._chatReady || ensureLoaded()
    void ready.then(() => {
      applyChatListToPage(this, LIST_CACHE_KEY, filterId)
    })
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
      waitFor: (page) => page._chatReady || ensureLoaded(),
      reload: (page) =>
        refreshChatFromApi(page.data.activeFilter).then(({ conversations, pageData }) => {
          page[LIST_CACHE_KEY] = conversations
          page.setData(pageData)
          return conversations
        }),
    })
  },
})
