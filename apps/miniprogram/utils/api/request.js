/**
 * 微信 request 封装，统一对接 apps/server
 */
const { getApiBase } = require('../config')

function request(path, options = {}) {
  const url = `${getApiBase()}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (options.auth !== false) {
    try {
      const auth = require('../auth')
      const session = auth.getSession()
      if (session && session.token) {
        headers.Authorization = `Bearer ${session.token}`
      }
    } catch (err) {
      /* auth 未就绪 */
    }
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method: options.method || 'GET',
      data: options.body,
      header: headers,
      timeout: options.timeout || 15000,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }
        const message = (res.data && res.data.message) || `请求失败 (${res.statusCode})`
        reject(new Error(message))
      },
      fail(err) {
        console.error('[request] fail', url, err)
        const hint = (err && err.errMsg) || '网络异常'
        reject(
          new Error(
            `${hint}。请确认已运行 npm run server:dev，且 API 地址为 ${getApiBase()}`,
          ),
        )
      },
    })
  })
}

module.exports = {
  request,
}
