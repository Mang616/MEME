const themedPage = require('../../behaviors/themed-page')
const auth = require('../../utils/auth')
const {
  buildProfileEditState,
  validateNickname,
} = require('../../utils/profile-edit-page')
const { openLogin, openBindPhone } = require('../../utils/nav')
const { PAGE_ROUTES } = require('../../utils/constants')
const { showTip } = require('../../utils/ui')

Page({
  behaviors: themedPage,

  data: buildProfileEditState(),

  onLoad() {
    if (!auth.isLoggedIn()) {
      openLogin({ redirect: PAGE_ROUTES.PROFILE_EDIT })
    }
  },

  async onShow() {
    if (!auth.isLoggedIn()) return
    try {
      await auth.syncProfile()
    } catch (err) {
      console.warn('[profile-edit] sync failed', err.message)
    }
    this.setData(buildProfileEditState())
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

  async onGenderPick(e) {
    const { gender } = e.currentTarget.dataset
    if (!gender || gender === this.data.avatarGender) {
      this.onCloseGenderSheet()
      return
    }

    this.setData({ saving: true })
    try {
      await auth.updateProfile({ avatarGender: gender })
      this.setData(buildProfileEditState({ genderSheetVisible: false }))
      showTip('头像已更新', 'success')
    } catch (err) {
      showTip(err.message || '更新失败')
    } finally {
      this.setData({ saving: false })
    }
  },

  async onSaveNickname() {
    if (this.data.saving) return

    const err = validateNickname(this.data.nickname)
    if (err) {
      showTip(err)
      return
    }

    const nickname = String(this.data.nickname).trim()
    this.setData({ saving: true })
    try {
      await auth.updateProfile({ nickname })
      this.setData(buildProfileEditState({ nickname }))
      showTip('资料已保存', 'success')
    } catch (err) {
      showTip(err.message || '保存失败')
    } finally {
      this.setData({ saving: false })
    }
  },

  onBindPhoneTap() {
    if (this.data.hasPhone) {
      showTip(`已绑定 ${this.data.phoneMasked}`)
      return
    }
    openBindPhone()
  },
})
