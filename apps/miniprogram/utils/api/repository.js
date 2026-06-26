/**
 * 服务端业务数据内存缓存（单飞 ensure + refresh）
 */
const { request } = require('./request')
const { cloneFallbackBanners } = require('../offline-fallbacks')

function withCacheFallback(cache, label, task) {
  return task.catch((err) => {
    console.warn(`[repository] ${label}`, err.message)
    return cache.get()
  })
}

function createResourceCache(fetcher, initial) {
  let data = initial
  let task = null
  let generation = 0

  return {
    get: () => data,
    set: (next) => {
      data = next
      task = Promise.resolve(next)
    },
    refresh: async (...args) => {
      const gen = ++generation
      task = null
      const result = await fetcher(...args)
      if (gen === generation) {
        data = result
        task = Promise.resolve(result)
      }
      return gen === generation ? result : data
    },
    ensure: (...args) => {
      if (!task) {
        const gen = generation
        task = fetcher(...args)
          .then((result) => {
            if (gen === generation) {
              data = result
            }
            return gen === generation ? result : data
          })
          .catch((err) => {
            if (gen === generation) {
              task = null
            }
            throw err
          })
      }
      return task
    },
    resetTask: () => {
      task = null
    },
  }
}

let products = []
let subCategories = {}
let catalogTask = null

const { setProductTags } = require('../tag-class')

const ordersCache = createResourceCache(async () => {
  const auth = require('../auth')
  if (!auth.isLoggedIn()) return []
  const res = await request('/orders')
  return res.items || []
}, [])

const handlersCache = createResourceCache(async () => {
  const res = await request('/handlers')
  return res.items || []
}, [])

const bannersCache = createResourceCache(async () => {
  const res = await request('/banners')
  return res.items || []
}, cloneFallbackBanners())

function resetCatalogTask() {
  catalogTask = null
}

async function refreshCatalog() {
  catalogTask = null
  const [catalog, productList] = await Promise.all([
    request('/catalog'),
    request('/products'),
  ])
  subCategories = catalog.subCategories || {}
  setProductTags(catalog.productTags || [])
  products = productList.items || []
  return { products, subCategories }
}

function ensureCatalog() {
  if (!catalogTask) {
    catalogTask = refreshCatalog().catch((err) => {
      catalogTask = null
      throw err
    })
  }
  return catalogTask
}

function getProducts() {
  return products
}

function getSubCategories() {
  return subCategories
}

function getProductById(id) {
  return products.find((item) => item.id === id) || null
}

function getProductDetail(id) {
  const item = getProductById(id)
  return item ? { ...item } : null
}

function getProductsByServiceType(serviceType) {
  return products.filter((item) => item.serviceType === serviceType)
}

function getProductsByCategory(serviceType, categoryId) {
  return products.filter(
    (item) => item.serviceType === serviceType && item.categoryId === categoryId,
  )
}

function searchProducts(keyword) {
  const q = String(keyword || '').trim().toLowerCase()
  if (!q) return []
  return products.filter((item) => {
    const haystack = [item.title, item.desc, item.heroTitle, item.heroSubtitle]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

async function createOrder(payload) {
  const order = await request('/orders', {
    method: 'POST',
    body: payload,
  })
  ordersCache.set([order, ...ordersCache.get()])
  return order
}

async function refreshAnnouncements(placement) {
  const query = placement ? `?placement=${encodeURIComponent(placement)}` : ''
  const res = await request(`/announcements${query}`)
  return res.items || []
}

async function fetchProductReviews(productId) {
  return request(`/products/${encodeURIComponent(productId)}/reviews`)
}

module.exports = {
  ensureCatalog,
  ensureOrders: (userId) => ordersCache.ensure(userId),
  ensureHandlers: () => handlersCache.ensure(),
  ensureBanners: () => withCacheFallback(bannersCache, 'banners unavailable', bannersCache.ensure()),
  refreshCatalog,
  refreshOrders: (userId) => ordersCache.refresh(userId),
  refreshHandlers: () => handlersCache.refresh(),
  refreshBanners: () => withCacheFallback(bannersCache, 'banners refresh failed', bannersCache.refresh()),
  refreshAnnouncements,
  fetchProductReviews,
  resetCatalogTask,
  resetOrdersTask: () => ordersCache.resetTask(),
  clearOrdersCache: () => {
    ordersCache.set([])
    ordersCache.resetTask()
  },
  resetBannersTask: () => bannersCache.resetTask(),
  getProducts,
  getSubCategories,
  getProductById,
  getProductDetail,
  getProductsByServiceType,
  getProductsByCategory,
  searchProducts,
  listOrders: () => ordersCache.get(),
  getOrderById: (id) => ordersCache.get().find((item) => item.id === id) || null,
  createOrder,
  listHandlers: () => handlersCache.get(),
  getHandlerById: (id) => handlersCache.get().find((item) => item.id === id) || null,
  getHandlerByName: (name) => handlersCache.get().find((item) => item.name === name) || null,
  getBanners: () => bannersCache.get(),
}
