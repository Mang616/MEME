/** 商品角标样式（由 catalog.productTags 驱动，与 wxs/product.wxs 规则对齐） */

let productTags = []

function setProductTags(tags) {
  productTags = Array.isArray(tags) ? tags : []
}

function getProductTags() {
  return productTags
}

function resolveTagClass(tag) {
  if (!tag) return ''
  const hit = productTags.find((item) => item.name === tag)
  if (hit && hit.style === 'new') return 'tag-new'
  if (hit) return 'tag-recommend'
  if (tag === '新品') return 'tag-new'
  return 'tag-recommend'
}

module.exports = {
  setProductTags,
  getProductTags,
  resolveTagClass,
}
