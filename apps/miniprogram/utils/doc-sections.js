/**
 * 协议 / 指引类文档的章节列表格式化
 */
function mapDocSections(sections) {
  return (sections || []).map((section, index) => ({
    num: String(index + 1).padStart(2, '0'),
    title: section.title,
    paragraphs: section.paragraphs || [],
  }))
}

module.exports = {
  mapDocSections,
}
