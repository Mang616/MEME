/**
 * 创建订单页：状态组装、校验与 mock 提交
 */
const { getProductById } = require('./mock/products')
const { createOrder } = require('./mock/orders')
const { ORDER_REGIONS, AUTO_ASSIGN_LABEL } = require('./mock/order-create')
const { formatMoney, formatPriceDisplay } = require('./format')
const { formatLimitText, getMaxPurchaseQty } = require('./product-limit')
const { toOrderCreateHandlerFields } = require('./handler-view-model')
const { markOrdersListDirty } = require('./orders-refresh')
const { minorOrderNotice } = require('./config')

function calcTotal(price, quantity) {
  const unit = Number(price) || 0
  const qty = Math.max(1, Number(quantity) || 1)
  return Math.round(unit * qty * 100) / 100
}

function buildProductCard(raw) {
  return {
    id: raw.id,
    title: raw.title,
    desc: raw.desc || '',
    price: raw.price,
    priceDisplay: formatPriceDisplay(raw.price),
    cover: raw.cover || '',
    coverColor: raw.coverColor || '',
    limitText: formatLimitText(raw.limitPerUser),
  }
}

function buildOrderCreateState(productId) {
  const raw = getProductById(productId)
  if (!raw) {
    return { found: false }
  }

  const maxQty = getMaxPurchaseQty(raw.limitPerUser)
  const quantity = 1

  return {
    found: true,
    product: buildProductCard(raw),
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
    totalPaidDisplay: formatMoney(calcTotal(raw.price, quantity)),
    notice: minorOrderNotice,
    submitting: false,
  }
}

function patchQuantity(state, delta) {
  const maxQty = state.maxQty
  let quantity = state.quantity + delta
  if (quantity < 1) quantity = 1
  if (quantity > maxQty) quantity = maxQty
  return {
    quantity,
    canDecrease: quantity > 1,
    canIncrease: quantity < maxQty,
    totalPaidDisplay: formatMoney(calcTotal(state.product.price, quantity)),
  }
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

function submitOrderCreate(state) {
  const err = validateForm(state)
  if (err) {
    return Promise.reject(new Error(err))
  }

  const order = createOrder({
    productId: state.product.id,
    quantity: state.quantity,
    region: state.regionLabel,
    userId: String(state.gameId).trim(),
    assignedPlayer: resolveAssignedPlayer(state),
    remark: String(state.remark || '').trim(),
    product: state.product,
  })

  markOrdersListDirty()

  return new Promise((resolve) => {
    setTimeout(() => resolve(order), 400)
  })
}

module.exports = {
  buildOrderCreateState,
  patchQuantity,
  applyHandlerSelection,
  validateForm,
  submitOrderCreate,
}