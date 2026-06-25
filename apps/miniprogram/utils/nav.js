/**
 * 导航与跨 Tab 传参
 * pendingServiceType：首页/Banner 跳转商品 Tab 时写入，products 页 onShow 消费
 */
const { TAB_ROUTES, PAGE_ROUTES, BANNER_LINK, TAB_ROUTE_LIST } = require('./constants')
const auth = require('./auth')

function getGlobalData() {
  try {
    return getApp().globalData
  } catch (err) {
    return null
  }
}

function switchTab(url) {
  wx.switchTab({ url })
}

function setPendingServiceType(serviceTypeId) {
  const globalData = getGlobalData()
  if (globalData) {
    globalData.pendingServiceType = serviceTypeId
  }
}

/** 读取并清空待跳转的护航/陪玩类型 */
function consumePendingServiceType() {
  const globalData = getGlobalData()
  if (!globalData) return ''
  const pending = globalData.pendingServiceType || ''
  globalData.pendingServiceType = ''
  return pending
}

function openProductsTab(serviceTypeId) {
  setPendingServiceType(serviceTypeId)
  switchTab(TAB_ROUTES.PRODUCTS)
}

function openProductDetail(productId) {
  if (!productId) return
  wx.navigateTo({
    url: `${PAGE_ROUTES.PRODUCT_DETAIL}?id=${productId}`,
  })
}

function buildOrderCreateUrl(productId) {
  return `${PAGE_ROUTES.ORDER_CREATE}?id=${encodeURIComponent(productId)}`
}

/** 创建订单 */
function openOrderCreate(productId) {
  if (!productId) return
  wx.navigateTo({ url: buildOrderCreateUrl(productId) })
}

/**
 * 登录校验后进入创建订单
 * @returns {boolean} 是否已跳转
 */
function openOrderCreateWithAuth(productId) {
  if (!productId) return false
  if (!auth.requireLogin({ redirect: buildOrderCreateUrl(productId) })) {
    return false
  }
  openOrderCreate(productId)
  return true
}

/** 选择打手（创建订单子页） */
function openHandlerSelect(selectedId) {
  const q = selectedId ? `?selectedId=${encodeURIComponent(selectedId)}` : ''
  wx.navigateTo({
    url: `${PAGE_ROUTES.HANDLER_SELECT}${q}`,
  })
}

/** 订单详情 */
function openOrderDetail(orderId) {
  if (!orderId) return
  wx.navigateTo({
    url: `${PAGE_ROUTES.ORDER_DETAIL}?id=${encodeURIComponent(orderId)}`,
  })
}

/** 全站商品搜索子页 */
function openSearch(keyword) {
  const q = keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''
  wx.navigateTo({
    url: `${PAGE_ROUTES.SEARCH}${q}`,
  })
}

function openHomeTab() {
  switchTab(TAB_ROUTES.HOME)
}

function openOrdersTab() {
  switchTab(TAB_ROUTES.ORDERS)
}

function openChatTab() {
  switchTab(TAB_ROUTES.CHAT)
}

/** 设置子页 */
function openSettings() {
  wx.navigateTo({
    url: PAGE_ROUTES.SETTINGS,
  })
}

/** 个人资料（昵称 / 性别 / 手机号） */
function openProfileEdit() {
  wx.navigateTo({
    url: PAGE_ROUTES.PROFILE_EDIT,
  })
}

/** VIP 等级详情 */
function openVipLevel() {
  wx.navigateTo({
    url: PAGE_ROUTES.VIP_LEVEL,
  })
}

/** 我的账户（余额 / 充值 / 流水） */
function openAccount() {
  wx.navigateTo({
    url: PAGE_ROUTES.ACCOUNT,
  })
}

/** 我的优惠券 */
function openCoupons() {
  wx.navigateTo({
    url: PAGE_ROUTES.COUPONS,
  })
}

/** 邀请好友 */
function openInvite() {
  wx.navigateTo({
    url: PAGE_ROUTES.INVITE,
  })
}

/**
 * 登录子页
 * @param {{ redirect?: string, mode?: 'sms'|'wechat' }} [options]
 */
function isTabRoute(url) {
  if (!url) return false
  return TAB_ROUTE_LIST.includes(url.split('?')[0])
}

/** 登录成功后的回跳（Tab 用 switchTab，子页用 redirectTo） */
function navigateAfterLogin(redirect) {
  if (redirect) {
    const path = redirect.split('?')[0]
    if (isTabRoute(path)) {
      wx.switchTab({ url: path })
      return
    }
    wx.redirectTo({ url: redirect, fail: () => wx.navigateBack() })
    return
  }
  wx.navigateBack({
    fail: () => wx.switchTab({ url: TAB_ROUTES.PROFILE }),
  })
}

/** 用户协议 / 隐私政策 */
function openLegal(type) {
  const docType = type === 'privacy' ? 'privacy' : 'agreement'
  wx.navigateTo({
    url: `${PAGE_ROUTES.LEGAL}?type=${docType}`,
  })
}

function openAgreement() {
  openLegal('agreement')
}

function openPrivacy() {
  openLegal('privacy')
}

/** 意见反馈 */
function openFeedback() {
  wx.navigateTo({
    url: PAGE_ROUTES.FEEDBACK,
  })
}

/** 未成年人保护指引 */
function openMinorGuide() {
  wx.navigateTo({
    url: PAGE_ROUTES.MINOR_GUIDE,
  })
}

function openLogin(options = {}) {
  const q = []
  if (options.redirect) {
    q.push(`redirect=${encodeURIComponent(options.redirect)}`)
  }
  if (options.mode) {
    q.push(`mode=${options.mode}`)
  }
  const query = q.length ? `?${q.join('&')}` : ''
  wx.navigateTo({
    url: `${PAGE_ROUTES.LOGIN}${query}`,
  })
}

/** 绑定手机号（需已登录） */
function openBindPhone() {
  wx.navigateTo({
    url: PAGE_ROUTES.BIND_PHONE,
  })
}

/** 进入会话（聊天室子页） */
function openChatRoom(conversationId) {
  if (!conversationId) return
  wx.navigateTo({
    url: `${PAGE_ROUTES.CHAT_ROOM}?id=${conversationId}`,
  })
}

/** 打开与官方客服的会话 */
async function openServiceChat() {
  const auth = require('./auth')
  if (!auth.requireLogin({ silent: true })) {
    openLogin()
    return
  }
  try {
    const repository = require('./api/repository')
    await repository.ensureCatalog()
    const { ensureServiceConversation } = require('./chat-store')
    const conv = await ensureServiceConversation()
    openChatRoom(conv.id)
  } catch (err) {
    const { showTip } = require('./ui')
    showTip(err.message || '暂时无法连接客服')
  }
}

/**
 * 组件 producttap/tap 事件统一跳转详情
 * @returns {boolean} 是否已跳转
 */
function openProductFromEvent(e) {
  const product = e.detail && e.detail.product
  if (!product || !product.id) return false
  openProductDetail(product.id)
  return true
}

/**
 * 列表购买按钮：登录后跳转创建订单
 * @returns {boolean} 是否已跳转
 */
function openOrderCreateFromEvent(e) {
  const product = e.detail && e.detail.product
  if (!product || !product.id) return false
  return openOrderCreateWithAuth(product.id)
}

/**
 * @param {{ linkType?: string, linkValue?: string, title?: string }} banner
 * @returns {boolean} 是否已处理跳转
 */
function followBannerLink(banner) {
  if (!banner) return false
  if (banner.linkType === BANNER_LINK.PRODUCTS && banner.linkValue) {
    openProductsTab(banner.linkValue)
    return true
  }
  if (banner.linkType === BANNER_LINK.TAB && banner.linkValue) {
    switchTab(banner.linkValue)
    return true
  }
  return false
}

module.exports = {
  setPendingServiceType,
  consumePendingServiceType,
  openProductsTab,
  openHomeTab,
  openOrdersTab,
  openSearch,
  buildOrderCreateUrl,
  openProductDetail,
  openOrderCreate,
  openOrderCreateWithAuth,
  openHandlerSelect,
  openOrderDetail,
  openProductFromEvent,
  openOrderCreateFromEvent,
  followBannerLink,
  openChatTab,
  openChatRoom,
  openServiceChat,
  openSettings,
  openProfileEdit,
  openVipLevel,
  openAccount,
  openCoupons,
  openInvite,
  openLegal,
  openAgreement,
  openPrivacy,
  openFeedback,
  openMinorGuide,
  openLogin,
  openBindPhone,
  isTabRoute,
  navigateAfterLogin,
}
