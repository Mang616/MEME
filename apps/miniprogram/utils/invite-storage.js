/**
 * 邀请人码暂存（首页 query 写入，注册绑定时消费）
 */
const PENDING_INVITER_KEY = 'pending_inviter'

function captureInviterFromQuery(options) {
  const code = options && (options.inviter || options.invite)
  if (!code) return
  try {
    wx.setStorageSync(PENDING_INVITER_KEY, String(code).trim())
  } catch (err) {
    console.warn('[invite] store pending inviter failed', err)
  }
}

function getPendingInviter() {
  try {
    return wx.getStorageSync(PENDING_INVITER_KEY) || ''
  } catch (err) {
    return ''
  }
}

function clearPendingInviter() {
  try {
    wx.removeStorageSync(PENDING_INVITER_KEY)
  } catch (err) {
    /* ignore */
  }
}

module.exports = {
  captureInviterFromQuery,
  getPendingInviter,
  clearPendingInviter,
}
