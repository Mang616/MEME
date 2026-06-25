/**
 * 邀请好友页
 */
const { fetchInviteInfo } = require('./api/invite')
const { normalizeInviteActivityPayload } = require('./invite-activity-defaults')

function buildInvitePageState(payload) {
  const data = payload || {}
  const activity = normalizeInviteActivityPayload(data)

  return {
    inviteCode: data.inviteCode || '',
    qrDataUrl: data.qrDataUrl || '',
    posterDataUrl: data.posterDataUrl || '',
    qrText: data.qrText || '',
    sharePath: data.sharePath || '',
    shareTitle: activity.title,
    tag: activity.tag,
    title: activity.title,
    subtitle: activity.subtitle,
    rules: activity.rules,
  }
}

async function loadInvitePage() {
  const payload = await fetchInviteInfo()
  return buildInvitePageState(payload)
}

module.exports = {
  loadInvitePage,
}
