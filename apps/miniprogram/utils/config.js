/**
 * 全局配置
 */
const ENV = 'dev'

const API_BASE = {
  dev: 'http://localhost:3000/api',
  prod: 'https://your-api.example.com/api',
}

module.exports = {
  ENV,
  apiBase: API_BASE[ENV] || API_BASE.dev,
  /** 界面展示用品牌名（不含副标题） */
  storeName: '迷因电竞',
  /** 文档/README 等完整称谓 */
  storeNameDoc: '迷因电竞（meme电竞）',
  /** 品牌 Logo（页面内展示，非微信后台小程序图标） */
  brandLogo: '/assets/brand/logo.png',
  /** 首页未成年人下单提示 */
  minorOrderNotice: '未成年人禁止下单',
  /** 商品详情页合规声明 */
  platformNotice:
    '平台所有商品不涉及游戏代练、游戏装备及其他虚拟商品交易',
}
