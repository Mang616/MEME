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

function buildHomePageState(activeType, bannerList, previousBanners = [], previousProducts = []) {
  const homeState = buildHomeState(activeType)
  return withMinorNotice({
    ...homeState,
    products: mergeCoverLoadedState(homeState.products, previousProducts),
    ...buildHomeBannerState(bannerList, previousBanners),
  })
}

/**
 * 并行拉取商品目录与 Banner；单项失败不阻断页面渲染。
 * @param {{ refresh?: boolean, forceBanners?: boolean }} options
 */
async function fetchHomeRemoteData(api, { refresh = false, forceBanners = false } = {}) {
  const catalogTask = refresh ? api.refreshCatalog() : api.ensureCatalog()
  const [catalogResult, bannerResult] = await Promise.allSettled([
    catalogTask,
    loadHomeBanners(api, { force: refresh || forceBanners }),
  ])

  if (catalogResult.status === 'rejected') {
    console.warn(
      `[home] catalog ${refresh ? 'refresh' : 'load'} failed`,
      catalogResult.reason?.message,
    )
  }

  return bannerResult.status === 'fulfilled' ? bannerResult.value : api.getBanners()
}

async function refreshHomePage(api, activeType, previousBanners = [], previousProducts = []) {
  const bannerList = await fetchHomeRemoteData(api, { refresh: true })
  return buildHomePageState(activeType, bannerList, previousBanners, previousProducts)
}

async function loadHomePageData(api, activeType, options = {}) {
  const { forceBanners = false, previousBanners = [], previousProducts = [] } = options
  const bannerList = await fetchHomeRemoteData(api, { forceBanners })
  return buildHomePageState(activeType, bannerList, previousBanners, previousProducts)
}

function buildCatalogState(serviceType) {
  return withMinorNotice(buildHomeState(serviceType))
}

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
  buildHomePageState,
  syncHomeProducts,
  loadHomeAnnouncement,
  loadHomePageData,
  refreshHomePage,
  minorOrderNotice,
}
