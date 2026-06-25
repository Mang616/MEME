const themedPage = require('../../behaviors/themed-page')
const { storeName, brandLogo } = require('../../utils/config')
const { SERVICE_TYPE } = require('../../utils/constants')
const { getTabChangeId } = require('../../utils/line-tabs')
const {
  markBannerImageReady,
  markBannerImageFailed,
  pickBannerFields,
} = require('../../utils/home-banner')
const {
  buildCatalogState,
  syncHomeProducts,
  loadHomePageData,
  loadHomeAnnouncement,
  refreshHomePage,
  minorOrderNotice,
} = require('../../utils/home-page')
const {
  followBannerLink,
  openProductFromEvent,
} = require('../../utils/nav')
const { confirmMinorAge } = require('../../utils/minor-notice')
const { showMockFeature, showTip } = require('../../utils/ui')
const { runPullRefresh, getPullRefresh } = require('../../utils/pull-refresh')
const { captureInviterFromQuery } = require('../../utils/invite-storage')
const api = require('../../utils/api/index')

Page({
  behaviors: themedPage,

  data: {
    storeName,
    brandLogo,
    bannerCount: 0,
    bannerShowDots: false,
    bannerAutoplay: false,
    bannerCircular: false,
    banners: [],
    serviceTypes: [],
    activeType: SERVICE_TYPE.ESCORT,
    products: [],
    showMinorNotice: true,
    minorNoticeText: minorOrderNotice,
  },

  applyHomeState(state, { bannersOnly = false } = {}) {
    if (bannersOnly) {
      if (state.bannerCount > 0) this.setData(pickBannerFields(state))
      return
    }
    this.setData(state)
  },

  loadHomeState({ bannersOnly = false } = {}) {
    if (bannersOnly && this.data.bannerCount > 0) return
    void loadHomePageData(api, this.data.activeType, {
      previousBanners: this.data.banners,
      previousProducts: this.data.products,
    })
      .then((state) => this.applyHomeState(state, { bannersOnly }))
      .catch((err) => {
        console.warn('[home] load failed', err)
      })
  },

  onLoad(options) {
    captureInviterFromQuery(options)
    this.loadHomeState()

    void loadHomeAnnouncement(api)
      .then((patch) => {
        if (Object.keys(patch).length) this.setData(patch)
      })
      .catch((err) => {
        console.warn('[home] announcement failed', err)
      })
  },

  onShow() {
    this.setData(syncHomeProducts(this.data.activeType, this.data.products))
    this.loadHomeState({ bannersOnly: true })
  },

  async onMinorNoticeClose() {
    const result = await confirmMinorAge()
    if (result === 'adult') {
      this.setData({ showMinorNotice: false })
      return
    }
    if (result === 'minor') {
      showTip('未成年人禁止下单')
    }
  },

  onBannerImageLoad(e) {
    const { id } = e.currentTarget.dataset
    if (!id) return
    this.setData({
      banners: markBannerImageReady(this.data.banners, id),
    })
  },

  onBannerImageError(e) {
    const { id } = e.currentTarget.dataset
    if (!id) return
    this.setData({
      banners: markBannerImageFailed(this.data.banners, id),
    })
  },

  onBannerTap(e) {
    const banner = this.data.banners[e.currentTarget.dataset.index]
    if (!banner) return
    followBannerLink(banner)
  },

  onTabChange(e) {
    const id = getTabChangeId(e, this.data.activeType)
    if (!id) return
    this.setData(buildCatalogState(id))
  },

  onProductTap(e) {
    openProductFromEvent(e)
  },

  onPromoTap() {
    showMockFeature('推广活动')
  },

  onPullRefresh() {
    const pr = getPullRefresh(this, '#pullRefresh')
    runPullRefresh(pr, () =>
      refreshHomePage(
        api,
        this.data.activeType,
        this.data.banners,
        this.data.products,
      ).then((state) => this.setData(state)),
    )
  },
})
