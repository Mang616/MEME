/** 路由与业务常量（Tab 页路径须与 app.json 一致） */

const TAB_ROUTES = {
  HOME: '/pages/home/index',
  PRODUCTS: '/pages/products/index',
  ORDERS: '/pages/orders/index',
  CHAT: '/pages/chat/index',
  PROFILE: '/pages/profile/index',
}

/** Tab 根路径列表（登录回跳、switchTab 判断） */
const TAB_ROUTE_LIST = Object.values(TAB_ROUTES)

const PAGE_ROUTES = {
  PRODUCT_DETAIL: '/pages/product-detail/index',
  ORDER_CREATE: '/pages/order-create/index',
  HANDLER_SELECT: '/pages/handler-select/index',
  ORDER_DETAIL: '/pages/order-detail/index',
  SEARCH: '/pages/search/index',
  CHAT_ROOM: '/pages/chat-room/index',
  SETTINGS: '/pages/settings/index',
  PROFILE_EDIT: '/pages/profile-edit/index',
  LOGIN: '/pages/login/index',
  BIND_PHONE: '/pages/bind-phone/index',
  LEGAL: '/pages/legal/index',
  FEEDBACK: '/pages/feedback/index',
  MINOR_GUIDE: '/pages/minor-guide/index',
  VIP_LEVEL: '/pages/vip-level/index',
  ACCOUNT: '/pages/account/index',
  COUPONS: '/pages/coupons/index',
  INVITE: '/pages/invite/index',
}

/** 登录方式 */
const LOGIN_METHOD = {
  SMS: 'sms',
  WECHAT: 'wechat',
}

/** 会话类型：客户↔打手 / 客户↔客服 */
const CHAT_TYPE = {
  PLAYER: 'player',
  SERVICE: 'service',
}

/** 会话类型文案：list=列表角标旁，room=聊天室顶栏 */
const CHAT_TYPE_LABEL = {
  [CHAT_TYPE.SERVICE]: { list: '客服', room: '平台客服' },
  [CHAT_TYPE.PLAYER]: { list: '打手', room: '服务打手' },
}

function getChatTypeLabel(type, scene = 'list') {
  const labels = CHAT_TYPE_LABEL[type]
  if (!labels) return ''
  return labels[scene] || labels.list || ''
}

/** 聊天页资源路径 */
const CHAT_ASSETS = {
  CLEAR_READ: '/assets/chat/clear.png',
}

/** 「我的」页导航栏主题切换图标（与当前 theme 一致） */
const THEME_TOGGLE_ICONS = {
  DARK: '/assets/profile/dark.png',
  LIGHT: '/assets/profile/light.png',
}

const SERVICE_TYPE = {
  ESCORT: 'escort',
  COMPANION: 'companion',
}

/** Banner 点击跳转类型（mock linkType） */
const BANNER_LINK = {
  PRODUCTS: 'products',
  TAB: 'tab',
}

module.exports = {
  TAB_ROUTES,
  TAB_ROUTE_LIST,
  PAGE_ROUTES,
  LOGIN_METHOD,
  SERVICE_TYPE,
  BANNER_LINK,
  CHAT_TYPE,
  CHAT_TYPE_LABEL,
  getChatTypeLabel,
  CHAT_ASSETS,
  THEME_TOGGLE_ICONS,
}
