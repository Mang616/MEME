/**
 * 导航栏尺寸（状态栏 + 内容栏），供 navigation-bar 注入 CSS 变量
 *
 * --nav-safe-top  状态栏/刘海高度（px）
 * --nav-bar-h     导航内容区高度（iOS 44 / Android 48）
 * --nav-total-h   二者之和，组件总高度
 */
function buildNavBarMetrics() {
  const sys = wx.getWindowInfo() || wx.getSystemInfoSync()
  const platform = (wx.getDeviceInfo() || wx.getSystemInfoSync()).platform
  const safeTop = sys.safeArea?.top ?? 0
  const barHeight = platform === 'android' ? 48 : 44

  return {
    isIos: platform !== 'android',
    metricsStyle: `--nav-safe-top:${safeTop}px;--nav-bar-h:${barHeight}px`,
  }
}

module.exports = {
  buildNavBarMetrics,
}
