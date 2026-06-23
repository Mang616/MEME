/** 订单 mock — 后续由 server API 替换 */

const INITIAL_ORDERS = [
  {
    id: 'D_260524154235_231533',
    productId: 'p3',
    status: 'pending_confirm',
    statusText: '待确认',
    orderTime: '2026-05-24 15:42:35',
    region: '端游',
    userId: '麦当劳到了',
    assignedPlayer: '系统自动分配',
    servicePlayer: '魔王s 贰拾',
    product: {
      title: '五红对对碰',
      desc: '消除任意两红',
      price: 588,
      quantity: 1,
      coverColor: '#4a5f52',
    },
    totalPaid: 588,
    paid: true,
    refunded: false,
    autoSettleTime: '2026-05-25 20:07:43',
    actions: ['contact', 'detail', 'confirm'],
  },
  {
    id: 'D_260523091200_110022',
    productId: 'p4',
    status: 'pending_accept',
    statusText: '待接单',
    orderTime: '2026-05-23 09:12:00',
    region: '端游',
    userId: '玩家A',
    assignedPlayer: '指定选手小李',
    servicePlayer: '—',
    product: {
      title: '我要aw子弹',
      desc: '5发',
      price: 128,
      quantity: 1,
      coverColor: '#3a4540',
    },
    totalPaid: 128,
    paid: true,
    refunded: false,
    autoSettleTime: '',
    actions: ['contact', 'detail'],
  },
  {
    id: 'D_260520180000_998877',
    productId: 'p1',
    status: 'completed',
    statusText: '已完成',
    orderTime: '2026-05-20 18:00:00',
    region: '端游',
    userId: '老玩家88',
    assignedPlayer: '系统自动分配',
    servicePlayer: '阿凯',
    product: {
      title: '68.8进绝密（每人限购1单）',
      desc: '绝密体验，保底3.33m-10m，性价比最高',
      price: 68.8,
      quantity: 1,
      coverColor: '#2a3530',
    },
    totalPaid: 68.8,
    paid: true,
    refunded: false,
    autoSettleTime: '',
    actions: ['detail'],
  },
  {
    id: 'D_260518103000_556677',
    productId: 'p2',
    status: 'after_sale',
    statusText: '售后中',
    orderTime: '2026-05-18 10:30:00',
    region: '手游',
    userId: '萌新001',
    assignedPlayer: '指定选手小王',
    servicePlayer: '小李',
    product: {
      title: '拯救老板单',
      desc: '击杀30名敌方干员，成功撤离等',
      price: 588,
      quantity: 1,
      coverColor: '#3d5240',
    },
    totalPaid: 588,
    paid: true,
    refunded: true,
    autoSettleTime: '',
    actions: ['contact', 'detail'],
  },
]

/** @type {typeof INITIAL_ORDERS} */
let orders = INITIAL_ORDERS.map((item) => ({ ...item }))

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatOrderTime(date) {
  const y = date.getFullYear()
  const m = pad2(date.getMonth() + 1)
  const d = pad2(date.getDate())
  const h = pad2(date.getHours())
  const min = pad2(date.getMinutes())
  const s = pad2(date.getSeconds())
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}

function buildOrderId() {
  const now = new Date()
  const tail = String(Math.floor(Math.random() * 900000) + 100000)
  return `D_${String(now.getFullYear()).slice(2)}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}${pad2(now.getHours())}${pad2(now.getMinutes())}${pad2(now.getSeconds())}_${tail}`
}

function getOrderById(orderId) {
  return orders.find((item) => item.id === orderId) || null
}

function listOrders() {
  return orders
}

/**
 * mock 创建订单
 * @param {{ productId: string, quantity: number, region: string, userId: string, assignedPlayer: string, remark?: string, product: object }} payload
 */
function createOrder(payload) {
  const qty = Math.max(1, Number(payload.quantity) || 1)
  const unitPrice = Number(payload.product.price) || 0
  const totalPaid = Math.round(unitPrice * qty * 100) / 100
  const order = {
    id: buildOrderId(),
    productId: payload.productId,
    status: 'pending_accept',
    statusText: '待接单',
    orderTime: formatOrderTime(new Date()),
    region: payload.region,
    userId: payload.userId,
    assignedPlayer: payload.assignedPlayer,
    servicePlayer: '—',
    remark: payload.remark || '',
    product: {
      title: payload.product.title,
      desc: payload.product.desc || '',
      price: unitPrice,
      quantity: qty,
      cover: payload.product.cover || '',
      coverColor: payload.product.coverColor || '',
    },
    totalPaid,
    paid: true,
    refunded: false,
    autoSettleTime: '',
    actions: ['contact', 'detail'],
  }
  orders.unshift(order)
  return order
}

module.exports = {
  getOrderById,
  listOrders,
  createOrder,
}
