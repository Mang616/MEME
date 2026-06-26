/**
 * 首页 Banner 本地兜底（无图时显示渐变占位）
 *
 * image：可选；空则仅渐变
 * bgColor：占位主色
 * linkType：见 utils/constants.js BANNER_LINK
 */
const { BANNER_LINK, TAB_ROUTES, SERVICE_TYPE } = require('../constants')
const { storeName } = require('../config')

const BANNERS = [
  {
    id: 'b1',
    title: storeName,
    subtitle: '三角洲护航 · 专业车队',
    image: '',
    bgColor: '#2d4a35',
    linkType: BANNER_LINK.PRODUCTS,
    linkValue: SERVICE_TYPE.ESCORT,
  },
  {
    id: 'b2',
    title: '五一活动',
    subtitle: '限时特惠 · 点击查看',
    image: '',
    bgColor: '#3d5240',
    linkType: BANNER_LINK.TAB,
    linkValue: TAB_ROUTES.PRODUCTS,
  },
  {
    id: 'b3',
    title: '陪玩上车',
    subtitle: '高分选手 · 语音开黑',
    image: '',
    bgColor: '#354840',
    linkType: BANNER_LINK.PRODUCTS,
    linkValue: SERVICE_TYPE.COMPANION,
  },
]

module.exports = { BANNERS }
