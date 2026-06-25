/**
 * 服务端业务数据缓存：商品 / 分类 / 订单 / 打手
 */
const { request } = require('./request')

let products = []
let subCategories = {}
let orders = []
let handlers = []

let catalogTask = null
let ordersTask = null
let handlersTask = null

function resetCatalogTask() {
  catalogTask = null
}

function resetOrdersTask() {
  ordersTask = null
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

async function refreshOrders(userId) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : ''
  const res = await request(`/orders${query}`)
  orders = res.items || []
  return orders
}

function ensureOrders(userId) {
  ordersTask = refreshOrders(userId).catch((err) => {
    ordersTask = null
    throw err
  })
  return ordersTask
}

async function refreshHandlers() {
  const res = await request('/handlers')
  handlers = res.items || []
  return handlers
}

function ensureHandlers() {
  if (!handlersTask) {
    handlersTask = refreshHandlers().catch((err) => {
      handlersTask = null
      throw err
    })
  }
  return handlersTask
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

function listOrders() {
  return orders
}

function getOrderById(id) {
  return orders.find((item) => item.id === id) || null
}

async function createOrder(payload) {
  const order = await request('/orders', {
    method: 'POST',
    body: payload,
  })
  orders.unshift(order)
  return order
}

function listHandlers() {
  return handlers
}

function getHandlerById(id) {
  return handlers.find((item) => item.id === id) || null
}

function getHandlerByName(name) {
  return handlers.find((item) => item.name === name) || null
}

module.exports = {
  ensureCatalog,
  ensureOrders,
  ensureHandlers,
  refreshCatalog,
  refreshOrders,
  refreshHandlers,
  resetCatalogTask,
  resetOrdersTask,
  getProducts,
  getSubCategories,
  getProductById,
  getProductDetail,
  getProductsByServiceType,
  getProductsByCategory,
  searchProducts,
  listOrders,
  getOrderById,
  createOrder,
  listHandlers,
  getHandlerById,
  getHandlerByName,
}
