/**
 * 我的
 */
const themedPage = require('../../behaviors/themed-page')
const theme = require('../../utils/theme')
const auth = require('../../utils/auth')
const { loadProfilePage, refreshProfilePage } = require('../../utils/profile-page')
const { TAB_ROUTES, PAGE_ROUTES } = require('../../utils/constants')
const {
  openLogin,
  openProfileEdit,
  openVipLevel,
  openAccount,
  openCoupons,
} = require('../../utils/nav')
const {
  dispatchProfileHelpTap,
  dispatchProfileMenuTap,
} = require('../../utils/profile-actions')
const { handleInviteTap } = require('../../utils/invite')

const PROFILE_REDIRECT = TAB_ROUTES.PROFILE

Page({
  behaviors: themedPage,

  data: {
    loggedIn: false,
    user: {},
    helpQuickEntries: [],
    menuItems: [],
    guideVisible: false,
    activeGuide: null,
  },

  onLoad() {
    void loadProfilePage().then((state) => this.setData(state))
  },
  onShow() {
    void refreshProfilePage(this).then((state) => this.setData(state))
  },

  onPullRefresh() {
    const pr = getPullRefresh(this, '#pullRefresh')
    runPullRefresh(pr, () => refreshProfilePage(this).then((state) => {
      this.setData(state)
    }))
  },

  onHeroTap() {
    if (!auth.requireLogin({ redirect: PROFILE_REDIRECT })) return
    openProfileEdit()
  },

  onLoginTap() {
    openLogin({ redirect: PROFILE_REDIRECT })
  },

  onAccountTap() {
    if (!auth.requireLogin({ redirect: PAGE_ROUTES.ACCOUNT })) return
    openAccount()
  },

  onCouponsTap() {
    if (!auth.requireLogin({ redirect: PAGE_ROUTES.COUPONS })) return
    openCoupons()
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
