/**
 * 页面层通用辅助（Tab 筛选列表、下拉刷新）
 */
const { getTabChangeId } = require('./line-tabs')
const { runPullRefresh, getPullRefresh } = require('./pull-refresh')

/**
 * 筛选列表页 onLoad：缓存数据源并 setData（initFn 可返回 Promise）
 */
function mountFilterList(page, initFn, { cacheKey, pickCache, pickPageData }) {
  const apply = (result) => {
    page[cacheKey] = pickCache(result)
    page.setData(pickPageData(result))
  }
  const result = initFn()
  if (result && typeof result.then === 'function') {
    return result.then(apply)
  }
  apply(result)
}

/** 筛选列表页 onTabChange */
function applyFilterTabChange(page, e, { activeKey, cacheKey, buildSlice }) {
  const tabId = getTabChangeId(e, page.data[activeKey])
  if (!tabId) return false
  page.setData(buildSlice(page[cacheKey], tabId))
  return true
}

/** 校验协议勾选 */
function ensureAgreed(agreed, message = '请先阅读并同意用户协议') {
  if (agreed) return true
  const { showTip } = require('./ui')
  showTip(message)
  return false
}

/**
 * 列表页下拉刷新：缓存未就绪时仅结束动画，否则执行 reload(page)
 */
/**
 * 列表页下拉刷新：缓存未就绪时仅结束动画，否则执行 reload(page)
 * @param {(page: object) => Promise<void>} [options.waitFor] 首次加载未完成时等待
 */
function runCachedListPullRefresh(page, { scrollSelector, cacheKey, reload, waitFor }) {
  const pr = getPullRefresh(page, scrollSelector)
  if (!waitFor && !page[cacheKey]) {
    pr?.stopRefresh?.()
    return
  }
  const ready = waitFor ? waitFor(page) : Promise.resolve()
  runPullRefresh(pr, () => ready.then(() => Promise.resolve().then(() => reload(page))))
}

module.exports = {
  mountFilterList,
  applyFilterTabChange,
  ensureAgreed,
  runCachedListPullRefresh,
}
