/**
 * 登录 / 绑定手机 / 用户资料 API
 */
const { request } = require('./api/request')
const { normalizePhone } = require('./user-profile')
const { getPendingInviter, clearPendingInviter } = require('./invite-storage')

function assertPhone(phone, message = '请输入正确的 11 位手机号') {
  const normalized = normalizePhone(phone)
  if (!normalized) throw new Error(message)
  return normalized
}

function wxLoginCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      timeout: 10000,
      success: (res) => {
        if (!res.code) {
          reject(new Error('微信登录失败，请重试'))
          return
        }
        resolve(res.code)
      },
      fail: () => reject(new Error('微信登录失败，请检查网络')),
    })
  })
}

async function postAuth(path, body) {
  const inviterCode = getPendingInviter() || undefined
  const result = await request(path, {
    method: 'POST',
    body: inviterCode ? { ...body, inviterCode } : body,
    auth: false,
  })
  // 仅在服务端已写入上级或本次未携带邀请码时清除，避免无效码被误删
  if (inviterCode && result.user && result.user.inviterId) {
    clearPendingInviter()
  }
  return result
}

async function sendSmsCode(phone, scene = 'login') {
  const normalized = assertPhone(phone)
  return request('/auth/sms/send', {
    method: 'POST',
    body: { phone: normalized, scene },
    auth: false,
  })
}

async function loginWithSms(phone, code) {
  const normalized = assertPhone(phone, '请输入正确的手机号')
  return postAuth('/auth/sms/login', {
    phone: normalized,
    code: String(code || '').trim(),
  })
}

async function fetchMe() {
  const result = await request('/user/me')
  return result.user
}

async function updateProfile(body) {
  const result = await request('/user/me', {
    method: 'PATCH',
    body,
  })
  return result.user
}

async function bindPhone(phone, code) {
  const normalized = assertPhone(phone)
  return request('/user/bind-phone', {
    method: 'POST',
    body: { phone: normalized, code: String(code || '').trim() },
  })
}

async function recharge(amount) {
  return request('/user/recharge', {
    method: 'POST',
    body: { amount: Number(amount) },
  })
}

async function fetchLedger() {
  return request('/user/ledger')
}

async function loginWithWechat() {
  const code = await wxLoginCode()
  return postAuth('/auth/wechat', { code })
}

module.exports = {
  normalizePhone,
  sendSmsCode,
  loginWithSms,
  fetchMe,
  updateProfile,
  bindPhone,
  recharge,
  fetchLedger,
  loginWithWechat,
}
