/**
 * 优惠券：展示文案与本地价格试算（与服务端 lib/coupons 规则一致）
 */
const { formatMoney } = require('./format')

const SCOPE_LABELS = {
  all: '全场',
  escort: '护航',
  companion: '陪玩',
}

function roundMoney(value) {
  return Math.round(Number(value) * 100) / 100
}

function calcSubtotal(unitPrice, quantity) {
  const qty = Math.max(1, Number(quantity) || 1)
  const unit = Number(unitPrice) || 0
  return roundMoney(unit * qty)
}

function couponMatchesScope(scope, serviceType) {
  if (!scope || scope === 'all') return true
  return scope === serviceType
}

function calcCouponDiscount(coupon, subtotal, serviceType) {
  const amount = Number(subtotal) || 0
  if (!coupon || amount <= 0) return 0
  if (!couponMatchesScope(coupon.scope, serviceType)) return 0
  if (amount < Number(coupon.minSpend || 0)) return 0

  let discount = 0
  if (coupon.type === 'fixed') {
    discount = Number(coupon.value) || 0
  } else {
    const fold = Number(coupon.value) || 10
    discount = amount * (1 - fold / 10)
    const cap = Number(coupon.maxDiscount) || 0
    if (cap > 0) discount = Math.min(discount, cap)
  }

  discount = roundMoney(Math.max(0, discount))
  return roundMoney(Math.min(discount, amount))
}

function calcTotalPaid(subtotal, couponDiscount) {
  return roundMoney(Math.max(0, subtotal - couponDiscount))
}

function formatCouponValue(coupon) {
  if (!coupon) return ''
  if (coupon.type === 'percent') return `${coupon.value} 折`
  return `¥${coupon.value}`
}

function formatCouponScope(scope) {
  return SCOPE_LABELS[scope] || '全场'
}

function formatCouponHint(coupon) {
  if (!coupon) return ''
  const parts = [formatCouponValue(coupon)]
  if (Number(coupon.minSpend) > 0) {
    parts.push(`满 ¥${coupon.minSpend}`)
  }
  parts.push(formatCouponScope(coupon.scope))
  return parts.join(' · ')
}

function formatCouponOptionLabel(coupon) {
  if (!coupon) return '不使用优惠券'
  const discountText =
    Number(coupon.discount) > 0 ? `-¥${formatMoney(coupon.discount)}` : '不可用'
  return `${coupon.name}（${discountText}）`
}

function isProductCouponAllowed(product) {
  return product?.couponAllowed !== false
}

function enrichCouponOption(coupon, subtotal, serviceType, couponAllowed = true) {
  if (!couponAllowed) {
    return {
      ...coupon,
      discount: 0,
      discountDisplay: formatMoney(0),
      applicable: false,
      valueLabel: formatCouponValue(coupon),
      hint: '该商品不支持使用优惠券',
      optionLabel: `${coupon.name}（不可用）`,
    }
  }
  const discount = calcCouponDiscount(coupon, subtotal, serviceType)
  return {
    ...coupon,
    discount,
    discountDisplay: formatMoney(discount),
    applicable: discount > 0,
    valueLabel: formatCouponValue(coupon),
    hint: formatCouponHint(coupon),
    optionLabel: formatCouponOptionLabel({ ...coupon, discount }),
  }
}

function pickBestCoupon(coupons, subtotal, serviceType, couponAllowed = true) {
  if (!couponAllowed) return null
  const enriched = (coupons || []).map((item) => enrichCouponOption(item, subtotal, serviceType, couponAllowed))
  return enriched.find((item) => item.applicable) || null
}

module.exports = {
  isProductCouponAllowed,
  calcSubtotal,
  calcCouponDiscount,
  calcTotalPaid,
  formatCouponValue,
  formatCouponHint,
  formatCouponOptionLabel,
  enrichCouponOption,
  pickBestCoupon,
}
