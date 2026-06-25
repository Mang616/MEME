/**
 * 登录态：本地 session 缓存 + 服务端用户资料同步
 */
const { LOGIN_METHOD } = require('./constants')
const authApi = require('./auth-api')
const profileAvatar = require('./profile-avatar')

const SESSION_KEY = 'auth_session'

function readSession() {
  try {
    const raw = wx.getStorageSync(SESSION_KEY)
    if (!raw || typeof raw !== 'object' || !raw.token || !raw.user) return null
    return raw
  } catch (err) {
    console.warn('[auth] read session failed', err)
    return null
  }
}

function writeSession(session) {
  wx.setStorageSync(SESSION_KEY, session)
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

/** 合并服务端用户字段并计算展示用 avatarSrc */
function normalizeSessionUser(user) {
  const avatarGender = profileAvatar.normalizeGender(user?.avatarGender)
  const normalized = { ...user, avatarGender }
  return {
    ...normalized,
    avatarSrc: profileAvatar.resolveUserAvatarSrc(normalized),
  }
}

function applyServerUser(user) {
  const session = readSession()
  if (!session || !user) return null
  session.user = normalizeSessionUser(user)
  writeSession(session)
  syncGlobalLoggedIn(true)
  return session.user
}

function assertLoggedIn() {
  if (!readSession()) throw new Error('请先登录')
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

function establishSession({ token, user, loginMethod }) {
  const session = {
    token,
    user: normalizeSessionUser(user),
    loginMethod,
    loginAt: Date.now(),
  }
  writeSession(session)
  syncGlobalLoggedIn(true)
  return session
}

async function loginVia(apiCall, loginMethod) {
  const result = await apiCall()
  return establishSession({
    token: result.token,
    user: result.user,
    loginMethod,
  })
}

async function loginBySms(phone, code) {
  return loginVia(() => authApi.loginWithSms(phone, code), LOGIN_METHOD.SMS)
}

async function loginByWechat() {
  return loginVia(() => authApi.loginWithWechat(), LOGIN_METHOD.WECHAT)
}

async function syncProfile() {
  assertLoggedIn()
  const user = await authApi.fetchMe()
  return applyServerUser(user)
}

async function updateProfile(patch) {
  assertLoggedIn()
  const user = await authApi.updateProfile(patch)
  return applyServerUser(user)
}

async function bindPhone(phone, code) {
  assertLoggedIn()
  const result = await authApi.bindPhone(phone, code)
  return applyServerUser(result.user)
}

async function recharge(amount) {
  assertLoggedIn()
  const result = await authApi.recharge(amount)
  applyServerUser(result.user)
  return result
}

function logout() {
  try {
    wx.removeStorageSync(SESSION_KEY)
  } catch (err) {
    console.warn('[auth] remove session failed', err)
  }
  syncGlobalLoggedIn(false)
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

function initAuth() {
  syncGlobalLoggedIn(isLoggedIn())
  return isLoggedIn()
}

function requireLogin(options = {}) {
  if (isLoggedIn()) return true
  const { openLogin } = require('./nav')
  openLogin(options)
  return false
}

module.exports = {
  isLoggedIn,
  getSession,
  getUser,
  syncProfile,
  updateProfile,
  loginBySms,
  loginByWechat,
  bindPhone,
  recharge,
  logout,
  confirmAndLogout,
  initAuth,
  requireLogin,
  sendSmsCode: (phone) => authApi.sendSmsCode(phone, 'login'),
  sendBindPhoneCode: (phone) => authApi.sendSmsCode(phone, 'bind'),
}
