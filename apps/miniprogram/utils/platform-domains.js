/**
 * 平台域名（自动生成，请勿手改）
 * 修改 config/domains.json 后执行: npm run config:sync
 */
module.exports = {
  "rootDomain": "memepw.top",
  "brand": {
    "name": "迷因电竞",
    "nameDoc": "迷因电竞（meme电竞）"
  },
  "production": {
    "site": "https://memepw.top",
    "api": "https://api.memepw.top",
    "admin": "https://admin.memepw.top",
    "order": "https://memepw.top/order"
  },
  "development": {
    "apiHost": "127.0.0.1",
    "apiPort": 3000,
    "adminPort": 4180,
    "websitePort": 4173,
    "lanHost": "192.168.5.35"
  },
  "miniprogram": {
    "env": "dev",
    "comment": "上线前改为 prod；dev=本地/局域网 API，prod=production.api"
  },
  "wechat": {
    "requestLegalDomain": "api.memepw.top",
    "uploadFileDomain": "api.memepw.top",
    "downloadFileDomain": "meme-1322855353.cos.ap-guangzhou.myqcloud.com",
    "businessDomain": "memepw.top",
    "cosDownloadDomain": "meme-1322855353.cos.ap-guangzhou.myqcloud.com"
  },
  "prodApiBase": "https://api.memepw.top/api"
}

