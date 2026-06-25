/**
 * 首页数据编排：商品 Tab + Banner + 合规公告
 */
const { buildHomeState } = require('./catalog')
const { minorOrderNotice } = require('./config')
const { buildHomeBannerState, loadHomeBanners } = require('./home-banner')
const { mergeCoverLoadedState } = require('./merge-cover-state')
const { isMinorNoticeDismissed } = require('./minor-notice')

function pickAnnouncementText(items) {
  return items && items[0] && items[0].content ? items[0].content : ''
}

function withMinorNotice(state) {
  return {
    ...state,
    showMinorNotice: !isMinorNoticeDismissed(),
  }
}

async function refreshHomePage(api, activeType, previousBanners = [], previousProducts = []) {
  const [catalogResult, bannerResult] = await Promise.allSettled([
    api.refreshCatalog(),
    loadHomeBanners(api, { force: true }),
  ])

  if (catalogResult.status === 'rejected') {
    throw catalogResult.reason
  }

  const bannerList =
    bannerResult.status === 'fulfilled' ? bannerResult.value : api.getBanners()

  const homeState = buildHomeState(activeType)
  return withMinorNotice({
    ...homeState,
    products: mergeCoverLoadedState(homeState.products, previousProducts),
    ...buildHomeBannerState(bannerList, previousBanners),
  })
}

async function loadHomePageData(api, activeType, options = {}) {
  const { forceBanners = false, previousBanners = [], previousProducts = [] } = options
  const [, bannerList] = await Promise.all([
    api.ensureCatalog(),
    loadHomeBanners(api, { force: forceBanners }),
  ])

  const homeState = buildHomeState(activeType)
  return withMinorNotice({
    ...homeState,
    products: mergeCoverLoadedState(homeState.products, previousProducts),
    ...buildHomeBannerState(bannerList, previousBanners),
  })
}

function buildCatalogState(serviceType) {
  return withMinorNotice(buildHomeState(serviceType))
}

/** 从 API 内存缓存重建首页商品（商品 Tab 刷新后回到首页可同步封面） */
function syncHomeProducts(activeType, previousProducts = []) {
  const homeState = buildHomeState(activeType)
  return {
    products: mergeCoverLoadedState(homeState.products, previousProducts),
  }
}

async function loadHomeAnnouncement(api) {
  try {
    const items = await api.refreshAnnouncements('home_bar')
    const text = pickAnnouncementText(items)
    return text ? { minorNoticeText: text } : {}
  } catch {
    return {}
  }
}

module.exports = {
  buildCatalogState,
  syncHomeProducts,
  loadHomeAnnouncement,
  loadHomePageData,
  refreshHomePage,
  minorOrderNotice,
}
