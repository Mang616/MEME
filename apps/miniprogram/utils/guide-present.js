/**
 * 帮助弹窗数据：补全 wx:for 用 key，避免 Skyline 下列表渲染异常
 */
const { fetchContent } = require('./api/content')

let guidesMap = null
let guidesTask = null

async function ensureGuides() {
  if (guidesMap) return guidesMap
  if (!guidesTask) {
    guidesTask = fetchContent('guides')
      .then((page) => {
        guidesMap = page.payload || {}
        return guidesMap
      })
      .catch((err) => {
        guidesTask = null
        throw err
      })
  }
  return guidesTask
}

function getGuideById(id, map) {
  return map && map[id] ? map[id] : null
}

function prepareGuideBlocks(blocks) {
  return (blocks || []).map((block, index) => {
    const next = { ...block, blockKey: `b${index}` }
    if (block.type === 'rich' && block.parts) {
      next.parts = block.parts.map((part, partIndex) => ({
        ...part,
        partKey: `p${index}_${partIndex}`,
      }))
    }
    return next
  })
}

function prepareGuideForModal(guide) {
  if (!guide) return null
  return {
    ...guide,
    blocks: prepareGuideBlocks(guide.blocks),
  }
}

async function presentGuideOnPage(page, entryId) {
  const map = await ensureGuides()
  const guide = prepareGuideForModal(getGuideById(entryId, map))
  if (!guide) return false
  page.setData({
    guideVisible: true,
    activeGuide: guide,
  })
  return true
}

module.exports = {
  ensureGuides,
  prepareGuideForModal,
  presentGuideOnPage,
}
