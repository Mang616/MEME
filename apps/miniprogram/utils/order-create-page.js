/**
 * 创建订单页：状态组装、校验与 API 提交
 */
const repository = require('./api/repository')
const { listOrderCoupons } = require('./api/user-coupons')
const { ORDER_REGIONS, AUTO_ASSIGN_LABEL } = require('./order-form')
const { formatMoney, formatPriceDisplay, mapProductForDisplay } = require('./format')
const { formatLimitText, getMaxPurchaseQty } = require('./product-limit')
const { toOrderCreateHandlerFields } = require('./handler-view-model')
const { markOrdersListDirty } = require('./orders-refresh')
const { minorOrderNotice } = require('./config')
const {
  calcSubtotal,
  calcTotalPaid,
  enrichCouponOption,
  pickBestCoupon,
} = require('./coupons')

function buildRegionSheetOptions(regionOptions) {
  return (regionOptions || []).map((label, index) => ({
    id: String(index),
    label,
  }))
}

function buildCouponSheetOptions(couponOptions) {
  return [
    { id: '', label: '不使用优惠券', extra: '—', extraMuted: true },
    ...(couponOptions || []).map((item) => ({
      id: item.id,
      label: item.name,
      hint: item.hint,
      extra: item.applicable ? `-¥${item.discountDisplay}` : '不可用',
      extraMuted: !item.applicable,
      disabled: !item.applicable,
    })),
  ]
}

function withSheetOptions(state) {
  return {
    ...state,
    regionSheetOptions: buildRegionSheetOptions(state.regionOptions),
    regionSelectedId: String(state.regionIndex ?? 0),
    couponSheetOptions: buildCouponSheetOptions(state.couponOptions),
  }
}

function buildPricingFields(state) {
  const subtotal = calcSubtotal(state.product.price, state.quantity)
  const selected = (state.couponOptions || []).find((item) => item.id === state.selectedCouponId)
  const couponDiscount = selected && selected.applicable ? selected.discount : 0
  const totalPaid = calcTotalPaid(subtotal, couponDiscount)

  return {
    subtotal,
    subtotalDisplay: formatMoney(subtotal),
    couponDiscount,
    couponDiscountDisplay: couponDiscount > 0 ? formatMoney(couponDiscount) : '',
    totalPaidDisplay: formatMoney(totalPaid),
    selectedCouponLabel: selected ? selected.name : '请选择优惠券',
    hasCouponDiscount: couponDiscount > 0,
  }
}

function buildProductCard(raw) {
  return {
    ...mapProductForDisplay(raw),
    cover: raw.cover || '',
    coverColor: raw.coverColor || '',
    serviceType: raw.serviceType || 'escort',
    limitText: formatLimitText(raw.limitPerUser),
  }
}

function buildOrderCreateState(productId) {
  const raw = repository.getProductById(productId)
  if (!raw) {
    return { found: false }
  }

  const maxQty = getMaxPurchaseQty(raw.limitPerUser)
  const quantity = 1
  const product = buildProductCard(raw)

  const base = {
    found: true,
    product,
    quantity,
    maxQty,
    canDecrease: false,
    canIncrease: quantity < maxQty,
    regionOptions: ORDER_REGIONS,
    regionIndex: 0,
    regionLabel: ORDER_REGIONS[0],
    autoAssignPlayer: true,
    handlerId: '',
    handlerLabel: '',
    handlerLevelLabel: '',
    handlerLevelIcon: '',
    handlerGenderLabel: '',
    gameId: '',
    remark: '',
    unitPriceDisplay: formatPriceDisplay(raw.price),
    notice: minorOrderNotice,
    submitting: false,
    couponOptions: [],
    couponLoading: false,
    selectedCouponId: '',
    showCouponPicker: false,
    showRegionPicker: false,
  }

  return withSheetOptions({
    ...base,
    ...buildPricingFields(base),
  })
}

async function loadOrderCoupons(state) {
  if (!state.found || !state.product) return state

  const subtotal = calcSubtotal(state.product.price, state.quantity)
  let items = []
  try {
    items = await listOrderCoupons(state.product.id, state.quantity)
  } catch {
    items = []
  }

  const serviceType = state.product.serviceType || 'escort'
  const couponOptions = items.map((item) => enrichCouponOption(item, subtotal, serviceType))
  const best = pickBestCoupon(items, subtotal, serviceType)
  const selectedCouponId = state.selectedCouponId || best?.id || ''

  const next = {
    ...state,
    couponOptions,
    couponLoading: false,
    selectedCouponId,
  }
  return withSheetOptions({
    ...next,
    ...buildPricingFields(next),
  })
}

function patchQuantity(state, delta) {
  const maxQty = state.maxQty
  let quantity = state.quantity + delta
  if (quantity < 1) quantity = 1
  if (quantity > maxQty) quantity = maxQty

  const subtotal = calcSubtotal(state.product.price, quantity)
  const serviceType = state.product.serviceType || 'escort'
  const couponOptions = (state.couponOptions || []).map((item) =>
    enrichCouponOption(item, subtotal, serviceType),
  )
  let selectedCouponId = state.selectedCouponId
  const selected = couponOptions.find((item) => item.id === selectedCouponId)
  if (!selected || !selected.applicable) {
    const best = couponOptions.find((item) => item.applicable)
    selectedCouponId = best ? best.id : ''
  }

  const next = {
    quantity,
    canDecrease: quantity > 1,
    canIncrease: quantity < maxQty,
    couponOptions,
    selectedCouponId,
  }

  return withSheetOptions({
    ...next,
    ...buildPricingFields({ ...state, ...next }),
  })
}

function applyCouponSelection(state, couponId) {
  const selectedCouponId = couponId || ''
  const next = {
    ...state,
    selectedCouponId,
    showCouponPicker: false,
  }
  return withSheetOptions({
    ...next,
    ...buildPricingFields(next),
  })
}

function applyHandlerSelection(_state, handler) {
  return toOrderCreateHandlerFields(handler)
}

function resolveAssignedPlayer(state) {
  if (state.autoAssignPlayer) return AUTO_ASSIGN_LABEL
  return String(state.handlerLabel || '').trim()
}

function validateForm(state) {
  const gameId = String(state.gameId || '').trim()
  if (!gameId) return '请填写游戏 ID'
  if (gameId.length < 2) return '游戏 ID 至少 2 个字符'
  if (!state.autoAssignPlayer && !state.handlerId) return '请选择打手'
  return ''
}

async function submitOrderCreate(state) {
  const auth = require('./auth')
  if (!auth.isLoggedIn()) {
    throw new Error('请先登录后再下单')
  }

  const err = validateForm(state)
  if (err) {
    throw new Error(err)
  }

  const payload = {
    productId: state.product.id,
    quantity: state.quantity,
    region: state.regionLabel,
    userId: String(state.gameId).trim(),
    assignedPlayer: resolveAssignedPlayer(state),
    remark: String(state.remark || '').trim(),
    product: state.product,
  }

  if (state.selectedCouponId) {
    payload.userCouponId = state.selectedCouponId
  }

  const order = await repository.createOrder(payload)

  markOrdersListDirty()
  return order
}

module.exports = {
  buildOrderCreateState,
  loadOrderCoupons,
  patchQuantity,
  applyCouponSelection,
  applyHandlerSelection,
  validateForm,
  submitOrderCreate,
}
