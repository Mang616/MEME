/**
 * 帮助弹窗数据：补全 wx:for 用 key，避免 Skyline 下列表渲染异常
 */
const { getGuideById } = require('./mock/guides')

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

function presentGuideOnPage(page, entryId) {
  const guide = prepareGuideForModal(getGuideById(entryId))
  if (!guide) return false
  page.setData({
    guideVisible: true,
    activeGuide: guide,
  })
  return true
}

module.exports = {
  prepareGuideForModal,
  presentGuideOnPage,
}
