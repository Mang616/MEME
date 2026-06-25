/**
 * 列表刷新时合并封面加载态：媒体标识未变则保留已加载标记
 */
const { resolveMediaIdentity } = require('./media-key')

function mergeCoverLoadedState(
  nextList,
  previousList,
  options = {},
) {
  const {
    idField = 'id',
    srcField = 'cover',
    revField = 'coverRev',
    identityField = 'coverKey',
    loadedField = 'coverLoaded',
  } = options

  const prevById = new Map(
    (previousList || []).map((item) => [item[idField], item]),
  )

  return (nextList || []).map((item) => {
    const prev = prevById.get(item[idField])
    const identity =
      item[identityField] ||
      resolveMediaIdentity(item[srcField], item[revField])
    const prevIdentity =
      prev &&
      (prev[identityField] ||
        resolveMediaIdentity(prev[srcField], prev[revField]))

    const merged = { ...item, [identityField]: identity }
    if (prev && prevIdentity === identity && prev[loadedField]) {
      merged[loadedField] = true
    }
    return merged
  })
}

function mergeBannerLoadedState(nextList, previousList) {
  const prevById = new Map((previousList || []).map((item) => [item.id, item]))

  return (nextList || []).map((item) => {
    const prev = prevById.get(item.id)
    const imageKey =
      item.imageKey || resolveMediaIdentity(item.image, item.imageRev)
    const prevKey =
      prev &&
      (prev.imageKey || resolveMediaIdentity(prev.image, prev.imageRev))

    const merged = { ...item, imageKey }
    if (prev && prevKey === imageKey && prev.showImage) {
      merged.showImage = true
    }
    return merged
  })
}

module.exports = {
  mergeCoverLoadedState,
  mergeBannerLoadedState,
}
