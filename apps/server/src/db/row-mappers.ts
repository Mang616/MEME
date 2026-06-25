import type { ServiceType } from "@meme/types";
import { avatarPathForGender, normalizeAvatarGender } from "@meme/user-profile";
import type {
  AdminUser,
  Announcement,
  AppUser,
  AvatarGender,
  Banner,
  ChatConversation,
  ChatMessage,
  Club,
  ContentPage,
  Database,
  Feedback,
  UserLedgerEntry,
  UserCoupon,
  Handler,
  Order,
  Product,
  ProductReview,
  ProductTag,
  SubCategory,
} from "../types.js";
import type {
  announcements,
  adminUsers,
  banners,
  categories,
  chatConversations,
  chatMessages,
  contentPages,
  clubs as clubsTable,
  feedbacks,
  userLedger,
  userCoupons,
  handlers,
  orders,
  productReviews,
  productTags,
  products,
  users,
} from "./schema.js";
import { PLATFORM_CLUB_ID } from "../constants/clubs.js";

type CategoryRow = typeof categories.$inferSelect;
type ProductRow = typeof products.$inferSelect;
type HandlerRow = typeof handlers.$inferSelect;
type ClubRow = typeof clubsTable.$inferSelect;
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
    coverRev: row.coverRev ?? 0,
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
    coverRev: product.coverRev ?? 0,
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
    clubId: row.clubId || PLATFORM_CLUB_ID,
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
    clubId: handler.clubId || PLATFORM_CLUB_ID,
  };
}

export function clubFromRow(row: ClubRow): Club {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind as Club["kind"],
    contactName: row.contactName,
    contactPhone: row.contactPhone,
    description: row.description,
    enabled: row.enabled,
    joinedAt: row.joinedAt,
  };
}

export function clubToRow(club: Club): typeof clubsTable.$inferInsert {
  return {
    id: club.id,
    name: club.name,
    kind: club.kind,
    contactName: club.contactName,
    contactPhone: club.contactPhone,
    description: club.description,
    enabled: club.enabled,
    joinedAt: club.joinedAt,
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
    ownerUserId: row.ownerUserId || undefined,
    assignedPlayer: row.assignedPlayer,
    servicePlayer: row.servicePlayer,
    remark: row.remark ?? undefined,
    product: { ...row.productSnapshot },
    subtotal: row.subtotal || row.totalPaid,
    couponDiscount: row.couponDiscount || 0,
    userCouponId: row.userCouponId || undefined,
    couponName: row.couponName || undefined,
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
    ownerUserId: order.ownerUserId ?? "",
    assignedPlayer: order.assignedPlayer,
    servicePlayer: order.servicePlayer,
    remark: order.remark ?? null,
    productSnapshot: { ...order.product },
    subtotal: order.subtotal ?? order.totalPaid,
    couponDiscount: order.couponDiscount ?? 0,
    userCouponId: order.userCouponId ?? "",
    couponName: order.couponName ?? "",
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

export { avatarPathForGender, normalizeAvatarGender };

export function userFromRow(row: UserRow): AppUser {
  const avatarGender = normalizeAvatarGender(row.avatarGender, row.avatar);
  return {
    id: row.id,
    nickname: row.nickname,
    phone: row.phone,
    avatar: row.avatar || avatarPathForGender(avatarGender),
    avatarGender,
    vipLevel: row.vipLevel,
    balance: row.balance,
    totalConsume: row.totalConsume ?? 0,
    status: row.status as AppUser["status"],
    registeredAt: row.registeredAt,
    lastLoginAt: row.lastLoginAt,
    wechatOpenid: row.wechatOpenid || undefined,
    inviteCode: row.inviteCode || "",
    inviterId: row.inviterId || "",
  };
}

export function userToRow(user: AppUser): typeof users.$inferInsert {
  const avatarGender = normalizeAvatarGender(user.avatarGender, user.avatar);
  return {
    id: user.id,
    nickname: user.nickname,
    phone: user.phone,
    avatar: user.avatar || avatarPathForGender(avatarGender),
    avatarGender,
    vipLevel: user.vipLevel,
    balance: user.balance,
    totalConsume: user.totalConsume ?? 0,
    status: user.status,
    registeredAt: user.registeredAt,
    lastLoginAt: user.lastLoginAt,
    wechatOpenid: user.wechatOpenid ?? "",
    inviteCode: user.inviteCode ?? "",
    inviterId: user.inviterId ?? "",
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

type ContentPageRow = typeof contentPages.$inferSelect;
type ProductReviewRow = typeof productReviews.$inferSelect;
type ChatConversationRow = typeof chatConversations.$inferSelect;
type ChatMessageRow = typeof chatMessages.$inferSelect;
type FeedbackRow = typeof feedbacks.$inferSelect;

export function contentPageFromRow(row: ContentPageRow): ContentPage {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    payload: row.payload,
  };
}

export function contentPageToRow(page: ContentPage): typeof contentPages.$inferInsert {
  return {
    id: page.id,
    slug: page.slug,
    title: page.title,
    payload: page.payload,
  };
}

export function productReviewFromRow(row: ProductReviewRow): ProductReview {
  return {
    id: row.id,
    productId: row.productId,
    userName: row.userName,
    rate: row.rate,
    content: row.content,
    reviewTime: row.reviewTime,
    sortOrder: row.sortOrder,
  };
}

export function productReviewToRow(review: ProductReview): typeof productReviews.$inferInsert {
  return {
    id: review.id,
    productId: review.productId,
    userName: review.userName,
    rate: review.rate,
    content: review.content,
    reviewTime: review.reviewTime,
    sortOrder: review.sortOrder ?? 0,
  };
}

export function chatConversationFromRow(row: ChatConversationRow): ChatConversation {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    roleLabel: row.roleLabel,
    escortLevel: row.escortLevel || undefined,
    avatarText: row.avatarText,
    avatarColor: row.avatarColor,
    linkedOrderId: row.linkedOrderId || undefined,
    ownerUserId: row.ownerUserId || undefined,
    handlerId: row.handlerId || undefined,
    customerGameId: row.customerGameId || undefined,
    lastMessage: row.lastMessage,
    lastTime: row.lastTime,
    unread: row.unread,
    staffUnread: row.staffUnread ?? 0,
    online: row.online,
    sortOrder: row.sortOrder,
  };
}

export function chatConversationToRow(
  conv: ChatConversation,
): typeof chatConversations.$inferInsert {
  return {
    id: conv.id,
    type: conv.type,
    name: conv.name,
    roleLabel: conv.roleLabel,
    escortLevel: conv.escortLevel ?? "",
    avatarText: conv.avatarText,
    avatarColor: conv.avatarColor,
    linkedOrderId: conv.linkedOrderId ?? "",
    ownerUserId: conv.ownerUserId ?? "",
    handlerId: conv.handlerId ?? "",
    customerGameId: conv.customerGameId ?? "",
    lastMessage: conv.lastMessage,
    lastTime: conv.lastTime,
    unread: conv.unread,
    staffUnread: conv.staffUnread ?? 0,
    online: conv.online,
    sortOrder: conv.sortOrder ?? 0,
  };
}

export function chatMessageFromRow(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversationId,
    from: row.from as ChatMessage["from"],
    type: row.type,
    content: row.content,
    time: row.time,
    senderType: (row.senderType as ChatMessage["senderType"]) || undefined,
    senderId: row.senderId || undefined,
  };
}

export function chatMessageToRow(message: ChatMessage): typeof chatMessages.$inferInsert {
  return {
    id: message.id,
    conversationId: message.conversationId,
    from: message.from,
    type: message.type,
    content: message.content,
    time: message.time,
    senderType: message.senderType ?? "user",
    senderId: message.senderId ?? "",
  };
}

export function feedbackFromRow(row: FeedbackRow): Feedback {
  return {
    id: row.id,
    userId: row.userId,
    typeId: row.typeId,
    content: row.content,
    contact: row.contact,
    createdAt: row.createdAt,
  };
}

export function feedbackToRow(feedback: Feedback): typeof feedbacks.$inferInsert {
  return {
    id: feedback.id,
    userId: feedback.userId,
    typeId: feedback.typeId,
    content: feedback.content,
    contact: feedback.contact,
    createdAt: feedback.createdAt,
  };
}

type UserLedgerRow = typeof userLedger.$inferSelect;

export function userLedgerFromRow(row: UserLedgerRow): UserLedgerEntry {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type as UserLedgerEntry["type"],
    consumeAmount: row.consumeAmount,
    balanceDelta: row.balanceDelta,
    balanceAfter: row.balanceAfter,
    totalConsumeAfter: row.totalConsumeAfter,
    remark: row.remark,
    refId: row.refId,
    createdAt: row.createdAt,
  };
}

export function userLedgerToRow(entry: UserLedgerEntry): typeof userLedger.$inferInsert {
  return {
    id: entry.id,
    userId: entry.userId,
    type: entry.type,
    consumeAmount: entry.consumeAmount,
    balanceDelta: entry.balanceDelta,
    balanceAfter: entry.balanceAfter,
    totalConsumeAfter: entry.totalConsumeAfter,
    remark: entry.remark,
    refId: entry.refId,
    createdAt: entry.createdAt,
  };
}

type ProductTagRow = typeof productTags.$inferSelect;

export function productTagFromRow(row: ProductTagRow): ProductTag {
  return {
    id: row.id,
    name: row.name,
    style: row.style as ProductTag["style"],
    sortOrder: row.sortOrder,
    enabled: row.enabled,
  };
}

export function productTagToRow(tag: ProductTag): typeof productTags.$inferInsert {
  return {
    id: tag.id,
    name: tag.name,
    style: tag.style,
    sortOrder: tag.sortOrder,
    enabled: tag.enabled,
  };
}

type AdminUserRow = typeof adminUsers.$inferSelect;

export function adminUserFromRow(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.passwordHash,
    displayName: row.displayName,
    roles: row.roles as AdminUser["roles"],
    enabled: row.enabled,
    createdAt: row.createdAt,
  };
}

export function adminUserToRow(user: AdminUser): typeof adminUsers.$inferInsert {
  return {
    id: user.id,
    username: user.username,
    passwordHash: user.passwordHash,
    displayName: user.displayName,
    roles: [...user.roles],
    enabled: user.enabled,
    createdAt: user.createdAt,
  };
}

type UserCouponRow = typeof userCoupons.$inferSelect;

export function userCouponFromRow(row: UserCouponRow): UserCoupon {
  return {
    id: row.id,
    userId: row.userId,
    templateId: row.templateId,
    name: row.name,
    description: row.description,
    type: row.type as UserCoupon["type"],
    value: row.value,
    minSpend: row.minSpend,
    maxDiscount: row.maxDiscount,
    scope: row.scope as UserCoupon["scope"],
    expiresAt: row.expiresAt,
    usedAt: row.usedAt,
    usedOrderId: row.usedOrderId,
    claimedAt: row.claimedAt,
  };
}

export function userCouponToRow(coupon: UserCoupon): typeof userCoupons.$inferInsert {
  return {
    id: coupon.id,
    userId: coupon.userId,
    templateId: coupon.templateId,
    name: coupon.name,
    description: coupon.description,
    type: coupon.type,
    value: coupon.value,
    minSpend: coupon.minSpend,
    maxDiscount: coupon.maxDiscount,
    scope: coupon.scope,
    expiresAt: coupon.expiresAt,
    usedAt: coupon.usedAt,
    usedOrderId: coupon.usedOrderId,
    claimedAt: coupon.claimedAt,
  };
}
