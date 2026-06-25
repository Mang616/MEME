/**
 * 将 base64 图片 data URL 写入相册
 */
function writeDataUrlToTempFile(dataUrl, prefix = 'album-image') {
  const fs = wx.getFileSystemManager()
  const filePath = `${wx.env.USER_DATA_PATH}/${prefix}-${Date.now()}.png`
  const base64 = String(dataUrl || '').replace(/^data:image\/\w+;base64,/, '')
  return new Promise((resolve, reject) => {
    fs.writeFile({
      filePath,
      data: base64,
      encoding: 'base64',
      success: () => resolve(filePath),
      fail: reject,
    })
  })
}

async function saveDataUrlToAlbum(dataUrl, prefix) {
  const filePath = await writeDataUrlToTempFile(dataUrl, prefix)
  await wx.saveImageToPhotosAlbum({ filePath })
  return filePath
}

function isAlbumAuthDenied(err) {
  const msg = err && err.errMsg ? String(err.errMsg) : ''
  return msg.includes('auth deny') || msg.includes('authorize')
}

module.exports = {
  saveDataUrlToAlbum,
  isAlbumAuthDenied,
}
