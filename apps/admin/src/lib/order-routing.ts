import { AUTO_ASSIGN_LABEL } from "@/constants/orders";
import type { AdminPermission } from "@/lib/session";
import { getAdminSession, hasAnyPermission, hasPermission } from "@/lib/session";
import { isLinkedServiceProvider } from "@/lib/service-provider-ui";

/** 可接收新订单轮询提醒的权限 */
export const ORDER_WATCH_PERMISSIONS = [
  "orders.accept",
  "orders.dispatch",
  "orders.mine",
] as const satisfies readonly AdminPermission[];

/** 可查看会话列表的权限 */
export const CHAT_VIEW_PERMISSIONS = ["chats.service", "chats.player"] as const satisfies readonly AdminPermission[];

export function canWatchPendingOrders() {
  return hasAnyPermission([...ORDER_WATCH_PERMISSIONS]);
}

export function canViewChats() {
  return hasAnyPermission([...CHAT_VIEW_PERMISSIONS]);
}

/** 我的订单轮询：需 orders.mine 且已绑定打手/陪玩档案 */
export function canWatchMyOrders(session = getAdminSession()) {
  if (!session || !hasPermission("orders.mine", session)) return false;
  return isLinkedServiceProvider(session);
}

/** 用户指定打手/陪玩（非系统自动分配） */
export function isDesignatedOrder(order: { assignedPlayer?: string }) {
  const player = order.assignedPlayer?.trim();
  return Boolean(player && player !== AUTO_ASSIGN_LABEL);
}

/** 根据订单指派方式与用户权限，决定新订单提醒的跳转目标 */
export function resolvePendingOrderPath(order: { assignedPlayer?: string }) {
  if (isDesignatedOrder(order)) {
    return canWatchMyOrders() ? "/orders/mine" : "/orders/dispatch";
  }
  return hasAnyPermission(["orders.accept"]) ? "/hall" : "/orders/dispatch";
}
