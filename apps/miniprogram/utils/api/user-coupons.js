/**
 * 用户优惠券 API
 */
const { request } = require('./request')

async function listOrderCoupons(productId, quantity = 1) {
  const query = new URLSearchParams({
    productId: String(productId || ''),
    quantity: String(Math.max(1, Number(quantity) || 1)),
  })
  const res = await request(`/user/coupons?${query.toString()}`)
  return res.items || []
}

async function fetchAllCoupons() {
  const res = await request('/user/coupons')
  return res.items || []
}

module.exports = {
  listOrderCoupons,
  fetchAllCoupons,
}
