/**
 * 「我的」页展示数据（随登录态刷新）
 */
const auth = require('./auth')
const { QUICK_ENTRIES } = require('./mock/quick-entries')
const { formatMoney, maskPhone } = require('./format')
const profileAvatar = require('./profile-avatar')
const { resolveVipLevel } = require('./vip-level')

const GUEST_USER = {
  nickname: '点击登录',
  avatar: '',
  vipLevel: 0,
  balance: 0,
  couponCount: 0,
  userId: '--',
  phone: '',
}

/** 菜单项（订单请使用底部 Tab「订单」） */
const PROFILE_MENU_ITEMS = [
  { id: 'feedback', label: '意见反馈' },
  { id: 'agreement', label: '用户协议' },
  { id: 'privacy', label: '隐私政策' },
  { id: 'minor', label: '未成年人保护指引' },
]

function mapUserForProfile(user, loggedIn) {
  const nickname = user.nickname || '用户'
  const avatarGender = profileAvatar.resolveGender(user)
  const vipDisplay = loggedIn
    ? resolveVipLevel(user.vipLevel ?? user.memberLevel)
    : resolveVipLevel(0, { guest: true })

  return {
    ...user,
    balanceText: formatMoney(user.balance),
    phoneMasked: maskPhone(user.phone),
    avatarGender,
    avatarSrc: profileAvatar.getAvatarSrc(avatarGender),
    vipDisplay,
  }
}

function initProfilePage() {
  const loggedIn = auth.isLoggedIn()
  const raw = loggedIn ? auth.getUser() : GUEST_USER
  const user = mapUserForProfile(raw, loggedIn)

  return {
    loggedIn,
    loginMethod: loggedIn ? auth.getLoginMethod() : '',
    user,
    balanceVisible: loggedIn,
    helpQuickEntries: QUICK_ENTRIES.slice(),
    menuItems: PROFILE_MENU_ITEMS,
    guideVisible: false,
    activeGuide: null,
  }
}

/** onShow 刷新登录态等，保留已打开的帮助弹窗 */
function refreshProfilePage(page) {
  const next = initProfilePage()
  if (page.data.guideVisible && page.data.activeGuide) {
    next.guideVisible = true
    next.activeGuide = page.data.activeGuide
  }
  return next
}

module.exports = {
  GUEST_USER,
  PROFILE_MENU_ITEMS,
  initProfilePage,
  refreshProfilePage,
}
