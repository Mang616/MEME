/**
 * 商品 Tab 页状态（唯一入口，内部调用 catalog）
 */
const { SERVICE_TYPES } = require('./catalog-meta')
const {
  buildProductsPageState,
  buildProductsPageSlice,
} = require('./catalog')

const DEFAULT_SERVICE_TYPE = SERVICE_TYPES[0]?.id || 'escort'

function initProductsPage(serviceTypeId = DEFAULT_SERVICE_TYPE) {
  return buildProductsPageState(serviceTypeId || DEFAULT_SERVICE_TYPE)
}

function applyServiceType(serviceTypeId) {
  return buildProductsPageState(serviceTypeId)
}

function applySubCategory(serviceTypeId, subCategoryId, subCategories) {
  return buildProductsPageSlice(serviceTypeId, subCategoryId, subCategories)
}

module.exports = {
  DEFAULT_SERVICE_TYPE,
  initProductsPage,
  applyServiceType,
  applySubCategory,
}
