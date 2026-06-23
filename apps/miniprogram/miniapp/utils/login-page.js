/**
 * 登录页视图状态与验证码按钮文案
 */
const { brandLogo, storeName } = require('./config')

const COUNTDOWN_SEC = 60

function getCodeBtnText(countdown, sending) {
  if (countdown > 0) return `${countdown}s`
  if (sending) return '发送中…'
  return '获取验证码'
}

/** 合并 patch 并同步验证码按钮文案 */
function patchLoginView(data, patch = {}) {
  const next = { ...data, ...patch }
  return {
    ...patch,
    codeBtnText: getCodeBtnText(next.countdown, next.sending),
  }
}

function initLoginPage() {
  return {
    phone: '',
    smsCode: '',
    agreed: false,
    sending: false,
    submitting: false,
    wechatSubmitting: false,
    countdown: 0,
    codeBtnText: getCodeBtnText(0, false),
    brandLogo,
    storeName,
    tagline: '专业护航 · 贴心陪玩',
  }
}

function decodeLoginRedirect(options) {
  const raw = options && options.redirect
  return raw ? decodeURIComponent(raw) : ''
}

module.exports = {
  COUNTDOWN_SEC,
  getCodeBtnText,
  patchLoginView,
  /** @deprecated 绑定手机页沿用旧名 */
  patchCodeBtnState: patchLoginView,
  initLoginPage,
  decodeLoginRedirect,
}
