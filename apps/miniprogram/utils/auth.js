/**
 * 登录态：本地 session + 订阅通知（验证码 / 微信）
 */
const { LOGIN_METHOD } = require('./constants')
const authApi = require('./auth-api')
const profileAvatar = require('./profile-avatar')

const STORAGE_KEY = 'auth_session'

/** @type {Set<(session: object|null) => void>} */
const subscribers = new Set()

function readSession() {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY)
    if (!raw || typeof raw !== 'object' || !raw.token || !raw.user) return null
    return raw
  } catch (err) {
    console.warn('[auth] read session failed', err)
    return null
  }
}

function writeSession(session) {
  wx.setStorageSync(STORAGE_KEY, session)
}

function notify(session) {
  subscribers.forEach((fn) => {
    try {
      fn(session)
    } catch (err) {
      console.error('[auth] subscriber error', err)
    }
  })
}

function syncGlobalLoggedIn(loggedIn) {
  try {
    const app = getApp()
    if (app && app.globalData) {
      app.globalData.isLoggedIn = loggedIn
      app.globalData.user = loggedIn ? getUser() : null
    }
  } catch (err) {
    /* App 未就绪 */
  }
}

function isLoggedIn() {
  return !!readSession()
}

function getSession() {
  return readSession()
}

function getUser() {
  const session = readSession()
  return session ? { ...session.user } : null
}

function getLoginMethod() {
  const session = readSession()
  return session ? session.loginMethod || '' : ''
}

function establishSession({ token, user, loginMethod }) {
  const avatarGender = profileAvatar.resolveGender(user)
  const session = {
    token,
    user: {
      ...user,
      avatarGender,
      avatar: profileAvatar.getAvatarSrc(avatarGender),
    },
    loginMethod,
    loginAt: Date.now(),
  }
  writeSession(session)
  syncGlobalLoggedIn(true)
  notify(session)
  return session
}

async function loginBySms(phone, code) {
  const result = await authApi.loginWithSms(phone, code)
  return establishSession({
    token: result.token,
    user: result.user,
    loginMethod: LOGIN_METHOD.SMS,
  })
}

async function loginByWechat() {
  const result = await authApi.loginWithWechat()
  return establishSession({
    token: result.token,
    user: result.user,
    loginMethod: LOGIN_METHOD.WECHAT,
  })
}

/** 已登录：绑定手机号（保留当前 session，仅更新 phone） */
async function bindPhone(phone, code) {
  if (!isLoggedIn()) {
    throw new Error('请先登录')
  }
  const { phone: normalized } = await authApi.bindPhone(phone, code)
  updateUser({ phone: normalized })
  return getUser()
}

/** 更新当前用户字段并持久化 session */
function updateUser(patch) {
  const session = readSession()
  if (!session || !patch) return false

  session.user = { ...session.user, ...patch }
  if (patch.avatarGender) {
    const gender = profileAvatar.setStoredGender(patch.avatarGender)
    session.user.avatarGender = gender
    session.user.avatar = profileAvatar.getAvatarSrc(gender)
  }
  writeSession(session)
  syncGlobalLoggedIn(true)
  notify(session)
  return true
}

function logout() {
  try {
    wx.removeStorageSync(STORAGE_KEY)
  } catch (err) {
    console.warn('[auth] remove session failed', err)
  }
  syncGlobalLoggedIn(false)
  notify(null)
}

function confirmAndLogout() {
  return new Promise((resolve) => {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      confirmText: '退出',
      confirmColor: '#ff3b30',
      cancelText: '取消',
      success: (res) => {
        if (!res.confirm) {
          resolve(false)
          return
        }
        logout()
        resolve(true)
      },
      fail: () => resolve(false),
    })
  })
}

function subscribe(fn) {
  if (typeof fn === 'function') subscribers.add(fn)
}

function unsubscribe(fn) {
  subscribers.delete(fn)
}

function initAuth() {
  const loggedIn = isLoggedIn()
  syncGlobalLoggedIn(loggedIn)
  return loggedIn
}

function requireLogin(options = {}) {
  if (isLoggedIn()) return true
  const { openLogin } = require('./nav')
  openLogin(options)
  return false
}

module.exports = {
  STORAGE_KEY,
  LOGIN_METHOD,
  isLoggedIn,
  getSession,
  getUser,
  getLoginMethod,
  establishSession,
  updateUser,
  loginBySms,
  loginByWechat,
  bindPhone,
  logout,
  confirmAndLogout,
  subscribe,
  unsubscribe,
  initAuth,
  requireLogin,
  sendSmsCode: (phone) => authApi.sendSmsCode(phone, 'login'),
  sendBindPhoneCode: (phone) => authApi.sendSmsCode(phone, 'bind'),
}
