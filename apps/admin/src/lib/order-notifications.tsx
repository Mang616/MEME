import { Notification } from "@arco-design/web-react";
import { IconNotification } from "@arco-design/web-react/icon";
import type { NavigateFunction } from "react-router-dom";
import { resolvePendingOrderPath } from "@/lib/order-routing";
import { playNewOrderSound } from "@/lib/order-notification-sound";

export type PendingOrderNotice = {
  id: string;
  productTitle: string;
  totalPaid: number;
  assignedPlayer?: string;
};

function formatOrderBrief(order: PendingOrderNotice) {
  return `${order.productTitle} · ¥${order.totalPaid}`;
}

function notificationAction(id: string, navigate: NavigateFunction, order: PendingOrderNotice) {
  return (
    <span
      style={{ color: "rgb(var(--primary-6))", cursor: "pointer", fontSize: 12 }}
      onClick={() => {
        Notification.remove(id);
        navigate(resolvePendingOrderPath(order));
      }}
    >
      立即查看
    </span>
  );
}

/** 对比已知 ID，返回新订单并更新 knownIds */
export function collectFreshOrders(
  incoming: PendingOrderNotice[],
  knownIds: Set<string> | null,
): { fresh: PendingOrderNotice[]; knownIds: Set<string> } {
  const nextKnown = knownIds ?? new Set<string>();
  if (!knownIds) {
    for (const order of incoming) nextKnown.add(order.id);
    return { fresh: [], knownIds: nextKnown };
  }

  const fresh = incoming.filter((order) => !nextKnown.has(order.id));
  for (const order of incoming) nextKnown.add(order.id);
  return { fresh, knownIds: nextKnown };
}

export function notifyNewOrders(orders: PendingOrderNotice[], navigate: NavigateFunction) {
  if (!orders.length) return;

  playNewOrderSound();

  if (orders.length === 1) {
    const order = orders[0];
    Notification.info({
      id: `new-order-${order.id}`,
      title: "新订单待处理",
      content: formatOrderBrief(order),
      duration: 10_000,
      icon: <IconNotification />,
      btn: notificationAction(`new-order-${order.id}`, navigate, order),
    });
    return;
  }

  const id = `new-order-batch-${Date.now()}`;
  Notification.info({
    id,
    title: `有 ${orders.length} 笔新订单`,
    content: orders.slice(0, 3).map(formatOrderBrief).join("\n"),
    duration: 12_000,
    icon: <IconNotification />,
    btn: notificationAction(id, navigate, orders[0]),
  });
}
