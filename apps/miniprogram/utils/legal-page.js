/**
 * 协议 / 隐私政策展示页状态
 */
const { fetchContent } = require('./api/content')
const { mapDocSections } = require('./doc-sections')

async function loadLegalPageState(type) {
  const docKind = type === 'privacy' ? 'privacy' : 'agreement'
  try {
    const page = await fetchContent(docKind)
    const doc = page.payload
    if (!doc) {
      return emptyLegalState(docKind)
    }
    return {
      title: doc.title,
      summary: doc.summary || '',
      updatedAt: doc.updatedAt,
      docKind,
      sections: mapDocSections(doc.sections),
    }
  } catch (err) {
    console.warn('[legal] load failed', err.message)
    return emptyLegalState(docKind)
  }
}

function emptyLegalState(docKind) {
  return {
    title: '文档不存在',
    summary: '',
    updatedAt: '',
    docKind,
    sections: [],
  }
}

module.exports = {
  loadLegalPageState,
}
