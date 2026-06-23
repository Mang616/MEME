/**
 * 邀请有礼广告
 * @property {object}  banner   文案，见 utils/mock/invite-banner.js
 * @property {string}  variant  card（默认）| nav（导航栏 Logo 旁）
 * @property {boolean} compact  card 略压缩内边距
 * @fires tap
 */
const { INVITE_BANNER } = require('../../utils/mock/invite-banner')

Component({
  options: {
    virtualHost: true,
  },

  properties: {
    banner: {
      type: Object,
      value: INVITE_BANNER,
    },
    variant: {
      type: String,
      value: 'card',
    },
    compact: {
      type: Boolean,
      value: false,
    },
  },

  methods: {
    onTap() {
      this.triggerEvent('tap')
    },
  },
})
