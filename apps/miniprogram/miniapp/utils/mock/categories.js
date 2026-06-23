/**
 * 分类 mock — 后续由 server API 替换
 */

/** Tab 人物图：360×216 透明 PNG，右下对齐，路径相对 miniapp 根目录 */
const SERVICE_TYPES = [
  {
    id: 'escort',
    name: '三角洲护航',
    tabLabel: '护航',
    tabImage: '/assets/home/huhang.png',
  },
  {
    id: 'companion',
    name: '三角洲陪玩',
    tabLabel: '陪玩',
    tabImage: '/assets/home/peiwan.png',
  },
]

const SUB_CATEGORIES = {
  escort: [
    { id: 'mayday', name: '五一活动单' },
    { id: 'welfare', name: '福利单' },
    { id: 'discount', name: '折扣区' },
    { id: 'special', name: '特色趣味单' },
    { id: 'guarantee', name: '保底单' },
    { id: 'season', name: '新赛季单' },
    { id: 'fun', name: '趣味单' },
    { id: 'bigred', name: '大红单' },
    { id: 'bingo', name: 'bingo连连看' },
  ],
  companion: [
    { id: 'companion-all', name: '全部陪玩' },
    { id: 'companion-rank', name: '上分陪玩' },
  ],
}

module.exports = {
  SERVICE_TYPES,
  SUB_CATEGORIES,
}
