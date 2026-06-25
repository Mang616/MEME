/**
 * 下拉刷新：执行异步任务后收起 refresher
 * @param {WechatMiniprogram.Component.Instance | null} refreshComp pull-refresh-scroll 实例
 * @param {() => void|Promise<void>} task
 * @param {{ minDuration?: number }} [options]
 */
function runPullRefresh(refreshComp, task, options = {}) {
  const minDuration = options.minDuration ?? 480
  const start = Date.now()

  return Promise.resolve()
    .then(() => task())
    .catch((err) => {
      console.error('[pull-refresh]', err)
    })
    .finally(() => {
      const wait = Math.max(0, minDuration - (Date.now() - start))
      setTimeout(() => {
        if (refreshComp && typeof refreshComp.stopRefresh === 'function') {
          refreshComp.stopRefresh()
        }
      }, wait)
    })
}

/** 从页面 selectComponent 链解析 pull-refresh-scroll */
function getPullRefresh(page, selector) {
  const node = page.selectComponent(selector)
  if (!node) return null
  if (typeof node.stopRefresh === 'function') return node
  return node.selectComponent('#pullRefresh')
}

module.exports = {
  runPullRefresh,
  getPullRefresh,
}
