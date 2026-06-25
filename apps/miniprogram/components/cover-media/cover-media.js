const coverMediaBehavior = require('../../behaviors/cover-media')
const { resolveMediaIdentity } = require('../../utils/media-key')

Component({
  behaviors: [coverMediaBehavior],

  options: {
    virtualHost: true,
  },

  properties: {
    src: { type: String, value: '' },
    mediaKey: { type: String, value: '' },
    mediaRev: { type: Number, value: 0 },
    color: { type: String, value: '' },
    mode: { type: String, value: 'aspectFill' },
    lazyLoad: { type: Boolean, value: false },
    placeholderClass: { type: String, value: '' },
    imageClass: { type: String, value: '' },
  },

  observers: {
    'src, mediaKey, mediaRev'(src, mediaKey, mediaRev) {
      const nextKey = mediaKey || resolveMediaIdentity(src, mediaRev)
      if (nextKey === this._coverMediaKey) return
      this._coverMediaKey = nextKey
      this.resetCoverMedia()
    },
  },
})
