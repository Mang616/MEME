/**
 * 我的
 */
const themedPage = require('../../behaviors/themed-page')
const theme = require('../../utils/theme')
const auth = require('../../utils/auth')
const { initProfilePage, refreshProfilePage } = require('../../utils/profile-page')
const { TAB_ROUTES, PAGE_ROUTES } = require('../../utils/constants')
const {
  openLogin,
  openProfileEdit,
  openVipLevel,
} = require('../../utils/nav')
const {
  dispatchProfileHelpTap,
  dispatchProfileMenuTap,
} = require('../../utils/profile-actions')
const { handleInviteTap } = require('../../utils/invite')
const { runPullRefresh, getPullRefresh } = require('../../utils/pull-refresh')

const PROFILE_REDIRECT = TAB_ROUTES.PROFILE

Page({
  behaviors: themedPage,

  data: initProfilePage(),

  onShow() {
    this.setData(refreshProfilePage(this))
  },

  onPullRefresh() {
    const pr = getPullRefresh(this, '#pullRefresh')
    runPullRefresh(pr, () => {
      return new Promise((resolve) => {
        this.setData(refreshProfilePage(this), resolve)
      })
    })
  },

  onHeroTap() {
    if (!auth.requireLogin({ redirect: PROFILE_REDIRECT })) return
    openProfileEdit()
  },

  onLoginTap() {
    openLogin({ redirect: PROFILE_REDIRECT })
  },

  toggleBalance() {
    if (!auth.requireLogin({ redirect: PROFILE_REDIRECT })) return
    this.setData({ balanceVisible: !this.data.balanceVisible })
  },

  onVipLevelTap() {
    if (!auth.requireLogin({ redirect: PAGE_ROUTES.VIP_LEVEL })) return
    openVipLevel()
  },

  onInviteTap() {
    handleInviteTap(PROFILE_REDIRECT)
  },

  onHelpTap(e) {
    dispatchProfileHelpTap(this, e.currentTarget.dataset.id)
  },

  onMenuTap(e) {
    dispatchProfileMenuTap(e.currentTarget.dataset.id)
  },

  onGuideClose() {
    this.setData({ guideVisible: false, activeGuide: null })
  },

  onThemeChange(e) {
    const next = e.detail && e.detail.theme
    if (!next || next === this.data.theme) return
    theme.setTheme(next)
  },
})
