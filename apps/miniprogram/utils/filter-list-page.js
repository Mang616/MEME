/**
 * 顶栏 Tab 筛选列表页共用逻辑（订单 / 聊天等）
 *
 * 页面约定：
 *   onLoad → const { cache, pageData } = initXxx(); this._cache = cache; setData(pageData)
 *   onTabChange → getTabChangeId + setData(buildSlice(this._cache, tabId))
 */
const { FILTER_ALL, buildTabsWithCounts } = require('./line-tabs')

function filterByTab(items, tabId, getGroupKey) {
  const list = items || []
  if (!tabId || tabId === FILTER_ALL) return list
  return list.filter((item) => getGroupKey(item) === tabId)
}

/**
 * @param {object} options
 * @param {{ id: string, label: string }[]} options.tabDefs
 * @param {Record<string, string>} options.emptyHints Tab 对应的空态文案（写入 fields.hint 指定字段）
 * @param {(item: object) => string} options.getGroupKey
 * @param {() => object[]} options.getSourceItems
 * @param {(item: object) => object} [options.enrichItem] 对筛选结果逐条 enrich
 * @param {boolean} [options.enrichOnInit=false] 为 true 时 init 阶段先 enrich 全量再缓存
 * @param {{ active: string, tabs: string, list: string, hint: string }} options.fields setData 字段名
 */
function createFilterListHandlers(options) {
  const {
    tabDefs,
    emptyHints,
    getGroupKey,
    getSourceItems,
    enrichItem = (item) => item,
    enrichOnInit = false,
    fields,
  } = options

  function mapList(items) {
    return (items || []).map(enrichItem)
  }

  function buildSlice(cachedItems, activeTabId = FILTER_ALL) {
    const tabId = activeTabId || FILTER_ALL
    const filtered = filterByTab(cachedItems, tabId, getGroupKey)
    const list = enrichOnInit ? filtered : mapList(filtered)

    return {
      [fields.active]: tabId,
      [fields.tabs]: buildTabsWithCounts(tabDefs, cachedItems, getGroupKey),
      [fields.list]: list,
      [fields.hint]: emptyHints[tabId] || emptyHints[FILTER_ALL] || '',
    }
  }

  function init(activeTabId = FILTER_ALL) {
    const source = getSourceItems() || []
    const cache = enrichOnInit ? mapList(source) : source
    return {
      cache,
      pageData: buildSlice(cache, activeTabId),
    }
  }

  return { init, buildSlice }
}

module.exports = {
  createFilterListHandlers,
}
