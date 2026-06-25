/**
 * 首页未成年人提示条：关闭后不再展示（已确认满18周岁）
 */
const STORAGE_KEY = 'minor_notice_dismissed_v1'

function isMinorNoticeDismissed() {
  try {
    return wx.getStorageSync(STORAGE_KEY) === '1'
  } catch (err) {
    return false
  }
}

function setMinorNoticeDismissed() {
  try {
    wx.setStorageSync(STORAGE_KEY, '1')
  } catch (err) {
    console.warn('[minor-notice] persist dismiss failed', err)
  }
}

/** 关闭提示条时的年龄确认弹窗（须在页面上下文调用） */
function confirmMinorAge() {
  return new Promise((resolve) => {
    wx.showModal({
      title: '年龄确认',
      content: '请确认您是否已满18周岁',
      confirmText: '确认成年',
      cancelText: '未成年',
      success: (res) => {
        if (res.confirm) {
          setMinorNoticeDismissed()
          resolve('adult')
          return
        }
        if (res.cancel) {
          resolve('minor')
          return
        }
        resolve('dismiss')
      },
      fail: (err) => {
        console.warn('[minor-notice] showModal failed', err)
        resolve('fail')
      },
    })
  })
}

module.exports = {
  isMinorNoticeDismissed,
  setMinorNoticeDismissed,
  confirmMinorAge,
}
