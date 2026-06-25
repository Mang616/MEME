/**
 * 服务端业务数据内存缓存（单飞 ensure + refresh）
 */
const { request } = require('./request')

function createResourceCache(fetcher, initial) {
  let data = initial
  let task = null

  return {
    get: () => data,
    set: (next) => {
      data = next
    },
    refresh: async (...args) => {
      data = await fetcher(...args)
      return data
    },
    ensure: (...args) => {
      if (!task) {
        task = fetcher(...args)
          .then((result) => {
            data = result
            return data
          })
          .catch((err) => {
            task = null
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

const ordersCache = createResourceCache(async (userId) => {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : ''
  const res = await request(`/orders${query}`)
  return res.items || []
}, [])

const handlersCache = createResourceCache(async () => {
  const res = await request('/handlers')
  return res.items || []
}, [])

const bannersCache = createResourceCache(async () => {
  const res = await request('/banners')
  return res.items || []
}, [])

function resetCatalogTask() {
  catalogTask = null
}

async function refreshCatalog() {
  const [catalog, productList] = await Promise.all([
    request('/catalog'),
    request('/products'),
  ])
  subCategories = catalog.subCategories || {}
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

module.exports = {
  ensureCatalog,
  ensureOrders: (userId) => ordersCache.ensure(userId),
  ensureHandlers: () => handlersCache.ensure(),
  ensureBanners: () => bannersCache.ensure(),
  refreshCatalog,
  refreshOrders: (userId) => ordersCache.refresh(userId),
  refreshHandlers: () => handlersCache.refresh(),
  refreshBanners: () => bannersCache.refresh(),
  refreshAnnouncements,
  resetCatalogTask,
  resetOrdersTask: () => ordersCache.resetTask(),
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
