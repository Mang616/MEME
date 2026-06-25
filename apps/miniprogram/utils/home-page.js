/**
 * 首页数据编排：商品 Tab + Banner + 合规公告
 */
const { buildHomeState } = require('./catalog')
const { minorOrderNotice } = require('./config')
const { buildHomeBannerState, loadHomeBanners } = require('./home-banner')
const { isMinorNoticeDismissed } = require('./minor-notice')

function pickAnnouncementText(items) {
  return items && items[0] && items[0].content ? items[0].content : ''
}

async function refreshHomePage(api, activeType) {
  const [, bannerList] = await Promise.all([
    api.refreshCatalog(),
    loadHomeBanners(api, { force: true }),
  ])
  return {
    ...buildHomeState(activeType),
    ...buildHomeBannerState(bannerList),
  }
}

function buildCatalogState(serviceType) {
  return {
    ...buildHomeState(serviceType),
    showMinorNotice: !isMinorNoticeDismissed(),
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
  buildHomeBannerState,
  buildCatalogState,
  loadHomeBanners,
  loadHomeAnnouncement,
  refreshHomePage,
  minorOrderNotice,
}
