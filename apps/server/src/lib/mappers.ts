import type { Database, Handler, Order, Product } from "../types.js";

export function resolveCategoryName(
  categories: Database["categories"],
  serviceType: Product["serviceType"],
  categoryId: string,
) {
  const list = categories[serviceType] ?? [];
  return list.find((item) => item.id === categoryId)?.name ?? categoryId;
}

export function toAdminOrderRow(order: Order) {
  return {
    id: order.id,
    status: order.status,
    productTitle: order.product.title,
    totalPaid: order.totalPaid,
    region: order.region,
    gameId: order.userId,
    servicePlayer: order.servicePlayer,
    orderTime: order.orderTime,
  };
}

export function toAdminProductRow(product: Product, categories: Database["categories"]) {
  return {
    id: product.id,
    title: product.title,
    serviceType: product.serviceType,
    categoryId: product.categoryId,
    categoryName: resolveCategoryName(categories, product.serviceType, product.categoryId),
    price: product.price,
    sold: product.sold,
    tag: product.tag,
    limitPerUser: product.limitPerUser,
    published: product.published ?? true,
  };
}

export function toAdminHandlerRow(handler: Handler) {
  return {
    id: handler.id,
    name: handler.name,
    level: handler.level,
    region: handler.region,
    serviceType: handler.serviceType,
    gender: handler.gender,
    online: handler.online,
  };
}
