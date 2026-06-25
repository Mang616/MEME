const themedPage = require('../../behaviors/themed-page')
const { storeName, brandLogo } = require('../../utils/config')
const { SERVICE_TYPE } = require('../../utils/constants')
const { getTabChangeId } = require('../../utils/line-tabs')
const {
  markBannerImageReady,
  markBannerImageFailed,
} = require('../../utils/home-banner')
const {
  buildHomeBannerState,
  buildCatalogState,
  loadHomeBanners,
  loadHomeAnnouncement,
  refreshHomePage,
  minorOrderNotice,
} = require('../../utils/home-page')
const {
  followBannerLink,
  openProductFromEvent,
} = require('../../utils/nav')
const {
  confirmMinorAge,
} = require('../../utils/minor-notice')
const { showMockFeature, showTip } = require('../../utils/ui')
const { runPullRefresh, getPullRefresh } = require('../../utils/pull-refresh')
const { withCatalog } = require('../../utils/page-data')
const api = require('../../utils/api/index')

Page({
  behaviors: themedPage,

  data: {
    storeName,
    brandLogo,
    ...buildHomeBannerState(),
    serviceTypes: [],
    activeType: SERVICE_TYPE.ESCORT,
    products: [],
    showMinorNotice: true,
    minorNoticeText: minorOrderNotice,
  },

  onLoad() {
    void loadHomeBanners(api).then((list) => {
      this.setData(buildHomeBannerState(list))
    })

    withCatalog(() => {
      this.setData(buildCatalogState(SERVICE_TYPE.ESCORT))
    })

    void loadHomeAnnouncement(api).then((patch) => {
      if (Object.keys(patch).length) this.setData(patch)
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
      refreshHomePage(api, this.data.activeType).then((state) => this.setData(state)),
    )
  },
})
