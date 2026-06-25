import {
  listChatConversations,
  listFeedbacks,
  listHandlers,
  listOrders,
  listProducts,
  listUsers,
} from "../db/index.js";
import type { OrderStatus } from "@meme/types";

const ORDER_STATUSES: OrderStatus[] = [
  "pending_accept",
  "pending_confirm",
  "completed",
  "after_sale",
];

export type AnalyticsOverview = {
  orders: {
    total: number;
    revenue: number;
    byStatus: Record<OrderStatus, number>;
  };
  products: {
    total: number;
    published: number;
    sold: number;
  };
  users: {
    total: number;
    active: number;
  };
  handlers: {
    total: number;
    online: number;
  };
  service: {
    conversations: number;
    unread: number;
    feedbacks: number;
  };
};

export async function getOverviewSnapshot(): Promise<AnalyticsOverview> {
  const [orders, products, users, handlers, conversations, feedbacks] = await Promise.all([
    listOrders(),
    listProducts(),
    listUsers(),
    listHandlers(),
    listChatConversations(),
    listFeedbacks(),
  ]);

  const byStatus = Object.fromEntries(
    ORDER_STATUSES.map((status) => [status, 0]),
  ) as Record<OrderStatus, number>;

  let revenue = 0;
  for (const order of orders) {
    byStatus[order.status] = (byStatus[order.status] ?? 0) + 1;
    if (order.paid && !order.refunded) {
      revenue += order.totalPaid;
    }
  }

  let sold = 0;
  let published = 0;
  for (const product of products) {
    sold += product.sold;
    if (product.published !== false) published += 1;
  }

  let activeUsers = 0;
  for (const user of users) {
    if (user.status === "active") activeUsers += 1;
  }

  let onlineHandlers = 0;
  for (const handler of handlers) {
    if (handler.online) onlineHandlers += 1;
  }

  let unread = 0;
  for (const conversation of conversations) {
    unread += conversation.staffUnread ?? 0;
  }

  return {
    orders: {
      total: orders.length,
      revenue,
      byStatus,
    },
    products: {
      total: products.length,
      published,
      sold,
    },
    users: {
      total: users.length,
      active: activeUsers,
    },
    handlers: {
      total: handlers.length,
      online: onlineHandlers,
    },
    service: {
      conversations: conversations.length,
      unread,
      feedbacks: feedbacks.length,
    },
  };
}
