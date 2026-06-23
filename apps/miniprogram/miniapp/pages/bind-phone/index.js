/**
 * 绑定手机号（需已登录；与登录页分离，不换 session）
 */
const themedPage = require('../../behaviors/themed-page')
const auth = require('../../utils/auth')
const { initBindPhonePage } = require('../../utils/bind-phone-page')
const { patchCodeBtnState } = require('../../utils/login-page')
const { openLogin } = require('../../utils/nav')
const { PAGE_ROUTES } = require('../../utils/constants')
const { maskPhone } = require('../../utils/format')
const { showTip } = require('../../utils/ui')

const COUNTDOWN_SEC = 60

Page({
  behaviors: themedPage,

  data: {
    ...initBindPhonePage(),
    showBound: false,
    maskedPhone: '',
  },

  onLoad() {
    if (!auth.isLoggedIn()) {
      showTip('请先登录')
      openLogin({ redirect: PAGE_ROUTES.BIND_PHONE })
      return
    }
    const user = auth.getUser()
    this.setData({
      ...initBindPhonePage(),
      showBound: !!(user && user.phone),
      maskedPhone: maskPhone(user && user.phone),
    })
  },

  onUnload() {
    this._clearCountdown()
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  onCodeInput(e) {
    this.setData({ smsCode: e.detail.value })
  },

  onSendCode() {
    const { phone, countdown, sending } = this.data
    if (sending || countdown > 0) return

    this.setData(patchCodeBtnState(this.data, { sending: true }))
    auth
      .sendBindPhoneCode(phone)
      .then((res) => {
        showTip('验证码已发送')
        if (res.devHint) setTimeout(() => showTip(res.devHint), 1600)
        this._startCountdown(COUNTDOWN_SEC)
      })
      .catch((err) => showTip(err.message || '发送失败'))
      .finally(() =>
        this.setData(patchCodeBtnState(this.data, { sending: false })),
      )
  },

  async onSubmit() {
    if (this.data.submitting) return
    const { phone, smsCode } = this.data

    this.setData({ submitting: true })
    try {
      await auth.bindPhone(phone, smsCode)
      showTip('绑定成功', 'success')
      setTimeout(() => wx.navigateBack(), 400)
    } catch (err) {
      showTip(err.message || '绑定失败')
    } finally {
      this.setData({ submitting: false })
    }
  },

  _startCountdown(sec) {
    this._clearCountdown()
    this.setData(patchCodeBtnState(this.data, { countdown: sec }))
    this._countdownTimer = setInterval(() => {
      const next = this.data.countdown - 1
      if (next <= 0) {
        this._clearCountdown()
        this.setData(patchCodeBtnState(this.data, { countdown: 0 }))
        return
      }
      this.setData(patchCodeBtnState(this.data, { countdown: next }))
    }, 1000)
  },

  _clearCountdown() {
    if (!this._countdownTimer) return
    clearInterval(this._countdownTimer)
    this._countdownTimer = null
  },
})
