/**
 * 意见反馈页状态与校验
 */
const auth = require('./auth')
const {
  FEEDBACK_TYPES,
  CONTENT_MIN,
  CONTENT_MAX,
} = require('./mock/feedback')

function initFeedbackPage() {
  const user = auth.getUser()
  const phone = user && user.phone ? String(user.phone) : ''
  return {
    types: FEEDBACK_TYPES,
    typeId: '',
    content: '',
    contact: phone,
    contentLength: 0,
    contentMax: CONTENT_MAX,
    submitting: false,
    submitted: false,
  }
}

function patchFeedbackContent(content) {
  const text = String(content || '')
  return {
    content: text,
    contentLength: text.length,
  }
}

function validateFeedback({ typeId, content }) {
  if (!typeId) {
    return '请选择反馈类型'
  }
  const text = String(content || '').trim()
  if (text.length < CONTENT_MIN) {
    return `请至少输入 ${CONTENT_MIN} 字描述`
  }
  if (text.length > CONTENT_MAX) {
    return `描述不超过 ${CONTENT_MAX} 字`
  }
  return ''
}

/** mock 提交，上线后替换为 API */
function submitFeedbackMock() {
  return new Promise((resolve) => {
    setTimeout(resolve, 500)
  })
}

module.exports = {
  initFeedbackPage,
  patchFeedbackContent,
  validateFeedback,
  submitFeedbackMock,
  CONTENT_MIN,
}
