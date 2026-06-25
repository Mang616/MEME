/**
 * 用户默认头像与性别（与 utils/user-profile.js 对齐）
 */
const {
  AVATAR_GENDER,
  normalizeAvatarGender,
} = require('./user-profile')

const { resolveLocalImage } = require('./local-image')

const AVATAR_SRC = {
  [AVATAR_GENDER.MALE]: resolveLocalImage('/assets/profile/boys.webp'),
  [AVATAR_GENDER.FEMALE]: resolveLocalImage('/assets/profile/girls.webp'),
  [AVATAR_GENDER.BAG]: resolveLocalImage('/assets/profile/bag.webp'),
}

/** 个人资料页性别选项 */
const PROFILE_GENDER_OPTIONS = [
  { id: AVATAR_GENDER.MALE, label: '男' },
  { id: AVATAR_GENDER.FEMALE, label: '女' },
  { id: AVATAR_GENDER.BAG, label: '沃尔玛塑料袋', compact: true },
]

function normalizeGender(gender) {
  return normalizeAvatarGender(gender)
}

function getAvatarSrc(gender) {
  return AVATAR_SRC[normalizeGender(gender)]
}

/** 优先服务端 avatar 路径，否则按 avatarGender 选默认图 */
function resolveUserAvatarSrc(user) {
  const custom = resolveLocalImage(user && user.avatar)
  if (custom) return custom
  return getAvatarSrc(resolveGender(user))
}

function resolveGender(user) {
  if (user && user.avatarGender) {
    return normalizeGender(user.avatarGender)
  }
  return AVATAR_GENDER.MALE
}

module.exports = {
  AVATAR_GENDER,
  PROFILE_GENDER_OPTIONS,
  normalizeGender,
  getAvatarSrc,
  resolveUserAvatarSrc,
  resolveGender,
}
