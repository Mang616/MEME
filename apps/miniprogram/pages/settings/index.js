const themedPage = require('../../behaviors/themed-page')
const auth = require('../../utils/auth')
const { PAGE_ROUTES, TAB_ROUTES } = require('../../utils/constants')
const { openLogin } = require('../../utils/nav')
const { showTip } = require('../../utils/ui')

Page({
  behaviors: themedPage,

  data: {
    loggedIn: false,
  },

  onShow() {
    this.setData({ loggedIn: auth.isLoggedIn() })
  },

  onLogin() {
    openLogin({ redirect: PAGE_ROUTES.SETTINGS })
  },

  async onLogout() {
    const done = await auth.confirmAndLogout()
    if (!done) return
    showTip('已退出登录')
    this.setData({ loggedIn: false })
    wx.reLaunch({ url: TAB_ROUTES.HOME })
  },
})
