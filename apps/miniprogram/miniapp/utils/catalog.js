/**
 * 商品目录状态组装（首页 / 商品 Tab / 全站搜索共用数据源）
 */
const { SERVICE_TYPES, SUB_CATEGORIES } = require('./mock/categories')
const { PRODUCTS, getProductsByServiceType, getProductsByCategory } = require('./mock/products')
const { normalizeTabs } = require('./line-tabs')
const { mapProductForDisplay } = require('./format')

/** 护航/陪玩 Tab（首页 service-panel、商品 Tab line-tabs 共用） */
function getServiceTypeTabs() {
  return normalizeTabs(SERVICE_TYPES)
}

function resolveSubCategoryId(serviceTypeId, subCategoryId, subCategories) {
  const list = subCategories || SUB_CATEGORIES[serviceTypeId] || []
  return subCategoryId || list[0]?.id || ''
}

/** 侧栏子分类附带商品数量 */
function enrichSubCategories(serviceTypeId, subCategories) {
  return (subCategories || []).map((sub) => {
    const count = getProductsByCategory(serviceTypeId, sub.id).length
    return { ...sub, count }
  })
}

function getSubCategoryName(subCategories, subCategoryId) {
  const hit = (subCategories || []).find((s) => s.id === subCategoryId)
  return hit ? hit.name : ''
}

function buildListMeta(products) {
  const count = (products || []).length
  return {
    productCount: count,
    listEmptyText: count ? '' : '该分类暂无商品',
    listEmptyHint: count ? '' : '试试切换左侧其他分类',
  }
}

/** 全站商品搜索（标题 / 描述 / 副标题） */
function searchAllProducts(keyword) {
  const q = String(keyword || '').trim().toLowerCase()
  if (!q) return []
  return PRODUCTS.filter((p) => {
    const haystack = [p.title, p.desc, p.heroTitle, p.heroSubtitle]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
}

function mapProductsForList(list) {
  return (list || []).map(mapProductForDisplay)
}

/** 首页：护航/陪玩 Tab + 商品网格 */
function buildHomeState(serviceTypeId) {
  return {
    serviceTypes: getServiceTypeTabs(),
    activeType: serviceTypeId,
    products: mapProductsForList(getProductsByServiceType(serviceTypeId)),
  }
}

/** 商品 Tab：切换护航/陪玩或初始化 */
function buildProductsPageState(serviceTypeId, subCategoryId) {
  const rawSubs = SUB_CATEGORIES[serviceTypeId] || []
  const subCategories = enrichSubCategories(serviceTypeId, rawSubs)
  const activeSubCategoryId = resolveSubCategoryId(
    serviceTypeId,
    subCategoryId,
    subCategories,
  )
  const products = mapProductsForList(
    getProductsByCategory(serviceTypeId, activeSubCategoryId),
  )
  const activeSubCategoryName = getSubCategoryName(subCategories, activeSubCategoryId)

  return {
    serviceTypes: getServiceTypeTabs(),
    activeType: serviceTypeId,
    subCategories,
    activeSubCategoryId,
    activeSubCategoryName,
    products,
    ...buildListMeta(products),
  }
}

/**
 * 商品 Tab：仅切换左侧子分类（subCategories 由页面缓存，避免重复 enrich）
 */
function buildProductsPageSlice(serviceTypeId, subCategoryId, subCategories) {
  const products = mapProductsForList(
    getProductsByCategory(serviceTypeId, subCategoryId),
  )

  return {
    activeSubCategoryId: subCategoryId,
    activeSubCategoryName: getSubCategoryName(subCategories, subCategoryId),
    products,
    ...buildListMeta(products),
  }
}

/** 全站搜索子页状态 */
function buildSearchPageState(keyword = '') {
  const trimmed = String(keyword || '').trim()
  const products = mapProductsForList(searchAllProducts(trimmed))

  return {
    keyword: trimmed,
    products,
    hasKeyword: trimmed.length > 0,
    resultCount: products.length,
    emptyText: trimmed ? '未找到相关商品' : '输入关键词搜索全部商品',
    resultHint: trimmed
      ? products.length
        ? `共 ${products.length} 件商品`
        : '试试其他关键词'
      : '',
  }
}

module.exports = {
  searchAllProducts,
  mapProductsForList,
  buildHomeState,
  buildProductsPageState,
  buildProductsPageSlice,
  buildSearchPageState,
}
