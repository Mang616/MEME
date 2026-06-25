/**
 * 邀请有礼广告
 * @property {object}  banner   文案（默认从 CMS invite-activity 加载）
 * @property {string}  variant  card（默认）| nav（导航栏 Logo 旁）
 * @property {boolean} compact  card 略压缩内边距
 * @fires tap
 */
const { fetchContent } = require('../../utils/api/content')
const {
  INVITE_ACTIVITY_DEFAULTS,
  toInviteBannerPayload,
} = require('../../utils/invite-activity-defaults')

const FALLBACK_BANNER = toInviteBannerPayload(INVITE_ACTIVITY_DEFAULTS)

Component({
  options: {
    virtualHost: true,
  },

  properties: {
    banner: {
      type: Object,
      value: FALLBACK_BANNER,
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

  lifetimes: {
    attached() {
      if (this.data.banner && this.data.banner.title) return
      void fetchContent('invite-activity')
        .catch(() => fetchContent('invite-banner'))
        .then((page) => {
          this.setData({
            banner: toInviteBannerPayload(page?.payload || INVITE_ACTIVITY_DEFAULTS),
          })
        })
        .catch((err) => {
          console.warn('[invite-banner] load failed', err.message)
          this.setData({ banner: FALLBACK_BANNER })
        })
    },
  },

  methods: {
    onTap() {
      this.triggerEvent('tap')
    },
  },
})
