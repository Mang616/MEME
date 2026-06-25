/**
 * 我的页展示数据（随登录态刷新，资料以服务端为准）
 */
const auth = require('./auth')
const { fetchContent } = require('./api/content')
const { formatMoney, maskPhone } = require('./format')
const profileAvatar = require('./profile-avatar')
const { resolveVipLevel } = require('./vip-level')
const { ensureVipConfig } = require('./vip-config')
const { resolveLocalImage } = require('./local-image')
const { QUICK_ENTRIES } = require('./mock/quick-entries')

const GUEST_USER = {
  nickname: '点击登录',
  avatar: '',
  vipLevel: 0,
  balance: 0,
  couponCount: 0,
  userId: '--',
  phone: '',
}

const PROFILE_MENU_ITEMS = [
  { id: 'feedback', label: '意见反馈' },
  { id: 'agreement', label: '用户协议' },
  { id: 'privacy', label: '隐私政策' },
  { id: 'minor', label: '未成年人保护指引' },
]

function mapUserForProfile(user, loggedIn) {
  const vipDisplay = loggedIn
    ? resolveVipLevel(user.vipLevel ?? user.memberLevel)
    : resolveVipLevel(0, { guest: true })

  return {
    ...user,
    nickname: user.nickname || '用户',
    balanceText: formatMoney(user.balance),
    phoneMasked: maskPhone(user.phone),
    avatarGender: profileAvatar.resolveGender(user),
    avatarSrc: profileAvatar.resolveUserAvatarSrc(user),
    vipDisplay,
  }
}

function mapHelpQuickEntries(entries) {
  const list = entries && entries.length ? entries : QUICK_ENTRIES
  return list.map((entry) => ({
    ...entry,
    iconSrc: resolveLocalImage(entry.iconSrc),
  }))
}

function buildProfileCore(helpQuickEntries = []) {
  const loggedIn = auth.isLoggedIn()
  const raw = loggedIn ? auth.getUser() : GUEST_USER
  const user = mapUserForProfile(raw, loggedIn)

  return {
    loggedIn,
    user,
    helpQuickEntries: mapHelpQuickEntries(helpQuickEntries),
    menuItems: PROFILE_MENU_ITEMS,
    guideVisible: false,
    activeGuide: null,
  }
}

async function syncProfileFromServer() {
  if (!auth.isLoggedIn()) return
  try {
    await auth.syncProfile()
  } catch (err) {
    console.warn('[profile] sync user failed', err.message)
  }
}

async function loadProfilePage() {
  try {
    const [, contentPage] = await Promise.all([
      ensureVipConfig(),
      fetchContent('quick-entries'),
      syncProfileFromServer(),
    ])
    return buildProfileCore(contentPage.payload?.entries || [])
  } catch (err) {
    console.warn('[profile] load failed', err.message)
    return buildProfileCore(QUICK_ENTRIES)
  }
}

async function refreshProfilePage(page) {
  await Promise.all([ensureVipConfig(), syncProfileFromServer()])
  const next = buildProfileCore(page.data.helpQuickEntries || [])
  if (page.data.guideVisible && page.data.activeGuide) {
    next.guideVisible = true
    next.activeGuide = page.data.activeGuide
  }
  return next
}

module.exports = {
  loadProfilePage,
  refreshProfilePage,
}
