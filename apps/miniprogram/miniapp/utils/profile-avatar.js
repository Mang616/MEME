/**
 * 我的页默认头像与性别偏好（男 / 女 / 沃尔玛塑料袋）
 */
const STORAGE_KEY = 'profile_avatar_gender'

const AVATAR_GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  BAG: 'bag',
}

const AVATAR_SRC = {
  [AVATAR_GENDER.MALE]: '/assets/profile/boys.png',
  [AVATAR_GENDER.FEMALE]: '/assets/profile/girls.png',
  [AVATAR_GENDER.BAG]: '/assets/profile/bag.png',
}

/** 个人资料页性别选项 */
const PROFILE_GENDER_OPTIONS = [
  { id: AVATAR_GENDER.MALE, label: '男' },
  { id: AVATAR_GENDER.FEMALE, label: '女' },
  { id: AVATAR_GENDER.BAG, label: '沃尔玛塑料袋', compact: true },
]

const VALID_GENDERS = new Set(Object.values(AVATAR_GENDER))

function normalizeGender(gender) {
  if (VALID_GENDERS.has(gender)) return gender
  return AVATAR_GENDER.MALE
}

function getStoredGender() {
  try {
    const value = wx.getStorageSync(STORAGE_KEY)
    if (VALID_GENDERS.has(value)) return value
  } catch (err) {
    console.warn('[profile-avatar] read storage failed', err)
  }
  return AVATAR_GENDER.MALE
}

function setStoredGender(gender) {
  const resolved = normalizeGender(gender)
  wx.setStorageSync(STORAGE_KEY, resolved)
  return resolved
}

function getAvatarSrc(gender) {
  return AVATAR_SRC[normalizeGender(gender)]
}

/** 已登录优先用 user.avatarGender，否则读本地偏好 */
function resolveGender(user) {
  if (user && user.avatarGender) {
    return normalizeGender(user.avatarGender)
  }
  return getStoredGender()
}

module.exports = {
  STORAGE_KEY,
  AVATAR_GENDER,
  PROFILE_GENDER_OPTIONS,
  AVATAR_SRC,
  normalizeGender,
  getStoredGender,
  setStoredGender,
  getAvatarSrc,
  resolveGender,
}
