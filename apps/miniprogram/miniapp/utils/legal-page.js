/**
 * 协议 / 隐私政策展示页状态
 */
const { getLegalDoc } = require('./mock/legal')

function buildSections(sections) {
  return (sections || []).map((section, index) => ({
    num: String(index + 1).padStart(2, '0'),
    title: section.title,
    paragraphs: section.paragraphs || [],
  }))
}

function buildLegalPageState(type) {
  const docKind = type === 'privacy' ? 'privacy' : 'agreement'
  const doc = getLegalDoc(docKind)
  if (!doc) {
    return {
      title: '文档不存在',
      summary: '',
      updatedAt: '',
      docKind,
      sections: [],
    }
  }
  return {
    title: doc.title,
    summary: doc.summary || '',
    updatedAt: doc.updatedAt,
    docKind,
    sections: buildSections(doc.sections),
  }
}

module.exports = {
  buildLegalPageState,
}
