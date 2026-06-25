/**
 * 登录：短信验证码 + 底部微信快捷登录
 */
const themedPage = require('../../behaviors/themed-page')
const auth = require('../../utils/auth')
const { navigateAfterLogin, openAgreement, openPrivacy } = require('../../utils/nav')
const {
  COUNTDOWN_SEC,
  initLoginPage,
  patchLoginView,
  decodeLoginRedirect,
} = require('../../utils/login-page')
const { createSmsCountdown } = require('../../utils/sms-countdown')
const { ensureAgreed } = require('../../utils/page-helpers')
const { showTip } = require('../../utils/ui')

const LOGIN_SUCCESS_DELAY = 400

Page({
  behaviors: themedPage,

  data: initLoginPage(),

  onLoad(options) {
    this._redirect = decodeLoginRedirect(options)
    this._smsCountdown = createSmsCountdown(this, patchLoginView)
  },

  onUnload() {
    if (this._smsCountdown) this._smsCountdown.clear()
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  onCodeInput(e) {
    this.setData({ smsCode: e.detail.value })
  },

  onToggleAgree() {
    this.setData({ agreed: !this.data.agreed })
  },

  onOpenAgreement() {
    openAgreement()
  },

  onOpenPrivacy() {
    openPrivacy()
  },

  onSendCode() {
    const { phone, countdown, sending } = this.data
    if (sending || countdown > 0) return

    this._patchView({ sending: true })
    auth
      .sendSmsCode(phone)
      .then((res) => {
        showTip('验证码已发送')
        if (res.devHint) {
          setTimeout(() => showTip(res.devHint), 1600)
        }
        this._smsCountdown.start(COUNTDOWN_SEC)
      })
      .catch((err) => showTip(err.message || '发送失败'))
      .finally(() => this._patchView({ sending: false }))
  },

  onSmsLogin() {
    if (this.data.submitting) return
    this._runLogin(
      () => auth.loginBySms(this.data.phone, this.data.smsCode),
      { submitting: true },
    )
  },

  onWechatLogin() {
    if (this.data.wechatSubmitting || this.data.submitting) return
    this._runLogin(() => auth.loginByWechat(), { wechatSubmitting: true })
  },

  _patchView(patch) {
    this.setData(patchLoginView(this.data, patch))
  },

  async _runLogin(loginTask, loadingPatch) {
    if (!ensureAgreed(this.data.agreed)) return

    this.setData(loadingPatch)
    try {
      await loginTask()
      showTip('登录成功', 'success')
      setTimeout(
        () => navigateAfterLogin(this._redirect),
        LOGIN_SUCCESS_DELAY,
      )
    } catch (err) {
      showTip(err.message || '登录失败')
    } finally {
      const reset = {}
      Object.keys(loadingPatch).forEach((key) => {
        reset[key] = false
      })
      this.setData(reset)
    }
  },
})
