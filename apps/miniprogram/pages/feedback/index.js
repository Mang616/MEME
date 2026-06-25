const themedPage = require('../../behaviors/themed-page')
const { openServiceChat } = require('../../utils/nav')
const { showTip } = require('../../utils/ui')
const {
  initFeedbackPage,
  patchFeedbackContent,
  validateFeedback,
  submitFeedback,
} = require('../../utils/feedback-page')

Page({
  behaviors: themedPage,

  data: {
    types: [],
    typeId: '',
    content: '',
    contact: '',
    contentLength: 0,
    contentMax: 500,
    contentMin: 10,
    submitting: false,
    submitted: false,
  },

  onLoad() {
    void initFeedbackPage().then((state) => this.setData(state))
  },

  onShow() {
    if (this.data.submitted) return
    void initFeedbackPage().then((state) => this.setData(state))
  },

  onTypeTap(e) {
    const { id } = e.currentTarget.dataset
    if (!id || id === this.data.typeId) return
    this.setData({ typeId: id })
  },

  onContentInput(e) {
    this.setData(patchFeedbackContent(e.detail.value))
  },

  onContactInput(e) {
    this.setData({ contact: e.detail.value })
  },

  async onSubmit() {
    if (this.data.submitting || this.data.submitted) return

    const err = validateFeedback({
      typeId: this.data.typeId,
      content: this.data.content,
      contentMin: this.data.contentMin,
      contentMax: this.data.contentMax,
    })
    if (err) {
      showTip(err)
      return
    }

    this.setData({ submitting: true })
    try {
      await submitFeedback({
        typeId: this.data.typeId,
        content: this.data.content,
        contact: this.data.contact,
      })
      this.setData({ submitting: false, submitted: true })
      showTip('提交成功，感谢反馈', 'success')
    } catch (submitErr) {
      console.warn('[feedback] submit failed', submitErr)
      this.setData({ submitting: false })
      showTip('提交失败，请稍后重试')
    }
  },

  onSubmitAgain() {
    void initFeedbackPage().then((state) => this.setData(state))
  },

  onServiceTap() {
    openServiceChat()
  },
})
