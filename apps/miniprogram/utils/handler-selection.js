/**
 * 打手选择结果：子页 navigateBack 后由创建订单页 onShow 消费
 */
const { getHandlerById } = require('./api/repository')
const { buildHandlerSelectionPayload } = require('./handler-view-model')

/** @type {ReturnType<typeof buildHandlerSelectionPayload>|null} */
let pending = null

/**
 * @param {object|string} handlerOrId mock 打手对象或 id
 */
function setHandlerSelection(handlerOrId) {
  if (!handlerOrId) {
    pending = null
    return
  }
  const raw =
    typeof handlerOrId === 'string' ? getHandlerById(handlerOrId) : handlerOrId
  pending = buildHandlerSelectionPayload(raw)
}

function consumeHandlerSelection() {
  const value = pending
  pending = null
  return value
}

module.exports = {
  setHandlerSelection,
  consumeHandlerSelection,
}
