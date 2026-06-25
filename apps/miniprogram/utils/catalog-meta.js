/**
 * 商品 Tab 展示元数据（图标为小程序本地资源，Skyline 用 PNG）
 */
const { resolveLocalImage } = require('./local-image')

const SERVICE_TYPES = [
  {
    id: 'escort',
    name: '三角洲护航',
    tabLabel: '护航',
    tabImage: resolveLocalImage('/assets/home/huhang.webp'),
  },
  {
    id: 'companion',
    name: '三角洲陪玩',
    tabLabel: '陪玩',
    tabImage: resolveLocalImage('/assets/home/peiwan.webp'),
  },
]

module.exports = {
  SERVICE_TYPES,
}
