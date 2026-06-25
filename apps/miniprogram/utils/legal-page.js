/**
 * 协议 / 隐私政策展示页状态
 */
const { getLegalDoc } = require('./mock/legal')
const { mapDocSections } = require('./doc-sections')

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
    sections: mapDocSections(doc.sections),
  }
}

module.exports = {
  buildLegalPageState,
}
