const { storeName } = require('./utils/config')
const theme = require('./utils/theme')
const auth = require('./utils/auth')
const priceFont = require('./utils/font')
const { syncChatTabBadge } = require('./utils/chat-tab-badge')

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
    // 勿直接写 loadPriceFont()，应走 priceFont.scheduleLoadPriceFont()
    priceFont.scheduleLoadPriceFont()
    syncChatTabBadge()
  },
})
