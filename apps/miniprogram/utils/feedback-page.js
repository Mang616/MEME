/**
 * 意见反馈页状态与校验
 */
const auth = require('./auth')
const { fetchContent } = require('./api/content')
const { request } = require('./api/request')

let feedbackConfig = null

async function ensureFeedbackConfig() {
  if (feedbackConfig) return feedbackConfig
  const page = await fetchContent('feedback-config')
  feedbackConfig = page.payload || { types: [], contentMin: 10, contentMax: 500 }
  return feedbackConfig
}

async function initFeedbackPage() {
  const cfg = await ensureFeedbackConfig()
  const user = auth.getUser()
  const phone = user && user.phone ? String(user.phone) : ''
  return {
    types: cfg.types || [],
    typeId: '',
    content: '',
    contact: phone,
    contentLength: 0,
    contentMax: cfg.contentMax || 500,
    contentMin: cfg.contentMin || 10,
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

function validateFeedback({ typeId, content, contentMin = 10, contentMax = 500 }) {
  if (!typeId) {
    return '请选择反馈类型'
  }
  const text = String(content || '').trim()
  if (text.length < contentMin) {
    return `请至少输入 ${contentMin} 字描述`
  }
  if (text.length > contentMax) {
    return `描述不超过 ${contentMax} 字`
  }
  return ''
}

async function submitFeedback({ typeId, content, contact }) {
  return request('/feedbacks', {
    method: 'POST',
    body: { typeId, content: String(content || '').trim(), contact: contact || '' },
  })
}

module.exports = {
  initFeedbackPage,
  patchFeedbackContent,
  validateFeedback,
  submitFeedback,
}
