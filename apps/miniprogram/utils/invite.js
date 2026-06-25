/**
 * 邀请有礼入口（需登录，当前为 mock 提示）
 */
const auth = require('./auth')
const { showMockFeature } = require('./ui')

function handleInviteTap(redirect) {
  if (!auth.requireLogin({ redirect })) return
  showMockFeature('邀请有礼')
}

module.exports = {
  handleInviteTap,
}
