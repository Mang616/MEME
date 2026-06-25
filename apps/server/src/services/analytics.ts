import {
  listOrders,
  listUsers,
} from "../db/index.js";
import {
  aggregateProductSales,
  countByDay,
  eachDayKey,
  endOfDay,
  filterOrdersInRange,
  filterUsersInRange,
  formatChartLabel,
  parseDateTime,
  startOfDay,
  sumOrdersByDay,
  toDateKey,
} from "../lib/analytics-range.js";
import { getOverviewSnapshot } from "./analytics-overview.js";
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

export type AnalyticsReport = {
  range: { from: string; to: string };
  summary: {
    userTotal: number;
    newUsers: number;
    orderCount: number;
    revenue: number;
  };
  daily: {
    labels: string[];
    newUsers: number[];
    orders: number[];
    revenue: number[];
  };
  products: {
    byQuantity: { name: string; value: number }[];
    byAmount: { name: string; value: number }[];
  };
};

function resolveRange(from?: string, to?: string) {
  const now = new Date();
  const defaultTo = endOfDay(now);
  const defaultFrom = startOfDay(new Date(now.getTime() - 29 * 86400000));

  const start = from ? startOfDay(parseDateTime(`${from} 00:00:00`)) : defaultFrom;
  const end = to ? endOfDay(parseDateTime(`${to} 23:59:59`)) : defaultTo;

  if (start.getTime() > end.getTime()) {
    return { from: end, to: start };
  }
  return { from: start, to: end };
}

export const analyticsService = {
  async getOverview(): Promise<AnalyticsOverview> {
    return getOverviewSnapshot();
  },

  async getReport(from?: string, to?: string): Promise<AnalyticsReport> {
    const { from: rangeFrom, to: rangeTo } = resolveRange(from, to);
    const dayKeys = eachDayKey(rangeFrom, rangeTo);

    const [allUsers, allOrders] = await Promise.all([listUsers(), listOrders()]);
    const usersInRange = filterUsersInRange(allUsers, rangeFrom, rangeTo);
    const ordersInRange = filterOrdersInRange(allOrders, rangeFrom, rangeTo);

    let revenue = 0;
    for (const order of ordersInRange) {
      if (order.paid && !order.refunded) {
        revenue += order.totalPaid;
      }
    }

    const products = aggregateProductSales(ordersInRange);

    return {
      range: {
        from: toDateKey(rangeFrom),
        to: toDateKey(rangeTo),
      },
      summary: {
        userTotal: allUsers.length,
        newUsers: usersInRange.length,
        orderCount: ordersInRange.length,
        revenue: Math.round(revenue * 100) / 100,
      },
      daily: {
        labels: dayKeys.map(formatChartLabel),
        newUsers: countByDay(
          usersInRange.map((user) => user.registeredAt),
          dayKeys,
        ),
        orders: countByDay(
          ordersInRange.map((order) => order.orderTime),
          dayKeys,
        ),
        revenue: sumOrdersByDay(ordersInRange, dayKeys),
      },
      products,
    };
  },
};
