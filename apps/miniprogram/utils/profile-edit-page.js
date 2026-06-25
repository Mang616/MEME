/**
 * 个人资料编辑页状态
 */
const auth = require('./auth')
const profileAvatar = require('./profile-avatar')
const { PROFILE_GENDER_OPTIONS } = profileAvatar
const { maskPhone } = require('./format')

const NICKNAME_MAX = 20

function resolveGenderLabel(genderId) {
  const match = PROFILE_GENDER_OPTIONS.find((item) => item.id === genderId)
  return match ? match.label : '请选择'
}

function initProfileEditPage() {
  const user = auth.getUser() || {}
  const avatarGender = profileAvatar.resolveGender(user)
  return {
    nickname: user.nickname || '',
    avatarGender,
    avatarSrc: profileAvatar.getAvatarSrc(avatarGender),
    genderLabel: resolveGenderLabel(avatarGender),
    genderOptions: PROFILE_GENDER_OPTIONS,
    phoneMasked: maskPhone(user.phone),
    hasPhone: !!user.phone,
    nicknameMax: NICKNAME_MAX,
    saving: false,
    genderSheetVisible: false,
  }
}

function validateNickname(value) {
  const name = String(value || '').trim()
  if (!name) return '请输入昵称'
  if (name.length > NICKNAME_MAX) return `昵称不超过 ${NICKNAME_MAX} 字`
  return ''
}

module.exports = {
  NICKNAME_MAX,
  initProfileEditPage,
  validateNickname,
}
