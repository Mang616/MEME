import type { ServiceType } from "@meme/types";
import type {
  Announcement,
  AppUser,
  Banner,
  Database,
  Handler,
  Order,
  Product,
  SubCategory,
} from "../types.js";
import type { announcements, banners, categories, handlers, orders, products, users } from "./schema.js";

type CategoryRow = typeof categories.$inferSelect;
type ProductRow = typeof products.$inferSelect;
type HandlerRow = typeof handlers.$inferSelect;
type OrderRow = typeof orders.$inferSelect;

export function rowsToCategories(rows: CategoryRow[]): Database["categories"] {
  const result: Database["categories"] = { escort: [], companion: [] };
  for (const row of rows) {
    const type = row.serviceType as ServiceType;
    const item: SubCategory = { id: row.id, name: row.name };
    result[type].push(item);
  }
  return result;
}

export function productFromRow(row: ProductRow): Product {
  return {
    id: row.id,
    serviceType: row.serviceType as Product["serviceType"],
    categoryId: row.categoryId,
    title: row.title,
    desc: row.description,
    price: row.price,
    sold: row.sold,
    tag: row.tag,
    cover: row.cover,
    coverColor: row.coverColor,
    heroTitle: row.heroTitle,
    heroSubtitle: row.heroSubtitle,
    detailDesc: row.detailDesc,
    views: row.views,
    reviewCount: row.reviewCount,
    positiveRate: row.positiveRate,
    intro: row.intro,
    limitPerUser: row.limitPerUser,
    published: row.published,
  };
}

export function productToRow(product: Product): typeof products.$inferInsert {
  return {
    id: product.id,
    serviceType: product.serviceType,
    categoryId: product.categoryId,
    title: product.title,
    description: product.desc,
    price: product.price,
    sold: product.sold,
    tag: product.tag,
    cover: product.cover,
    coverColor: product.coverColor,
    heroTitle: product.heroTitle,
    heroSubtitle: product.heroSubtitle,
    detailDesc: product.detailDesc,
    views: product.views,
    reviewCount: product.reviewCount,
    positiveRate: product.positiveRate,
    intro: product.intro,
    limitPerUser: product.limitPerUser,
    published: product.published ?? true,
  };
}

export function handlerFromRow(row: HandlerRow): Handler {
  return {
    id: row.id,
    name: row.name,
    level: row.level as Handler["level"],
    region: row.region as Handler["region"],
    serviceType: row.serviceType as Handler["serviceType"],
    gender: row.gender as Handler["gender"],
    avatar: row.avatar,
    online: row.online,
  };
}

export function handlerToRow(handler: Handler): typeof handlers.$inferInsert {
  return {
    id: handler.id,
    name: handler.name,
    level: handler.level,
    region: handler.region,
    serviceType: handler.serviceType,
    gender: handler.gender,
    avatar: handler.avatar,
    online: handler.online,
  };
}

export function orderFromRow(row: OrderRow): Order {
  return {
    id: row.id,
    productId: row.productId,
    status: row.status as Order["status"],
    statusText: row.statusText,
    orderTime: row.orderTime,
    region: row.region,
    userId: row.userId,
    assignedPlayer: row.assignedPlayer,
    servicePlayer: row.servicePlayer,
    remark: row.remark ?? undefined,
    product: { ...row.productSnapshot },
    totalPaid: row.totalPaid,
    paid: row.paid,
    refunded: row.refunded,
    autoSettleTime: row.autoSettleTime,
    actions: [...row.actions],
  };
}

export function orderToRow(order: Order): typeof orders.$inferInsert {
  return {
    id: order.id,
    productId: order.productId,
    status: order.status,
    statusText: order.statusText,
    orderTime: order.orderTime,
    region: order.region,
    userId: order.userId,
    assignedPlayer: order.assignedPlayer,
    servicePlayer: order.servicePlayer,
    remark: order.remark ?? null,
    productSnapshot: { ...order.product },
    totalPaid: order.totalPaid,
    paid: order.paid,
    refunded: order.refunded,
    autoSettleTime: order.autoSettleTime,
    actions: [...order.actions],
  };
}

type UserRow = typeof users.$inferSelect;
type BannerRow = typeof banners.$inferSelect;
type AnnouncementRow = typeof announcements.$inferSelect;

export function userFromRow(row: UserRow): AppUser {
  return {
    id: row.id,
    nickname: row.nickname,
    phone: row.phone,
    avatar: row.avatar,
    vipLevel: row.vipLevel,
    balance: row.balance,
    status: row.status as AppUser["status"],
    registeredAt: row.registeredAt,
    lastLoginAt: row.lastLoginAt,
  };
}

export function userToRow(user: AppUser): typeof users.$inferInsert {
  return {
    id: user.id,
    nickname: user.nickname,
    phone: user.phone,
    avatar: user.avatar,
    vipLevel: user.vipLevel,
    balance: user.balance,
    status: user.status,
    registeredAt: user.registeredAt,
    lastLoginAt: user.lastLoginAt,
  };
}

export function bannerFromRow(row: BannerRow): Banner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    image: row.image,
    bgColor: row.bgColor,
    linkType: row.linkType as Banner["linkType"],
    linkValue: row.linkValue,
    sortOrder: row.sortOrder,
    published: row.published,
  };
}

export function bannerToRow(banner: Banner): typeof banners.$inferInsert {
  return {
    id: banner.id,
    title: banner.title,
    subtitle: banner.subtitle,
    image: banner.image,
    bgColor: banner.bgColor,
    linkType: banner.linkType,
    linkValue: banner.linkValue,
    sortOrder: banner.sortOrder,
    published: banner.published,
  };
}

export function announcementFromRow(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    placement: row.placement as Announcement["placement"],
    enabled: row.enabled,
    sortOrder: row.sortOrder,
    startAt: row.startAt,
    endAt: row.endAt,
  };
}

export function announcementToRow(
  announcement: Announcement,
): typeof announcements.$inferInsert {
  return {
    id: announcement.id,
    title: announcement.title,
    content: announcement.content,
    placement: announcement.placement,
    enabled: announcement.enabled,
    sortOrder: announcement.sortOrder,
    startAt: announcement.startAt,
    endAt: announcement.endAt,
  };
}
