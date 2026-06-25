/**
 * 邀请有礼入口
 */
const auth = require('./auth')
const { PAGE_ROUTES } = require('./constants')
const { openInvite } = require('./nav')

function handleInviteTap(redirect) {
  if (!auth.requireLogin({ redirect: redirect || PAGE_ROUTES.INVITE })) return
  openInvite()
}

module.exports = {
  handleInviteTap,
}
