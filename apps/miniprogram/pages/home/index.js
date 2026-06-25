const themedPage = require('../../behaviors/themed-page')
const { storeName, brandLogo } = require('../../utils/config')
const { buildHomeState } = require('../../utils/catalog')
const { SERVICE_TYPE } = require('../../utils/constants')
const { getTabChangeId } = require('../../utils/line-tabs')
const {
  enrichBanners,
  buildHomeBannerMeta,
  markBannerImageReady,
  markBannerImageFailed,
} = require('../../utils/home-banner')
const {
  followBannerLink,
  openProductFromEvent,
} = require('../../utils/nav')
const {
  isMinorNoticeDismissed,
  confirmMinorAge,
} = require('../../utils/minor-notice')
const { showMockFeature, showTip } = require('../../utils/ui')
const { runPullRefresh, getPullRefresh } = require('../../utils/pull-refresh')
const { withCatalog } = require('../../utils/page-data')
const api = require('../../utils/api/index')

const initialBanners = enrichBanners()

Page({
  behaviors: themedPage,

  data: {
    storeName,
    brandLogo,
    ...buildHomeBannerMeta(initialBanners),
    banners: initialBanners,
    serviceTypes: [],
    activeType: SERVICE_TYPE.ESCORT,
    products: [],
    showMinorNotice: true,
  },

  onLoad() {
    withCatalog(() => {
      this.setData({
        ...buildHomeState(SERVICE_TYPE.ESCORT),
        showMinorNotice: !isMinorNoticeDismissed(),
      })
    })
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
    if (!followBannerLink(banner)) {
      showTip(banner.title)
    }
  },

  onTabChange(e) {
    const id = getTabChangeId(e, this.data.activeType)
    if (!id) return
    this.setData(buildHomeState(id))
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
      api.refreshCatalog().then(() => {
        const banners = enrichBanners()
        this.setData({
          ...buildHomeState(this.data.activeType),
          ...buildHomeBannerMeta(banners),
          banners,
        })
      }),
    )
  },
})
