/**
 * 短信验证码倒计时（登录 / 绑定手机共用）
 */
function createSmsCountdown(page, patchView) {
  let timer = null

  function clear() {
    if (!timer) return
    clearInterval(timer)
    timer = null
  }

  function start(sec) {
    clear()
    page.setData(patchView(page.data, { countdown: sec }))
    timer = setInterval(() => {
      const next = page.data.countdown - 1
      if (next <= 0) {
        clear()
        page.setData(patchView(page.data, { countdown: 0 }))
        return
      }
      page.setData(patchView(page.data, { countdown: next }))
    }, 1000)
  }

  return { start, clear }
}

module.exports = {
  createSmsCountdown,
}
