import type { Order } from "../types.js";
import type { AppUser } from "../types.js";

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseDateTime(value: string) {
  return new Date(value.replace(" ", "T"));
}

export function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

export function eachDayKey(from: Date, to: Date) {
  const keys: string[] = [];
  const cursor = startOfDay(from);
  const end = startOfDay(to);
  while (cursor <= end) {
    keys.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

export function formatChartLabel(dateKey: string) {
  const [, month, day] = dateKey.split("-");
  return `${month}-${day}`;
}

export function isWithinRange(value: string, from: Date, to: Date) {
  const time = parseDateTime(value).getTime();
  return time >= from.getTime() && time <= to.getTime();
}

export function countByDay(values: string[], dayKeys: string[]) {
  const map = Object.fromEntries(dayKeys.map((key) => [key, 0])) as Record<string, number>;
  for (const value of values) {
    const key = toDateKey(parseDateTime(value));
    if (key in map) map[key] += 1;
  }
  return dayKeys.map((key) => map[key]);
}

export function sumOrdersByDay(orders: Order[], dayKeys: string[]) {
  const map = Object.fromEntries(dayKeys.map((key) => [key, 0])) as Record<string, number>;
  for (const order of orders) {
    if (!order.paid || order.refunded) continue;
    const key = toDateKey(parseDateTime(order.orderTime));
    if (key in map) map[key] += order.totalPaid;
  }
  return dayKeys.map((key) => Math.round(map[key] * 100) / 100);
}

export function aggregateProductSales(orders: Order[]) {
  const byQuantity = new Map<string, number>();
  const byAmount = new Map<string, number>();

  for (const order of orders) {
    if (!order.paid || order.refunded) continue;
    const title = order.product.title;
    const qty = order.product.quantity ?? 1;
    byQuantity.set(title, (byQuantity.get(title) ?? 0) + qty);
    byAmount.set(title, (byAmount.get(title) ?? 0) + order.totalPaid);
  }

  const toItems = (map: Map<string, number>) =>
    [...map.entries()]
      .map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value);

  return {
    byQuantity: toItems(byQuantity),
    byAmount: toItems(byAmount),
  };
}

export function filterUsersInRange(users: AppUser[], from: Date, to: Date) {
  return users.filter((user) => isWithinRange(user.registeredAt, from, to));
}

export function filterOrdersInRange(orders: Order[], from: Date, to: Date) {
  return orders.filter((order) => isWithinRange(order.orderTime, from, to));
}
