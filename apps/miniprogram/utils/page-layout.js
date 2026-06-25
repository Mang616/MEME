/**
 * Skyline 页面可视区尺寸（scroll-view 须明确高度，不能依赖 enableScrollViewAutoSize）
 *
 * --page-window-h  当前页可用窗口高度（Tab 页不含原生 TabBar）
 * --page-body-h    扣除自定义导航栏后的内容区高度
 * --nav-total-h    状态栏 + 导航内容区
 */
function readDevicePlatform() {
  try {
    return wx.getDeviceInfo().platform
  } catch {
    return 'devtools'
  }
}

function getWindowMetrics() {
  const win = wx.getWindowInfo()
  const platform = readDevicePlatform()
  const safeTop = win.safeArea?.top ?? 0
  const barH = platform === 'android' ? 48 : 44
  const navTotal = safeTop + barH
  const windowHeight = win.windowHeight ?? win.screenHeight ?? 0

  return {
    safeTop,
    barH,
    navTotal,
    windowHeight,
    bodyHeight: Math.max(0, windowHeight - navTotal),
  }
}

function buildPageShellStyle() {
  const m = getWindowMetrics()
  return [
    `--nav-safe-top:${m.safeTop}px`,
    `--nav-bar-h:${m.barH}px`,
    `--nav-total-h:${m.navTotal}px`,
    `--page-window-h:${m.windowHeight}px`,
    `--page-body-h:${m.bodyHeight}px`,
  ].join(';')
}

module.exports = {
  getWindowMetrics,
  buildPageShellStyle,
}
