/** 通用 UI 反馈 */

function showTip(title, icon = 'none') {
  wx.showToast({ title, icon })
}

/**
 * 提示资源不存在后延迟退出（详情 / 下单 / 会话等页共用）
 * @param {string} message
 * @param {{ delay?: number, fallbackTab?: () => void }} [options]
 */
function showNotFoundAndExit(message, options = {}) {
  const { delay = 600, fallbackTab } = options
  showTip(message)
  setTimeout(() => {
    if (getCurrentPages().length > 1) {
      wx.navigateBack()
      return
    }
    if (typeof fallbackTab === 'function') {
      fallbackTab()
      return
    }
    const { openHomeTab } = require('./nav')
    openHomeTab()
  }, delay)
}

function showMockFeature(name) {
  showTip(`${name}（mock）`)
}

function copyText(text, successTitle = '已复制') {
  if (!text) return
  wx.setClipboardData({
    data: String(text),
    success: () => showTip(successTitle, 'success'),
  })
}

module.exports = {
  showTip,
  showMockFeature,
  copyText,
  showNotFoundAndExit,
}
