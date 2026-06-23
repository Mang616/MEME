/**
 * 绑定手机号页状态
 */
const { getCodeBtnText } = require('./login-page')

function initBindPhonePage(prefillPhone = '') {
  return {
    phone: prefillPhone || '',
    smsCode: '',
    sending: false,
    submitting: false,
    countdown: 0,
    codeBtnText: getCodeBtnText(0, false),
  }
}

module.exports = {
  initBindPhonePage,
}
