/**
 * 首页 Banner 视图模型（swiper 配置 + 图片加载态）
 */
const { enrichCoverMedia } = require('./cover-media')
const { resolveMediaIdentity } = require('./media-key')
const { mergeBannerLoadedState } = require('./merge-cover-state')
const { resolveBanners } = require('./offline-fallbacks')

const BANNER_PAGE_KEYS = [
  'bannerCount',
  'bannerShowDots',
  'bannerAutoplay',
  'bannerCircular',
  'banners',
]

function enrichBanner(raw, index) {
  const image = String(raw.image || '').trim()
  return {
    ...raw,
    index,
    ...enrichCoverMedia({ ...raw, image }, { imageKey: 'image', colorKey: 'bgColor' }),
    imageKey: resolveMediaIdentity(image, raw.imageRev),
  }
}

function buildHomeBannerMeta(banners) {
  const count = (banners || []).length
  const multi = count > 1
  return {
    bannerCount: count,
    bannerShowDots: multi,
    bannerAutoplay: multi,
    bannerCircular: multi,
  }
}

function patchBannerById(banners, id, patch) {
  return (banners || []).map((item) =>
    item.id === id ? { ...item, ...patch } : item,
  )
}

function markBannerImageReady(banners, id) {
  return patchBannerById(banners, id, { showImage: true })
}

function markBannerImageFailed(banners, id) {
  return patchBannerById(banners, id, { showImage: false })
}

/** 空列表或离线时回退本地 Banner；刷新时保留同媒体的 showImage 避免闪烁 */
function buildHomeBannerState(list, previous = []) {
  const banners = mergeBannerLoadedState(
    resolveBanners(list).map(enrichBanner),
    previous,
  )
  return { ...buildHomeBannerMeta(banners), banners }
}

function pickBannerFields(state) {
  const patch = {}
  for (const key of BANNER_PAGE_KEYS) {
    if (state[key] !== undefined) patch[key] = state[key]
  }
  return patch
}

async function loadHomeBanners(api, { force = false } = {}) {
  if (force) await api.refreshBanners()
  else await api.ensureBanners()
  return api.getBanners()
}

module.exports = {
  buildHomeBannerState,
  loadHomeBanners,
  pickBannerFields,
  markBannerImageReady,
  markBannerImageFailed,
}
