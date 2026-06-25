/**
 * 意见反馈配置（类型等；提交接口上线后接 API）
 */

const FEEDBACK_TYPES = [
  { id: 'feature', label: '功能建议' },
  { id: 'order', label: '订单问题' },
  { id: 'account', label: '账号安全' },
  { id: 'other', label: '其他' },
]

const CONTENT_MIN = 10
const CONTENT_MAX = 500

module.exports = {
  FEEDBACK_TYPES,
  CONTENT_MIN,
  CONTENT_MAX,
}
