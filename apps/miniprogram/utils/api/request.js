/**
 * 微信 request 封装，统一对接 apps/server
 */
const { apiBase } = require('../config')

function request(path, options = {}) {
  const url = `${apiBase}${path}`

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: options.method || 'GET',
      data: options.body,
      header: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }
        const message = (res.data && res.data.message) || '请求失败'
        reject(new Error(message))
      },
      fail() {
        reject(new Error('网络异常，请先运行 npm run server:dev'))
      },
    })
  })
}

module.exports = {
  request,
}
