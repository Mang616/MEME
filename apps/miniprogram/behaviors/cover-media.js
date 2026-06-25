/**
 * 封面图加载态：底层占位 + 成功后淡入，失败回占位
 */
const { COVER_MEDIA_RESET } = require('../utils/cover-media')

module.exports = Behavior({
  data: { ...COVER_MEDIA_RESET },

  methods: {
    resetCoverMedia() {
      this.setData({ ...COVER_MEDIA_RESET })
    },

    onCoverLoad() {
      this.setData({ coverImageReady: true, coverLoadFailed: false })
    },

    onCoverError() {
      this.setData({ coverImageReady: false, coverLoadFailed: true })
    },
  },
})
