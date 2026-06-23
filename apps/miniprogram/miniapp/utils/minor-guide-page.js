/**
 * 未成年人保护指引展示页状态
 */
const { getMinorGuide } = require('./mock/minor-guide')

function buildSections(sections) {
  return (sections || []).map((section, index) => ({
    num: String(index + 1).padStart(2, '0'),
    title: section.title,
    paragraphs: section.paragraphs || [],
  }))
}

function buildMinorGuidePageState() {
  const doc = getMinorGuide()
  return {
    title: doc.title,
    summary: doc.summary || '',
    notice: doc.notice || '',
    updatedAt: doc.updatedAt,
    sections: buildSections(doc.sections),
  }
}

module.exports = {
  buildMinorGuidePageState,
}
