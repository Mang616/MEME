/**
 * 商品目录状态组装（首页 / 商品 Tab / 搜索共用 API 缓存）
 */
const { SERVICE_TYPES } = require('./catalog-meta')
const repository = require('./api/repository')
const { normalizeTabs } = require('./line-tabs')
const { mapProductForDisplay } = require('./format')

function getServiceTypeTabs() {
  return normalizeTabs(SERVICE_TYPES)
}

function resolveSubCategoryId(serviceTypeId, subCategoryId, subCategories) {
  const list = subCategories || repository.getSubCategories()[serviceTypeId] || []
  return subCategoryId || list[0]?.id || ''
}

function enrichSubCategories(serviceTypeId, subCategories) {
  return (subCategories || []).map((sub) => {
    const count = repository.getProductsByCategory(serviceTypeId, sub.id).length
    return { ...sub, count }
  })
}

function getSubCategoryName(subCategories, subCategoryId) {
  const hit = (subCategories || []).find((item) => item.id === subCategoryId)
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

function mapProductsForList(list) {
  return (list || []).map(mapProductForDisplay)
}

function buildHomeState(serviceTypeId) {
  return {
    serviceTypes: getServiceTypeTabs(),
    activeType: serviceTypeId,
    products: mapProductsForList(repository.getProductsByServiceType(serviceTypeId)),
  }
}

function buildProductsPageState(serviceTypeId, subCategoryId) {
  const rawSubs = repository.getSubCategories()[serviceTypeId] || []
  const subCategories = enrichSubCategories(serviceTypeId, rawSubs)
  const activeSubCategoryId = resolveSubCategoryId(
    serviceTypeId,
    subCategoryId,
    subCategories,
  )
  const products = mapProductsForList(
    repository.getProductsByCategory(serviceTypeId, activeSubCategoryId),
  )

  return {
    serviceTypes: getServiceTypeTabs(),
    activeType: serviceTypeId,
    subCategories,
    activeSubCategoryId,
    activeSubCategoryName: getSubCategoryName(subCategories, activeSubCategoryId),
    products,
    ...buildListMeta(products),
  }
}

function buildProductsPageSlice(serviceTypeId, subCategoryId, subCategories) {
  const products = mapProductsForList(
    repository.getProductsByCategory(serviceTypeId, subCategoryId),
  )

  return {
    activeSubCategoryId: subCategoryId,
    activeSubCategoryName: getSubCategoryName(subCategories, subCategoryId),
    products,
    ...buildListMeta(products),
  }
}

function buildSearchPageState(keyword = '') {
  const trimmed = String(keyword || '').trim()
  const products = mapProductsForList(repository.searchProducts(trimmed))

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
  mapProductsForList,
  buildHomeState,
  buildProductsPageState,
  buildProductsPageSlice,
  buildSearchPageState,
}
