/**
 * 视图层通用格式化（与 wxs/product.wxs 中 tagClass 规则保持一致）
 * 金额/价格请在 JS 层格式化为字符串，勿在 WXML 中调用 .toFixed（Skyline 易报错）
 */

/** 金额（余额等），固定两位小数 */
function formatMoney(value, digits = 2) {
  const num = Number(value)
  if (!Number.isFinite(num)) return (0).toFixed(digits)
  return num.toFixed(digits)
}

/** 商品价格展示（68.8 / 588，去掉多余尾零） */
function formatPriceDisplay(value) {
  const num = Number(value)
  if (!Number.isFinite(num)) return '0'
  if (Number.isInteger(num)) return String(num)
  return num.toFixed(2).replace(/\.?0+$/, '')
}

/** 销量/浏览量等大数 */
function formatCount(n) {
  const num = Number(n) || 0
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1).replace(/\.0$/, '')}万`
  }
  return String(num)
}

/** 商品角标样式类名 */
function tagClass(tag) {
  if (tag === '新品') return 'tag-new'
  return 'tag-recommend'
}

/** 评价用户昵称首字（脱敏后） */
function userInitial(user) {
  const name = String(user || '').replace(/\*+/g, '')
  return name.charAt(0) || '玩'
}

/** 聊天等场景：HH:mm */
function formatTimeHm(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

/** 角标数字（未读、Tab 红点等），0 返回空字符串 */
function formatCountBadge(count) {
  const n = Number(count) || 0
  if (n <= 0) return ''
  return n > 99 ? '99+' : String(n)
}

/** 手机号脱敏展示 */
function maskPhone(phone) {
  const p = String(phone || '')
  if (p.length < 11) return ''
  return `${p.slice(0, 3)}****${p.slice(-4)}`
}

function mapProductForDisplay(product) {
  if (!product) return product
  return {
    ...product,
    priceDisplay: formatPriceDisplay(product.price),
  }
}

function formatOnlineStatus(online) {
  return online ? '在线' : '离线'
}

module.exports = {
  formatMoney,
  formatPriceDisplay,
  formatCount,
  tagClass,
  userInitial,
  formatTimeHm,
  formatCountBadge,
  maskPhone,
  formatOnlineStatus,
  mapProductForDisplay,
}
