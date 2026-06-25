const coverMediaBehavior = require('../../behaviors/cover-media')

Component({
  behaviors: [coverMediaBehavior],

  options: {
    virtualHost: true,
  },

  properties: {
    src: { type: String, value: '' },
    color: { type: String, value: '' },
    mode: { type: String, value: 'aspectFill' },
    lazyLoad: { type: Boolean, value: false },
    placeholderClass: { type: String, value: '' },
    imageClass: { type: String, value: '' },
  },

  observers: {
    src() {
      this.resetCoverMedia()
    },
  },
})
