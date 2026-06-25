/**
 * 未成年人保护指引展示页状态
 */
const { fetchContent } = require('./api/content')
const { mapDocSections } = require('./doc-sections')

async function loadMinorGuidePageState() {
  const page = await fetchContent('minor-guide')
  const doc = page.payload
  return {
    title: doc.title,
    summary: doc.summary || '',
    notice: doc.notice || '',
    updatedAt: doc.updatedAt,
    sections: mapDocSections(doc.sections),
  }
}

module.exports = {
  loadMinorGuidePageState,
}
