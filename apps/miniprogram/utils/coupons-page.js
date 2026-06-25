/**
 * 我的优惠券页
 */
const { fetchAllCoupons } = require('./api/user-coupons')
const { formatCouponHint, formatCouponValue } = require('./coupons')

const { buildTabsWithCounts, FILTER_ALL } = require('./line-tabs')

const COUPON_TABS = [
  { id: FILTER_ALL, label: '全部' },
  { id: 'available', label: '可用' },
  { id: 'used', label: '已使用' },
  { id: 'expired', label: '已过期' },
]

const STATUS_LABELS = {
  available: '可用',
  used: '已使用',
  expired: '已过期',
}

const EMPTY_HINTS = {
  [FILTER_ALL]: '暂无优惠券',
  available: '暂无可用优惠券',
  used: '暂无已使用优惠券',
  expired: '暂无已过期优惠券',
}

function formatExpiresText(coupon) {
  if (coupon.status === 'used') {
    return coupon.usedAt ? `使用时间 ${coupon.usedAt}` : '已使用'
  }
  return coupon.expiresAt ? `有效期至 ${coupon.expiresAt}` : ''
}

function enrichCoupon(coupon) {
  const status = coupon.status || 'available'
  return {
    id: coupon.id,
    name: coupon.name,
    description: coupon.description || '',
    hint: formatCouponHint(coupon),
    valueLabel: formatCouponValue(coupon),
    status,
    statusLabel: STATUS_LABELS[status] || status,
    expiresText: formatExpiresText(coupon),
    isAvailable: status === 'available',
  }
}

function filterCoupons(items, activeFilter) {
  if (activeFilter === FILTER_ALL) return items
  return items.filter((item) => item.status === activeFilter)
}

function buildCouponsPageState(items, activeFilter = FILTER_ALL) {
  const all = (items || []).map(enrichCoupon)
  const filtered = filterCoupons(all, activeFilter)
  const couponTabs = buildTabsWithCounts(COUPON_TABS, all, (item) => item.status)
  return {
    allCoupons: all,
    coupons: filtered,
    couponTabs,
    activeFilter,
    emptyHint: EMPTY_HINTS[activeFilter] || EMPTY_HINTS[FILTER_ALL],
    totalCount: all.length,
    availableCount: all.filter((item) => item.status === 'available').length,
  }
}

function applyCouponFilter(allCoupons, activeFilter = FILTER_ALL) {
  const all = allCoupons || []
  const filtered = filterCoupons(all, activeFilter)
  const couponTabs = buildTabsWithCounts(COUPON_TABS, all, (item) => item.status)
  return {
    coupons: filtered,
    couponTabs,
    activeFilter,
    emptyHint: EMPTY_HINTS[activeFilter] || EMPTY_HINTS[FILTER_ALL],
  }
}

async function loadCouponsPage(activeFilter = FILTER_ALL) {
  const items = await fetchAllCoupons()
  return buildCouponsPageState(items, activeFilter)
}

module.exports = {
  FILTER_ALL,
  loadCouponsPage,
  buildCouponsPageState,
  applyCouponFilter,
}
