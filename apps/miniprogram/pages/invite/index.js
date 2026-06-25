const themedPage = require('../../behaviors/themed-page')
const auth = require('../../utils/auth')
const { TAB_ROUTES, PAGE_ROUTES } = require('../../utils/constants')
const { showTip } = require('../../utils/ui')
const { loadInvitePage } = require('../../utils/invite-page')
const { saveDataUrlToAlbum, isAlbumAuthDenied } = require('../../utils/save-album-image')

Page({
  behaviors: themedPage,

  data: {
    loading: true,
    inviteCode: '',
    qrDataUrl: '',
    posterDataUrl: '',
    sharePath: '',
    shareTitle: '',
    tag: '',
    title: '',
    subtitle: '',
    rules: [],
    saving: false,
    savingPoster: false,
  },

  onLoad() {
    if (!auth.requireLogin({ redirect: PAGE_ROUTES.INVITE })) return
    void this.reload()
  },

  onShow() {
    if (!auth.isLoggedIn()) return
    if (!this.data.loading) {
      void this.reload()
    }
  },

  async reload() {
    this.setData({ loading: true })
    try {
      const state = await loadInvitePage()
      this.setData({ ...state, loading: false })
    } catch (err) {
      this.setData({ loading: false })
      showTip(err.message || '加载失败')
    }
  },

  onCopyCode() {
    const { inviteCode } = this.data
    if (!inviteCode) return
    wx.setClipboardData({
      data: inviteCode,
      success: () => {
        wx.showToast({ title: '邀请码已复制', icon: 'none' })
      },
    })
  },

  async saveImageToAlbum(dataUrl, loadingKey, successToast, filePrefix) {
    if (!dataUrl || this.data[loadingKey]) return
    this.setData({ [loadingKey]: true })
    try {
      await saveDataUrlToAlbum(dataUrl, filePrefix)
      wx.showToast({ title: successToast, icon: 'success' })
    } catch (err) {
      showTip(isAlbumAuthDenied(err) ? '请允许保存到相册后重试' : (err.message || '保存失败'))
    } finally {
      this.setData({ [loadingKey]: false })
    }
  },

  onSavePoster() {
    void this.saveImageToAlbum(
      this.data.posterDataUrl,
      'savingPoster',
      '海报已保存',
      'invite-poster',
    )
  },

  onSaveQr() {
    void this.saveImageToAlbum(this.data.qrDataUrl, 'saving', '已保存到相册', 'invite-qr')
  },

  onShareAppMessage() {
    const { shareTitle, sharePath } = this.data
    return {
      title: shareTitle || '邀请好友 · 领取奖励',
      path: sharePath || TAB_ROUTES.HOME,
    }
  },
})
