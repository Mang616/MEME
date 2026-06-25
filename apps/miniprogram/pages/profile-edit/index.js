const themedPage = require('../../behaviors/themed-page')
const auth = require('../../utils/auth')
const profileAvatar = require('../../utils/profile-avatar')
const {
  initProfileEditPage,
  validateNickname,
} = require('../../utils/profile-edit-page')
const { openLogin, openBindPhone } = require('../../utils/nav')
const { PAGE_ROUTES } = require('../../utils/constants')
const { showTip } = require('../../utils/ui')

Page({
  behaviors: themedPage,

  data: initProfileEditPage(),

  onLoad() {
    if (!auth.isLoggedIn()) {
      openLogin({ redirect: PAGE_ROUTES.PROFILE_EDIT })
    }
  },

  onShow() {
    if (!auth.isLoggedIn()) return
    this.setData(initProfileEditPage())
  },

  preventClose() {},

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },

  onGenderRowTap() {
    this.setData({ genderSheetVisible: true })
  },

  onCloseGenderSheet() {
    this.setData({ genderSheetVisible: false })
  },

  onGenderPick(e) {
    const { gender } = e.currentTarget.dataset
    if (!gender || gender === this.data.avatarGender) {
      this.onCloseGenderSheet()
      return
    }

    profileAvatar.setStoredGender(gender)
    auth.updateUser({ avatarGender: gender })
    this.setData({
      ...initProfileEditPage(),
      genderSheetVisible: false,
    })
    showTip('头像已更新', 'success')
  },

  onSaveNickname() {
    if (this.data.saving) return

    const err = validateNickname(this.data.nickname)
    if (err) {
      showTip(err)
      return
    }

    const nickname = String(this.data.nickname).trim()
    this.setData({ saving: true })
    auth.updateUser({ nickname })
    this.setData({
      ...initProfileEditPage(),
      nickname,
      saving: false,
    })
    showTip('资料已保存', 'success')
  },

  onBindPhoneTap() {
    if (this.data.hasPhone) {
      showTip(`已绑定 ${this.data.phoneMasked}`)
      return
    }
    openBindPhone()
  },
})
