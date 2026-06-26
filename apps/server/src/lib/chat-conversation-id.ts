/** 客服会话：每用户唯一 */
export function serviceConversationId(ownerUserId: string) {
  return `chat_svc_${ownerUserId}`;
}

/** 打手/陪玩订单会话：每订单唯一 */
export function playerConversationId(orderId: string) {
  return `chat_ord_${orderId}`;
}
