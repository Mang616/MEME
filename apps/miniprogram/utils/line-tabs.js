/**
 * 顶栏 line-tabs 数据规范（与 components/line-tabs、wxs/line-tabs.wxs 配套）
 *
 * Tab 项：{ id, label?, tabLabel?, count?, showCount? }
 * showCount 默认：count > 0 为 true
 */

const FILTER_ALL = 'all'

/** 解析 Tab 变更事件，与当前 id 相同则返回 null */
function getTabChangeId(e, currentId) {
  const { id } = (e && e.detail) || {}
  if (!id || id === currentId) return null
  return id
}

function getTabLabel(tab) {
  if (!tab) return ''
  return tab.label || tab.tabLabel || ''
}

function shouldShowCount(tab) {
  if (!tab) return false
  if (tab.showCount === true) return true
  if (tab.showCount === false) return false
  const count = tab.count
  return typeof count === 'number' && count > 0
}

function normalizeTabs(tabs) {
  return (tabs || []).map((tab) => ({
    ...tab,
    label: getTabLabel(tab),
    showCount: shouldShowCount(tab),
  }))
}

/**
 * 带数量的筛选 Tab（订单状态 / 聊天类型等共用）
 * @param {{ id: string, label: string }[]} tabDefs
 * @param {object[]} items 全量列表（用于统计）
 * @param {(item: object) => string} getGroupKey 非「全部」时的分组键
 */
function buildTabsWithCounts(tabDefs, items, getGroupKey) {
  const list = items || []
  const counts = {}

  list.forEach((item) => {
    const key = getGroupKey(item)
    if (!key) return
    counts[key] = (counts[key] || 0) + 1
  })

  return tabDefs.map((tab) => {
    const count =
      tab.id === FILTER_ALL ? list.length : counts[tab.id] || 0
    const row = { id: tab.id, label: tab.label, count }
    return { ...row, showCount: shouldShowCount(row) }
  })
}

module.exports = {
  FILTER_ALL,
  getTabChangeId,
  normalizeTabs,
  buildTabsWithCounts,
}
