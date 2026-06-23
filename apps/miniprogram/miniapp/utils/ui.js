/** 通用 UI 反馈 */

function showTip(title, icon = 'none') {
  wx.showToast({ title, icon })
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
}
