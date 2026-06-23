/**
 * 打手 mock（选择打手页 + 下单）
 */
const { AVATAR_GENDER } = require('../profile-avatar')
const { ESCORT_LEVEL } = require('../escort-level')

const HANDLER_FILTER_TABS = [
  { id: 'all', label: '全部' },
  { id: 'male', label: '男生' },
  { id: 'female', label: '女生' },
  { id: 'pc', label: '端游' },
  { id: 'mobile', label: '手游' },
  { id: 'escort', label: '护航' },
  { id: 'companion', label: '陪玩' },
]

const HANDLER_GENDER_LABEL = {
  [AVATAR_GENDER.MALE]: '男',
  [AVATAR_GENDER.FEMALE]: '女',
}

const HANDLERS = [
  {
    id: 'h1',
    name: '魔王s 贰拾',
    level: ESCORT_LEVEL.DEMON,
    region: 'pc',
    serviceType: 'escort',
    gender: AVATAR_GENDER.MALE,
    avatar: '/assets/profile/boys.png',
    online: true,
  },
  {
    id: 'h2',
    name: '选手小李',
    level: ESCORT_LEVEL.ACE,
    region: 'pc',
    serviceType: 'escort',
    gender: AVATAR_GENDER.MALE,
    avatar: '/assets/home/huhang.png',
    online: true,
  },
  {
    id: 'h3',
    name: '选手小王',
    level: ESCORT_LEVEL.ACE,
    region: 'mobile',
    serviceType: 'companion',
    gender: AVATAR_GENDER.MALE,
    avatar: '/assets/home/peiwan.png',
    online: false,
  },
  {
    id: 'h4',
    name: '阿杰',
    level: ESCORT_LEVEL.ROOKIE,
    region: 'mobile',
    serviceType: 'escort',
    gender: AVATAR_GENDER.MALE,
    avatar: '/assets/profile/boys.png',
    online: true,
  },
  {
    id: 'h5',
    name: '小七',
    level: ESCORT_LEVEL.DEMON,
    region: 'pc',
    serviceType: 'companion',
    gender: AVATAR_GENDER.FEMALE,
    avatar: '/assets/profile/girls.png',
    online: true,
  },
  {
    id: 'h6',
    name: '老K',
    level: ESCORT_LEVEL.ROOKIE,
    region: 'pc',
    serviceType: 'companion',
    gender: AVATAR_GENDER.MALE,
    avatar: '/assets/profile/boys.png',
    online: false,
  },
]

function getHandlerById(id) {
  return HANDLERS.find((item) => item.id === id) || null
}

function getHandlerByName(name) {
  return HANDLERS.find((item) => item.name === name) || null
}

function listHandlers() {
  return HANDLERS
}

module.exports = {
  HANDLER_FILTER_TABS,
  HANDLER_GENDER_LABEL,
  getHandlerById,
  getHandlerByName,
  listHandlers,
}
