/** 列表 / 页面空态占位图与尺寸约定 */
const EMPTY_STATE_IMAGE = '/assets/common/empty.png'

/** list-empty 的 size 属性合法值 */
const EMPTY_SIZE = {
  DEFAULT: 'default',
  COMPACT: 'compact',
  MINI: 'mini',
}

const EMPTY_SIZE_SET = new Set(Object.values(EMPTY_SIZE))

function normalizeEmptySize(size) {
  const value = String(size || '').trim()
  return EMPTY_SIZE_SET.has(value) ? value : EMPTY_SIZE.DEFAULT
}

module.exports = {
  EMPTY_STATE_IMAGE,
  EMPTY_SIZE,
  normalizeEmptySize,
}
