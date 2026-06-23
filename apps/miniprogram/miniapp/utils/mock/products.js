/**
 * 商品 mock（列表 + 详情）
 * 后续由 server API 替换；cover 为 miniapp 根路径
 */

const PLATFORM_NOTICE =
  '平台所有商品不涉及游戏代练、游戏装备及其他虚拟商品交易'

const PRODUCTS = [
  {
    id: 'p1',
    serviceType: 'escort',
    categoryId: 'mayday',
    title: '68.8进绝密（每人限购1单）',
    desc: '绝密体验，保底3.33m-10m，性价比最高',
    price: 68.8,
    sold: 13345,
    tag: '推荐',
    cover: '',
    coverColor: '#2a3530',
    heroTitle: '绝密黑奴体验单',
    heroSubtitle: '68.8保333w-1000w',
    detailDesc:
      '绝密体验，保底3.33m-10m，性价比最高，无上限，炸单一直打，炸4把送1把，炸7把送2把，炸11把送3把，炸15把送4把，炸19把送5把，炸23把送6把，炸27把送7把，炸31把送8把，炸35把送9把，炸39把送10把。',
    views: 1226276,
    reviewCount: 43,
    positiveRate: 84,
    intro:
      '本单为绝密模式体验服务，适合想体验高端局护航的玩家。下单后请保持游戏在线，按客服指引组队。护航过程由平台认证车队完成，全程可语音沟通进度。',
    limitPerUser: 1,
  },
  {
    id: 'p2',
    serviceType: 'escort',
    categoryId: 'mayday',
    title: '拯救老板单',
    desc: '击杀30名敌方干员，成功撤离等',
    price: 588,
    sold: 1043,
    tag: '推荐',
    cover: '',
    coverColor: '#3d5240',
    heroTitle: '拯救老板单',
    heroSubtitle: '588保底清图撤离',
    detailDesc:
      '专业车队接单，目标击杀30名敌方干员并协助老板成功撤离。支持指定地图沟通，打手全程报点。若因不可抗力导致撤离失败，按平台规则协商补单或部分退款。',
    views: 286540,
    reviewCount: 128,
    positiveRate: 91,
    intro:
      '适合已破产或急需回本的玩家。下单前请确认账号可正常登录，并关闭二级密码等影响上号的设置。服务时段以预约时沟通为准。',
    limitPerUser: 0,
  },
  {
    id: 'p3',
    serviceType: 'escort',
    categoryId: 'welfare',
    title: '五红对对碰',
    desc: '消除任意两红，福利局体验',
    price: 588,
    sold: 320,
    tag: '新品',
    cover: '',
    coverColor: '#4a5f52',
    heroTitle: '五红对对碰',
    heroSubtitle: '福利局 · 出红更轻松',
    detailDesc:
      '福利专区活动单，消除任意两红即可结算。适合想体验出红氛围、又不愿承担过高风险的玩家。活动库存有限，售罄后自动下架。',
    views: 98420,
    reviewCount: 36,
    positiveRate: 88,
    intro:
      '本活动与日常护航单规则不同，请以详情页说明为准。出红截图需按客服要求上传，审核通过后完成结算。',
    limitPerUser: 2,
  },
  {
    id: 'p4',
    serviceType: 'escort',
    categoryId: 'discount',
    title: '我要aw子弹',
    desc: '5发 AW 子弹代刷',
    price: 128,
    sold: 89,
    tag: '',
    cover: '',
    coverColor: '#3a4540',
    heroTitle: 'AW子弹包',
    heroSubtitle: '5发 · 折扣区',
    detailDesc:
      '折扣区特价：包含5发 AW 子弹相关服务（具体以游戏内实际交付为准）。下单后30分钟内客服联系，请保持微信/游戏在线。',
    views: 45210,
    reviewCount: 12,
    positiveRate: 79,
    intro:
      '本商品为折扣区特价项，不支持七天无理由。如遇版本更新导致无法交付，将协商退款或更换等值服务。',
    limitPerUser: 3,
  },
  {
    id: 'p5',
    serviceType: 'companion',
    categoryId: 'companion-all',
    title: '娱乐陪玩 1 小时',
    desc: '语音开黑，娱乐局不限段位',
    price: 38,
    sold: 5621,
    tag: '推荐',
    cover: '',
    coverColor: '#2d3d35',
    heroTitle: '娱乐陪玩',
    heroSubtitle: '1小时语音开黑',
    detailDesc:
      '娱乐向陪玩1小时，不限段位、不限地图。陪玩师可陪聊、报点、娱乐局组队。禁止辱骂、挂机；如有不满意可在订单完成后24小时内申诉。',
    views: 198430,
    reviewCount: 892,
    positiveRate: 96,
    intro:
      '陪玩师均通过平台基础考核。下单时可备注偏好（娱乐/轻度教学/方言等），客服将尽量安排匹配。',
    limitPerUser: 0,
  },
  {
    id: 'p6',
    serviceType: 'companion',
    categoryId: 'companion-rank',
    title: '上分陪玩 2 小时',
    desc: '高分选手带队，支持指定地图',
    price: 128,
    sold: 2108,
    tag: '新品',
    cover: '',
    coverColor: '#3a5248',
    heroTitle: '上分陪玩',
    heroSubtitle: '2小时 · 冲分专场',
    detailDesc:
      '2小时上分陪玩，由高分段陪玩师带队。支持指定地图与打法风格沟通。不保证段位必定上升，但承诺尽力打好每一局并复盘关键失误。',
    views: 156780,
    reviewCount: 267,
    positiveRate: 93,
    intro:
      '适合想快速提升隐藏分或段位分的玩家。请提前告知当前段位、常用地图与时间段，以便安排合适陪玩师。',
    limitPerUser: 0,
  },
  {
    id: 'p7',
    serviceType: 'escort',
    categoryId: 'special',
    title: '趣味清图 · 语音整活',
    desc: '娱乐护航，轻松清图不掉心态',
    price: 198,
    sold: 756,
    tag: '推荐',
    cover: '',
    coverColor: '#354840',
    heroTitle: '趣味清图',
    heroSubtitle: '特色趣味单专区',
    detailDesc: '特色趣味单：以轻松娱乐为主，护航过程可语音互动，适合想放松的玩家。',
    views: 88420,
    reviewCount: 54,
    positiveRate: 90,
    intro: '下单请备注偏好风格，客服将安排合适车队。',
    limitPerUser: 0,
  },
  {
    id: 'p8',
    serviceType: 'escort',
    categoryId: 'guarantee',
    title: '保底 500w 撤离',
    desc: '保底带出，炸单按规则补打',
    price: 268,
    sold: 4210,
    tag: '推荐',
    cover: '',
    coverColor: '#2f4038',
    heroTitle: '保底撤离单',
    heroSubtitle: '500w 保底',
    detailDesc: '保底单：明确最低带出价值，未达保底按平台规则补单或协商处理。',
    views: 412300,
    reviewCount: 312,
    positiveRate: 92,
    intro: '请确认账号与地图要求后再下单。',
    limitPerUser: 0,
  },
  {
    id: 'p9',
    serviceType: 'escort',
    categoryId: 'season',
    title: '新赛季开荒护航',
    desc: '新赛季地图熟悉与物资积累',
    price: 328,
    sold: 1890,
    tag: '新品',
    cover: '',
    coverColor: '#3b4f44',
    heroTitle: '新赛季护航',
    heroSubtitle: '开荒专场',
    detailDesc: '新赛季专区：适合版本更新后快速熟悉地图机制与路线。',
    views: 256700,
    reviewCount: 98,
    positiveRate: 89,
    intro: '版本更新期间规则以游戏内为准。',
    limitPerUser: 1,
  },
  {
    id: 'p10',
    serviceType: 'escort',
    categoryId: 'fun',
    title: '整活局 · 全员语音',
    desc: '趣味玩法，不影响正常撤离',
    price: 158,
    sold: 632,
    tag: '',
    cover: '',
    coverColor: '#2a3832',
    heroTitle: '趣味整活',
    heroSubtitle: '娱乐优先',
    detailDesc: '趣味单：以娱乐互动为主，请文明沟通。',
    views: 67340,
    reviewCount: 41,
    positiveRate: 87,
    intro: '不适合竞技上分需求。',
    limitPerUser: 0,
  },
  {
    id: 'p11',
    serviceType: 'escort',
    categoryId: 'bigred',
    title: '大红挑战 · 出红为止',
    desc: '高价物资挑战，出红截图结算',
    price: 888,
    sold: 412,
    tag: '推荐',
    cover: '',
    coverColor: '#4a3f30',
    heroTitle: '大红挑战',
    heroSubtitle: '高价值物资',
    detailDesc: '大红单：以高价值物资为目标，规则以详情说明为准。',
    views: 198600,
    reviewCount: 67,
    positiveRate: 85,
    intro: '请按客服要求上传出货截图。',
    limitPerUser: 1,
  },
  {
    id: 'p12',
    serviceType: 'escort',
    categoryId: 'bingo',
    title: 'Bingo 连连看 · 3 局',
    desc: '三连挑战，完成即可结算',
    price: 388,
    sold: 278,
    tag: '新品',
    cover: '',
    coverColor: '#3d4a42',
    heroTitle: 'Bingo 连连看',
    heroSubtitle: '3 局挑战',
    detailDesc: 'Bingo 专区：完成指定连连看挑战即可结算，规则详见说明。',
    views: 92100,
    reviewCount: 29,
    positiveRate: 88,
    intro: '活动库存有限。',
    limitPerUser: 2,
  },
]

/** @param {string} id */
function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id) || null
}

/** 列表 + 详情完整数据 */
function getProductDetail(id) {
  const item = getProductById(id)
  if (!item) return null
  return { ...item }
}

function getProductsByCategory(serviceType, categoryId) {
  return PRODUCTS.filter(
    (p) => p.serviceType === serviceType && p.categoryId === categoryId
  )
}

function getProductsByServiceType(serviceType) {
  return PRODUCTS.filter((p) => p.serviceType === serviceType)
}

module.exports = {
  PLATFORM_NOTICE,
  PRODUCTS,
  getProductById,
  getProductDetail,
  getProductsByCategory,
  getProductsByServiceType,
}
