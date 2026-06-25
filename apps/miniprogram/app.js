const { storeName } = require('./utils/config')
const theme = require('./utils/theme')
const auth = require('./utils/auth')
const priceFont = require('./utils/font')
const { syncChatTabBadge } = require('./utils/chat-tab-badge')
const api = require('./utils/api/index')

App({
  globalData: {
    storeName,
    theme: theme.DEFAULT_THEME,
    pendingServiceType: '',
    isLoggedIn: false,
    user: null,
  },

  onLaunch() {
    this.globalData.theme = theme.initTheme()
    this.globalData.isLoggedIn = auth.initAuth()
    priceFont.scheduleLoadPriceFont()
    syncChatTabBadge()
    api.warmup()
  },
})
