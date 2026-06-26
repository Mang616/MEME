import type { Database, Club, Handler, Order, Product } from "../types.js";

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
    serviceType: order.serviceType,
    productTitle: order.product.title,
    productCover: order.product.cover ?? "",
    productCoverColor: order.product.coverColor ?? "#2a3530",
    totalPaid: order.totalPaid,
    region: order.region,
    gameId: order.userId,
    assignedPlayer: order.assignedPlayer,
    servicePlayer: order.servicePlayer,
    remark: order.remark ?? "",
    orderTime: order.orderTime,
  };
}

/** 接单大厅：仅商品快照 + 游戏端口，不含用户/订单敏感字段 */
export function toHallOrderRow(order: Order) {
  return {
    id: order.id,
    serviceType: order.serviceType,
    productTitle: order.product.title,
    productCover: order.product.cover ?? "",
    productCoverColor: order.product.coverColor ?? "#2a3530",
    totalPaid: order.totalPaid,
    quantity: order.product.quantity ?? 1,
    gamePort: order.region,
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
    cover: product.cover,
    coverColor: product.coverColor,
    limitPerUser: product.limitPerUser,
    couponAllowed: product.couponAllowed ?? true,
    published: product.published ?? true,
  };
}

export function toAdminHandlerRow(
  handler: Handler,
  club?: Club | null,
  admin?: { id: string; username: string; displayName: string } | null,
) {
  const kind = club?.kind ?? "partner";
  return {
    id: handler.id,
    name: handler.name,
    level: handler.level,
    region: handler.region,
    serviceType: handler.serviceType,
    gender: handler.gender,
    online: handler.online,
    clubId: handler.clubId,
    clubName: club?.name ?? handler.clubId,
    clubKind: kind,
    isOwnClub: kind === "platform",
    clubEnabled: club?.enabled ?? true,
    realName: handler.realName ?? "",
    idNumber: handler.idNumber ?? "",
    phone: handler.phone ?? "",
    wechat: handler.wechat ?? "",
    alipay: handler.alipay ?? "",
    adminUserId: admin?.id ?? "",
    adminUsername: admin?.username ?? "",
    adminDisplayName: admin?.displayName ?? "",
  };
}
