/**
 * 全局配置（域名见 config/domains.json → npm run config:sync）
 */
const platform = require('./platform-domains')

const { development, miniprogram, prodApiBase } = platform
const ENV = miniprogram.env === 'prod' ? 'prod' : 'dev'

function getDevApiBase() {
  try {
    const override = wx.getStorageSync('DEV_API_BASE')
    if (override && typeof override === 'string') {
      return override.replace(/\/$/, '')
    }
  } catch (err) {
    /* storage 未就绪 */
  }

  try {
    const device = wx.getDeviceInfo()
    if (device.platform === 'devtools') {
      return `http://${development.apiHost}:${development.apiPort}/api`
    }
  } catch (err) {
    /* wx 未就绪 */
  }

  return `http://${development.lanHost}:${development.apiPort}/api`
}

function getApiBase() {
  if (ENV === 'dev') return getDevApiBase()
  return prodApiBase
}

module.exports = {
  ENV,
  platform,
  getApiBase,
  get apiBase() {
    return getApiBase()
  },
  storeName: platform.brand.name,
  storeNameDoc: platform.brand.nameDoc,
  brandLogo: '/assets/brand/logo.png',
  minorOrderNotice: '未成年人禁止下单',
  platformNotice:
    '平台所有商品不涉及游戏代练、游戏装备及其他虚拟商品交易',
}
