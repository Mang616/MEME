/**
 * 未成年人保护指引展示页状态
 */
const { getMinorGuide } = require('./mock/minor-guide')
const { mapDocSections } = require('./doc-sections')

function buildMinorGuidePageState() {
  const doc = getMinorGuide()
  return {
    title: doc.title,
    summary: doc.summary || '',
    notice: doc.notice || '',
    updatedAt: doc.updatedAt,
    sections: mapDocSections(doc.sections),
  }
}

module.exports = {
  buildMinorGuidePageState,
}
