import { Message, Notification } from "@arco-design/web-react";
import { IconNotification } from "@arco-design/web-react/icon";
import type { NavigateFunction } from "react-router-dom";
import { canWatchMyOrders, isDesignatedOrder, resolvePendingOrderPath } from "@/lib/order-routing";
import { playNewOrderSound } from "@/lib/order-notification-sound";

export type PendingOrderNotice = {
  id: string;
  productTitle: string;
  totalPaid: number;
  assignedPlayer?: string;
};

export function formatOrderBrief(order: Pick<PendingOrderNotice, "productTitle" | "totalPaid">) {
  return `${order.productTitle} · ¥${order.totalPaid}`;
}

/** 对比已知 ID，返回新增项并更新 knownIds（首次调用仅建立基线） */
export function collectFreshById<T extends { id: string }>(
  incoming: T[],
  knownIds: Set<string> | null,
): { fresh: T[]; knownIds: Set<string> } {
  const nextKnown = knownIds ?? new Set<string>();
  if (!knownIds) {
    for (const item of incoming) nextKnown.add(item.id);
    return { fresh: [], knownIds: nextKnown };
  }

  const fresh = incoming.filter((item) => !nextKnown.has(item.id));
  for (const item of incoming) nextKnown.add(item.id);
  return { fresh, knownIds: nextKnown };
}

/** 对比已知 ID，返回新订单并更新 knownIds */
export function collectFreshOrders(
  incoming: PendingOrderNotice[],
  knownIds: Set<string> | null,
) {
  return collectFreshById(incoming, knownIds);
}

function showOrderToast(orders: PendingOrderNotice[], designated: boolean) {
  if (orders.length === 1) {
    const prefix = designated ? "新指定订单" : "新订单";
    Message.info(`${prefix}：${formatOrderBrief(orders[0])}`);
    return;
  }
  Message.info(designated ? `有 ${orders.length} 笔新指定订单` : `有 ${orders.length} 笔新订单`);
}

function notificationAction(
  id: string,
  navigate: NavigateFunction,
  order: PendingOrderNotice,
  path?: string,
) {
  return (
    <span
      style={{ color: "rgb(var(--primary-6))", cursor: "pointer", fontSize: 12 }}
      onClick={() => {
        Notification.remove(id);
        navigate(path ?? resolvePendingOrderPath(order));
      }}
    >
      立即查看
    </span>
  );
}

export function notifyNewOrders(
  orders: PendingOrderNotice[],
  navigate: NavigateFunction,
  options?: { navigateTo?: string },
) {
  if (!orders.length) return;

  playNewOrderSound();

  const designated = options?.navigateTo ? true : orders.some(isDesignatedOrder);
  const title = designated ? "新指定订单" : "新订单待处理";
  const navPath = options?.navigateTo;

  showOrderToast(orders, designated);

  if (orders.length === 1) {
    const order = orders[0];
    Notification.info({
      id: `new-order-${order.id}`,
      title,
      content: formatOrderBrief(order),
      duration: 10_000,
      icon: <IconNotification />,
      btn: notificationAction(`new-order-${order.id}`, navigate, order, navPath),
    });
    return;
  }

  const id = `new-order-batch-${Date.now()}`;
  Notification.info({
    id,
    title: designated ? `有 ${orders.length} 笔新指定订单` : `有 ${orders.length} 笔新订单`,
    content: orders.slice(0, 3).map(formatOrderBrief).join("\n"),
    duration: 12_000,
    icon: <IconNotification />,
    btn: notificationAction(id, navigate, orders[0], navPath),
  });
}

/** 「我的订单」轮询新单：固定跳转我的订单页 */
export function notifyMyPendingOrders(orders: PendingOrderNotice[], navigate: NavigateFunction) {
  if (!canWatchMyOrders()) {
    notifyNewOrders(orders, navigate);
    return;
  }
  notifyNewOrders(orders, navigate, { navigateTo: "/orders/mine" });
}

/** 页面内轻量提醒（无 Notification 弹窗） */
export function notifyFreshOrdersToast(orders: PendingOrderNotice[]) {
  if (!orders.length) return;
  playNewOrderSound();
  showOrderToast(orders, orders.some(isDesignatedOrder));
}
