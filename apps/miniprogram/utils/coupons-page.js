/**
 * 我的优惠券页
 */
const { fetchAllCoupons } = require('./api/user-coupons')
const { formatCouponHint, formatCouponValue } = require('./coupons')
const { createFilterListHandlers } = require('./filter-list-page')
const { FILTER_ALL } = require('./line-tabs')

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

/** Tab 切换时主文案（绑定 list-empty text） */
const EMPTY_TEXT_BY_TAB = {
  [FILTER_ALL]: '暂无优惠券',
  available: '暂无可用优惠券',
  used: '暂无已使用优惠券',
  expired: '暂无已过期优惠券',
}

const EMPTY_SUBHINT = '下单或参与活动后可领取优惠券'

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

const couponFilterApi = createFilterListHandlers({
  tabDefs: COUPON_TABS,
  emptyHints: EMPTY_TEXT_BY_TAB,
  getGroupKey: (item) => item.status,
  getSourceItems: () => [],
  enrichOnInit: true,
  enrichItem: enrichCoupon,
  fields: {
    active: 'activeFilter',
    tabs: 'couponTabs',
    list: 'coupons',
    hint: 'emptyText',
  },
})

function withSummary(cache, slice) {
  return {
    allCoupons: cache,
    emptySubHint: EMPTY_SUBHINT,
    totalCount: cache.length,
    availableCount: cache.filter((item) => item.status === 'available').length,
    ...slice,
  }
}

async function loadCouponsPage(activeFilter = FILTER_ALL) {
  const items = await fetchAllCoupons()
  const cache = (items || []).map(enrichCoupon)
  return withSummary(cache, couponFilterApi.buildSlice(cache, activeFilter))
}

function applyCouponFilter(allCoupons, activeFilter = FILTER_ALL) {
  return couponFilterApi.buildSlice(allCoupons || [], activeFilter)
}

module.exports = {
  FILTER_ALL,
  loadCouponsPage,
  applyCouponFilter,
}
