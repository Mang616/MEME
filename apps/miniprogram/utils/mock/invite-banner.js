/**
 * 邀请有礼文案 — 卡片（我的）与导航条（Logo 旁）共用
 * 默认数据见 invite-activity-defaults
 */
const {
  INVITE_ACTIVITY_DEFAULTS,
  toInviteBannerPayload,
} = require('../invite-activity-defaults')

const INVITE_BANNER = toInviteBannerPayload(INVITE_ACTIVITY_DEFAULTS)

module.exports = {
  INVITE_BANNER,
}
