/** 帮助说明入口（我的页）— 对应 guides.js */
const { resolveLocalImage } = require('../local-image')

const QUICK_ENTRIES = [
  { id: 'guide', name: '购买说明', iconSrc: resolveLocalImage('/assets/profile/1.webp') },
  { id: 'notice', name: '下单须知', iconSrc: resolveLocalImage('/assets/profile/2.webp') },
  { id: 'cs', name: '客服', iconSrc: resolveLocalImage('/assets/profile/3.webp') },
  { id: 'live', name: '直播考核', iconSrc: resolveLocalImage('/assets/profile/4.webp') },
]

module.exports = {
  QUICK_ENTRIES,
}
