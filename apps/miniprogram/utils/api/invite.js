/**
 * 邀请好友 API
 */
const { request } = require('./request')

async function fetchInviteInfo() {
  return request('/user/invite')
}

module.exports = {
  fetchInviteInfo,
}
