/**
 * 登录 / 绑定手机 API（mock；后端就绪后对接 wx.request）
 */
const { apiBase, ENV } = require('./config')

/** 开发环境固定验证码，便于联调 */
const MOCK_SMS_CODE = '123456'
const SMS_STORAGE_PREFIX = 'dev_sms_'

function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '')
  if (!/^1\d{10}$/.test(digits)) return null
  return digits
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function verifySmsCode(normalized, smsCode) {
  const code = String(smsCode || '').trim()
  if (!/^\d{6}$/.test(code)) {
    throw new Error('请输入 6 位验证码')
  }

  let expected = MOCK_SMS_CODE
  try {
    const cached = wx.getStorageSync(`${SMS_STORAGE_PREFIX}${normalized}`)
    if (cached && cached.code) expected = cached.code
  } catch (err) {
    /* ignore */
  }

  if (code !== expected) {
    throw new Error('验证码错误')
  }
}

function buildSmsUser(phone) {
  const tail = phone.slice(-4)
  return {
    nickname: `用户${tail}`,
    avatar: '/assets/profile/boys.webp',
    avatarGender: 'male',
    phone,
    vipLevel: 1,
    balance: 0,
    couponCount: 0,
    userId: String(100000 + parseInt(phone.slice(-6), 10) % 900000),
  }
}

function buildWechatUser(code) {
  const seed = (code || '').slice(-6) || String(Date.now()).slice(-6)
  return {
    nickname: `微信用户${seed}`,
    avatar: '/assets/profile/boys.webp',
    avatarGender: 'male',
    phone: '',
    vipLevel: 1,
    balance: 0,
    couponCount: 0,
    userId: String(200000 + parseInt(seed.replace(/\D/g, '') || '0', 10) % 800000),
  }
}

async function sendSmsCode(phone, scene = 'login') {
  const normalized = normalizePhone(phone)
  if (!normalized) {
    throw new Error('请输入正确的 11 位手机号')
  }

  // TODO: POST ${apiBase}/auth/sms/send { phone, scene }
  await delay(ENV === 'dev' ? 400 : 600)

  try {
    wx.setStorageSync(`${SMS_STORAGE_PREFIX}${normalized}`, {
      code: MOCK_SMS_CODE,
      sentAt: Date.now(),
      scene,
    })
  } catch (err) {
    console.warn('[auth-api] cache sms code failed', err)
  }

  const result = { phone: normalized }
  if (ENV === 'dev') {
    result.devHint = `开发环境验证码：${MOCK_SMS_CODE}`
  }
  return result
}

async function loginWithSms(phone, code) {
  const normalized = normalizePhone(phone)
  if (!normalized) {
    throw new Error('请输入正确的手机号')
  }
  verifySmsCode(normalized, code)

  // TODO: POST ${apiBase}/auth/sms/login { phone, code }
  await delay(500)

  return {
    token: `mock_sms_${normalized}_${Date.now()}`,
    user: buildSmsUser(normalized),
  }
}

/**
 * 已登录用户绑定手机号（不换 token、不覆盖昵称等资料）
 */
async function bindPhone(phone, code) {
  const normalized = normalizePhone(phone)
  if (!normalized) {
    throw new Error('请输入正确的手机号')
  }
  verifySmsCode(normalized, code)

  // TODO: POST ${apiBase}/user/bind-phone { phone, code }
  await delay(500)

  return { phone: normalized }
}

function loginWithWechat() {
  return new Promise((resolve, reject) => {
    wx.login({
      timeout: 10000,
      success: async (res) => {
        if (!res.code) {
          reject(new Error('微信登录失败，请重试'))
          return
        }
        try {
          // TODO: POST ${apiBase}/auth/wechat { code }
          await delay(500)
          resolve({
            token: `mock_wx_${Date.now()}`,
            user: buildWechatUser(res.code),
          })
        } catch (err) {
          reject(err instanceof Error ? err : new Error('微信登录失败'))
        }
      },
      fail: () => reject(new Error('微信登录失败，请检查网络')),
    })
  })
}

module.exports = {
  apiBase,
  MOCK_SMS_CODE,
  normalizePhone,
  sendSmsCode,
  loginWithSms,
  bindPhone,
  loginWithWechat,
}
