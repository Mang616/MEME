import { AUTO_ASSIGN_LABEL } from "@/constants/orders";
import type { AdminPermission } from "@/lib/session";
import { hasAnyPermission } from "@/lib/session";

/** 可接收新订单轮询提醒的权限（需能处理待接单，不含只读） */
export const ORDER_WATCH_PERMISSIONS = ["orders.accept", "orders.dispatch"] as const satisfies readonly AdminPermission[];

export function canWatchPendingOrders() {
  return hasAnyPermission([...ORDER_WATCH_PERMISSIONS]);
}

/** 根据订单指派方式与用户权限，决定新订单提醒的跳转目标 */
export function resolvePendingOrderPath(order: { assignedPlayer?: string }) {
  if (order.assignedPlayer && order.assignedPlayer !== AUTO_ASSIGN_LABEL) {
    return "/orders/dispatch";
  }
  return hasAnyPermission(["orders.accept"]) ? "/hall" : "/orders/dispatch";
}
