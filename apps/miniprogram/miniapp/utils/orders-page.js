/**
 * 订单列表：视图模型组装 + 卡片事件分发
 */
const { listOrders } = require('./mock/orders')
const { getProductById } = require('./mock/products')
const { openProductDetail, openChatRoom, openOrderDetail } = require('./nav')
const { copyText, showTip } = require('./ui')
const { FILTER_ALL } = require('./line-tabs')
const { formatMoney, formatPriceDisplay } = require('./format')
const { mergeProductSnapshot } = require('./order-summary')
const { createFilterListHandlers } = require('./filter-list-page')

const ORDER_STATUS_TABS = [
  { id: FILTER_ALL, label: '全部' },
  { id: 'pending_confirm', label: '待确认' },
  { id: 'pending_accept', label: '待接单' },
  { id: 'completed', label: '已完成' },
  { id: 'after_sale', label: '售后' },
]

const EMPTY_HINT = {
  [FILTER_ALL]: '下单后将在此展示',
  pending_confirm: '暂无待确认订单',
  pending_accept: '暂无待接单订单',
  completed: '暂无已完成订单',
  after_sale: '暂无售后订单',
}

const STATUS_CLASS = {
  pending_confirm: 'order-card__status--confirm',
  pending_accept: 'order-card__status--pending',
  completed: 'order-card__status--done',
  after_sale: 'order-card__status--aftersale',
}

const ORDER_ACTIONS = [
  { action: 'contact', label: '联系护航', variant: 'outline' },
  { action: 'detail', label: '查看详情', variant: 'muted' },
  { action: 'confirm', label: '确认结单', variant: 'cta' },
]

const ACTION_LABELS = Object.fromEntries(
  ORDER_ACTIONS.map((item) => [item.action, item.label]),
)

/** 订单 id → 打手会话 id（mock） */
const ORDER_PLAYER_CHAT = {
  D_260524154235_231533: 'chat_player_1',
  D_260520180000_998877: 'chat_player_2',
  D_260523091200_110022: 'chat_player_1',
}

const BUTTON_CLASS = {
  outline: 'btn-outline order-card__btn',
  muted: 'btn-outline order-card__btn order-card__btn--muted',
  cta: 'btn-cta order-card__btn',
}

const INFO_FIELDS = [
  { key: 'region', label: '大区' },
  { key: 'assignedPlayer', label: '指定选手' },
  { key: 'servicePlayer', label: '服务选手' },
  { key: 'userId', label: '游戏 ID', copyable: true },
]

/** 列表仅展示履约相关字段 */
const LIST_INFO_FIELDS = [
  { key: 'servicePlayer', label: '服务选手' },
  { key: 'userId', label: '游戏 ID', copyable: true },
]

const orderFilterApi = createFilterListHandlers({
  tabDefs: ORDER_STATUS_TABS,
  emptyHints: EMPTY_HINT,
  getGroupKey: (order) => order.status,
  getSourceItems: () => listOrders(),
  enrichOnInit: true,
  enrichItem: enrichOrder,
  fields: {
    active: 'activeStatus',
    tabs: 'statusTabs',
    list: 'orders',
    hint: 'emptyHint',
  },
})

function buildInfoRows(order, fields) {
  return (fields || INFO_FIELDS).map((field) => ({
    label: field.label,
    value: order[field.key] ?? '—',
    copyable: !!field.copyable,
    copyText: field.copyable ? order[field.key] : '',
  }))
}

function buildActionButtons(actions) {
  const allowed = actions || []
  return ORDER_ACTIONS.filter((item) => allowed.includes(item.action)).map(
    (item) => ({
      action: item.action,
      label: item.label,
      btnClass: BUTTON_CLASS[item.variant],
    }),
  )
}

function enrichOrder(order) {
  const catalog = order.productId ? getProductById(order.productId) : null
  const buttons = buildActionButtons(order.actions)
  const product = mergeProductSnapshot(order, catalog)
  const price = product.price ?? catalog?.price

  const compact = order.status === 'completed'

  return {
    ...order,
    compact,
    statusClass: STATUS_CLASS[order.status] || '',
    infoRows: buildInfoRows(order),
    listInfoRows: buildInfoRows(order, LIST_INFO_FIELDS),
    buttons,
    hasActions: buttons.length > 0,
    totalPaidDisplay: formatMoney(order.totalPaid),
    product: {
      ...product,
      priceDisplay: formatPriceDisplay(price),
    },
  }
}

function initOrdersPage(activeStatus = FILTER_ALL) {
  const { cache, pageData } = orderFilterApi.init(activeStatus)
  return { allOrders: cache, pageData }
}

function buildOrdersSlice(allOrders, activeStatus = FILTER_ALL) {
  return orderFilterApi.buildSlice(allOrders, activeStatus)
}

function handleOrderAction({ action, id, productId } = {}) {
  if (!action) return false

  if (action === 'detail' && id) {
    openOrderDetail(id)
    return true
  }

  if (action === 'contact') {
    openChatRoom(ORDER_PLAYER_CHAT[id] || 'chat_service')
    return true
  }

  showTip(`${ACTION_LABELS[action] || action}（${id || ''}）`)
  return true
}

function dispatchOrderCardEvent(detail) {
  if (!detail || !detail.type) return

  switch (detail.type) {
    case 'copy':
      if (detail.text) copyText(detail.text)
      break
    case 'producttap':
      if (detail.productId) openProductDetail(detail.productId)
      break
    case 'action':
      handleOrderAction(detail)
      break
    default:
      break
  }
}

module.exports = {
  ORDER_STATUS_TABS,
  enrichOrder,
  initOrdersPage,
  buildOrdersSlice,
  dispatchOrderCardEvent,
}
