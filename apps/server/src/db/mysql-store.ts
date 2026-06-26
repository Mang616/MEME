import { and, count, eq } from "drizzle-orm";
import type { ServiceType } from "@meme/types";
import { sortByOrder } from "../lib/sort.js";
import { getMysqlDb } from "./client.js";
import {
  announcementFromRow,
  announcementToRow,
  adminUserFromRow,
  adminUserToRow,
  bannerFromRow,
  bannerToRow,
  chatConversationFromRow,
  chatConversationToRow,
  chatMessageFromRow,
  chatMessageToRow,
  clubFromRow,
  clubToRow,
  contentPageFromRow,
  contentPageToRow,
  feedbackFromRow,
  feedbackToRow,
  userLedgerFromRow,
  userLedgerToRow,
  userCouponFromRow,
  userCouponToRow,
  handlerFromRow,
  handlerToRow,
  orderFromRow,
  orderToRow,
  productFromRow,
  productReviewFromRow,
  productReviewToRow,
  productTagFromRow,
  productTagToRow,
  productToRow,
  rowsToCategories,
  userFromRow,
  userToRow,
} from "./row-mappers.js";
import {
  announcements,
  adminUsers,
  banners,
  categories,
  chatConversations,
  chatMessages,
  clubs,
  contentPages,
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
import type {
  Announcement,
  AppUser,
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
  AdminUser,
} from "../types.js";

export function storageLabel() {
  return "mysql";
}

export async function getCategories(): Promise<Database["categories"]> {
  const db = getMysqlDb();
  const rows = await db.select().from(categories);
  return rowsToCategories(rows);
}

export async function insertCategory(serviceType: ServiceType, item: { id: string; name: string }) {
  const db = getMysqlDb();
  await db.insert(categories).values({
    serviceType,
    id: item.id,
    name: item.name,
  });
  return { serviceType, ...item };
}

export async function updateCategoryRow(
  serviceType: ServiceType,
  id: string,
  patch: { name: string },
) {
  const db = getMysqlDb();
  const existing = await db
    .select()
    .from(categories)
    .where(and(eq(categories.serviceType, serviceType), eq(categories.id, id)))
    .limit(1);
  if (!existing[0]) return null;
  await db
    .update(categories)
    .set({ name: patch.name })
    .where(and(eq(categories.serviceType, serviceType), eq(categories.id, id)));
  return { serviceType, id, name: patch.name };
}

export async function countProductsByCategory(serviceType: ServiceType, categoryId: string) {
  const db = getMysqlDb();
  const [row] = await db
    .select({ value: count() })
    .from(products)
    .where(and(eq(products.serviceType, serviceType), eq(products.categoryId, categoryId)));
  return row?.value ?? 0;
}

export async function deleteCategory(serviceType: ServiceType, id: string) {
  const db = getMysqlDb();
  const result = await db
    .delete(categories)
    .where(and(eq(categories.serviceType, serviceType), eq(categories.id, id)));
  return (result[0]?.affectedRows ?? 0) > 0;
}

export async function listProductTags(): Promise<ProductTag[]> {
  const db = getMysqlDb();
  const rows = await db.select().from(productTags);
  return rows.map(productTagFromRow).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProductTag(id: string): Promise<ProductTag | null> {
  const db = getMysqlDb();
  const rows = await db.select().from(productTags).where(eq(productTags.id, id)).limit(1);
  return rows[0] ? productTagFromRow(rows[0]) : null;
}

export async function insertProductTag(input: ProductTag) {
  const db = getMysqlDb();
  await db.insert(productTags).values(productTagToRow(input));
  return input;
}

export async function updateProductTagRow(id: string, patch: Partial<ProductTag>) {
  const existing = await getProductTag(id);
  if (!existing) return null;
  const next = { ...existing, ...patch, id };
  const db = getMysqlDb();
  if (patch.name && patch.name !== existing.name) {
    await db.update(products).set({ tag: patch.name }).where(eq(products.tag, existing.name));
  }
  await db.update(productTags).set(productTagToRow(next)).where(eq(productTags.id, id));
  return next;
}

export async function countProductsByTag(tagName: string) {
  const db = getMysqlDb();
  const [row] = await db.select({ value: count() }).from(products).where(eq(products.tag, tagName));
  return row?.value ?? 0;
}

export async function deleteProductTag(id: string) {
  const db = getMysqlDb();
  const result = await db.delete(productTags).where(eq(productTags.id, id));
  return (result[0]?.affectedRows ?? 0) > 0;
}

export async function isProductTagsEmpty() {
  const db = getMysqlDb();
  const [row] = await db.select({ value: count() }).from(productTags);
  return (row?.value ?? 0) === 0;
}

export async function seedProductTagsMissing(tags: ProductTag[]) {
  if (!(await isProductTagsEmpty())) return;
  const db = getMysqlDb();
  for (const tag of tags) {
    await db.insert(productTags).values(productTagToRow(tag));
  }
}

export async function listProducts(): Promise<Product[]> {
  const db = getMysqlDb();
  const rows = await db.select().from(products);
  return rows.map(productFromRow);
}

export async function getProduct(id: string): Promise<Product | null> {
  const db = getMysqlDb();
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return rows[0] ? productFromRow(rows[0]) : null;
}

export async function insertProduct(input: Product) {
  const db = getMysqlDb();
  await db.insert(products).values(productToRow(input));
  return input;
}

export async function updateProductRow(id: string, patch: Partial<Product>) {
  const existing = await getProduct(id);
  if (!existing) return null;
  const next = { ...existing, ...patch, id };
  const db = getMysqlDb();
  await db.update(products).set(productToRow(next)).where(eq(products.id, id));
  return next;
}

export async function deleteProduct(id: string) {
  const db = getMysqlDb();
  const result = await db.delete(products).where(eq(products.id, id));
  return (result[0]?.affectedRows ?? 0) > 0;
}

export async function listOrders(ownerUserId?: string): Promise<Order[]> {
  const db = getMysqlDb();
  const rows = await db.select().from(orders);
  const mapped = rows.map(orderFromRow);
  if (!ownerUserId) return mapped;
  return mapped.filter((order) => order.ownerUserId === ownerUserId);
}

export async function getOrder(id: string): Promise<Order | null> {
  const db = getMysqlDb();
  const rows = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return rows[0] ? orderFromRow(rows[0]) : null;
}

export async function insertOrder(order: Order) {
  const db = getMysqlDb();
  await db.insert(orders).values(orderToRow(order));
  return order;
}

export async function updateOrderRow(
  id: string,
  patch: Partial<Pick<Order, "status" | "servicePlayer" | "statusText" | "ownerUserId" | "serviceType">>,
) {
  const existing = await getOrder(id);
  if (!existing) return null;
  const next = { ...existing, ...patch, id };
  const db = getMysqlDb();
  await db.update(orders).set(orderToRow(next)).where(eq(orders.id, id));
  return next;
}

export async function listClubs(): Promise<Club[]> {
  const db = getMysqlDb();
  const rows = await db.select().from(clubs);
  return rows.map(clubFromRow).sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
}

export async function getClub(id: string): Promise<Club | null> {
  const db = getMysqlDb();
  const rows = await db.select().from(clubs).where(eq(clubs.id, id)).limit(1);
  return rows[0] ? clubFromRow(rows[0]) : null;
}

export async function insertClub(input: Club) {
  const db = getMysqlDb();
  await db.insert(clubs).values(clubToRow(input));
  return input;
}

export async function updateClubRow(id: string, patch: Partial<Club>) {
  const existing = await getClub(id);
  if (!existing) return null;
  const next = { ...existing, ...patch, id };
  const db = getMysqlDb();
  await db.update(clubs).set(clubToRow(next)).where(eq(clubs.id, id));
  return next;
}

export async function deleteClub(id: string) {
  const db = getMysqlDb();
  const result = await db.delete(clubs).where(eq(clubs.id, id));
  return (result[0]?.affectedRows ?? 0) > 0;
}

export async function listHandlers(): Promise<Handler[]> {
  const db = getMysqlDb();
  const rows = await db.select().from(handlers);
  return rows.map(handlerFromRow);
}

export async function getHandler(id: string): Promise<Handler | null> {
  const db = getMysqlDb();
  const rows = await db.select().from(handlers).where(eq(handlers.id, id)).limit(1);
  return rows[0] ? handlerFromRow(rows[0]) : null;
}

export async function insertHandler(input: Handler) {
  const db = getMysqlDb();
  await db.insert(handlers).values(handlerToRow(input));
  return input;
}

export async function updateHandlerRow(id: string, patch: Partial<Handler>) {
  const existing = await getHandler(id);
  if (!existing) return null;
  const next = { ...existing, ...patch, id };
  const db = getMysqlDb();
  await db.update(handlers).set(handlerToRow(next)).where(eq(handlers.id, id));
  return next;
}

export async function deleteHandler(id: string) {
  const db = getMysqlDb();
  const result = await db.delete(handlers).where(eq(handlers.id, id));
  return (result[0]?.affectedRows ?? 0) > 0;
}

export async function isEmpty() {
  const db = getMysqlDb();
  const [row] = await db.select({ value: count() }).from(products);
  return (row?.value ?? 0) === 0;
}

export async function seedFromDatabase(data: Database) {
  const db = getMysqlDb();

  await db.delete(chatMessages);
  await db.delete(chatConversations);
  await db.delete(productReviews);
  await db.delete(contentPages);
  await db.delete(feedbacks);
  await db.delete(adminUsers);
  await db.delete(orders);
  await db.delete(handlers);
  await db.delete(clubs);
  await db.delete(products);
  await db.delete(productTags);
  await db.delete(categories);
  await db.delete(announcements);
  await db.delete(banners);
  await db.delete(users);

  for (const serviceType of Object.keys(data.categories) as ServiceType[]) {
    for (const item of data.categories[serviceType]) {
      await db.insert(categories).values({
        serviceType,
        id: item.id,
        name: item.name,
      });
    }
  }

  for (const tag of data.productTags ?? []) {
    await db.insert(productTags).values(productTagToRow(tag));
  }

  for (const product of data.products) {
    await db.insert(products).values(productToRow({ ...product, published: product.published ?? true }));
  }

  for (const club of data.clubs ?? []) {
    await db.insert(clubs).values(clubToRow(club));
  }

  for (const handler of data.handlers) {
    await db.insert(handlers).values(handlerToRow(handler));
  }

  for (const order of data.orders) {
    await db.insert(orders).values(orderToRow(order));
  }

  for (const user of data.users) {
    await db.insert(users).values(userToRow(user));
  }

  for (const banner of data.banners) {
    await db.insert(banners).values(bannerToRow(banner));
  }

  for (const announcement of data.announcements) {
    await db.insert(announcements).values(announcementToRow(announcement));
  }

  for (const page of data.contentPages) {
    await db.insert(contentPages).values(contentPageToRow(page));
  }

  for (const review of data.productReviews) {
    await db.insert(productReviews).values(productReviewToRow(review));
  }

  for (const conv of data.chatConversations) {
    await db.insert(chatConversations).values(chatConversationToRow(conv));
  }

  for (const message of data.chatMessages) {
    await db.insert(chatMessages).values(chatMessageToRow(message));
  }

  for (const adminUser of data.adminUsers ?? []) {
    await db.insert(adminUsers).values(adminUserToRow(adminUser));
  }
}

async function countTable(table: typeof users | typeof banners | typeof announcements) {
  const db = getMysqlDb();
  const [row] = await db.select({ value: count() }).from(table);
  return row?.value ?? 0;
}

/** 任一 CMS 表为空则需补种（与 JSON 存储语义对齐） */
export async function isCmsIncomplete() {
  const [userCount, bannerCount, announcementCount] = await Promise.all([
    countTable(users),
    countTable(banners),
    countTable(announcements),
  ]);
  return userCount === 0 || bannerCount === 0 || announcementCount === 0;
}

export async function seedCmsMissing(data: Pick<Database, "users" | "banners" | "announcements">) {
  const db = getMysqlDb();
  if ((await countTable(users)) === 0) {
    for (const user of data.users) {
      await db.insert(users).values(userToRow(user));
    }
  }
  if ((await countTable(banners)) === 0) {
    for (const banner of data.banners) {
      await db.insert(banners).values(bannerToRow(banner));
    }
  }
  if ((await countTable(announcements)) === 0) {
    for (const announcement of data.announcements) {
      await db.insert(announcements).values(announcementToRow(announcement));
    }
  }
}

export async function listUsers(): Promise<AppUser[]> {
  const db = getMysqlDb();
  const rows = await db.select().from(users);
  return rows.map(userFromRow).sort((a, b) => a.registeredAt.localeCompare(b.registeredAt));
}

export async function getUser(id: string): Promise<AppUser | null> {
  const db = getMysqlDb();
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ? userFromRow(rows[0]) : null;
}

export async function updateUserRow(id: string, patch: Partial<AppUser>) {
  const existing = await getUser(id);
  if (!existing) return null;
  const next = { ...existing, ...patch, id };
  const db = getMysqlDb();
  await db.update(users).set(userToRow(next)).where(eq(users.id, id));
  return next;
}

export async function listBanners(): Promise<Banner[]> {
  const db = getMysqlDb();
  const rows = await db.select().from(banners);
  return sortByOrder(rows.map(bannerFromRow));
}

export async function getBanner(id: string): Promise<Banner | null> {
  const db = getMysqlDb();
  const rows = await db.select().from(banners).where(eq(banners.id, id)).limit(1);
  return rows[0] ? bannerFromRow(rows[0]) : null;
}

export async function insertBanner(input: Banner) {
  const db = getMysqlDb();
  await db.insert(banners).values(bannerToRow(input));
  return input;
}

export async function updateBannerRow(id: string, patch: Partial<Banner>) {
  const existing = await getBanner(id);
  if (!existing) return null;
  const next = { ...existing, ...patch, id };
  const db = getMysqlDb();
  await db.update(banners).set(bannerToRow(next)).where(eq(banners.id, id));
  return next;
}

export async function deleteBanner(id: string) {
  const db = getMysqlDb();
  const result = await db.delete(banners).where(eq(banners.id, id));
  return (result[0]?.affectedRows ?? 0) > 0;
}

export async function listAnnouncements(): Promise<Announcement[]> {
  const db = getMysqlDb();
  const rows = await db.select().from(announcements);
  return sortByOrder(rows.map(announcementFromRow));
}

export async function getAnnouncement(id: string): Promise<Announcement | null> {
  const db = getMysqlDb();
  const rows = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
  return rows[0] ? announcementFromRow(rows[0]) : null;
}

export async function insertAnnouncement(input: Announcement) {
  const db = getMysqlDb();
  await db.insert(announcements).values(announcementToRow(input));
  return input;
}

export async function updateAnnouncementRow(id: string, patch: Partial<Announcement>) {
  const existing = await getAnnouncement(id);
  if (!existing) return null;
  const next = { ...existing, ...patch, id };
  const db = getMysqlDb();
  await db.update(announcements).set(announcementToRow(next)).where(eq(announcements.id, id));
  return next;
}

export async function deleteAnnouncement(id: string) {
  const db = getMysqlDb();
  const result = await db.delete(announcements).where(eq(announcements.id, id));
  return (result[0]?.affectedRows ?? 0) > 0;
}

export async function findUserByPhone(phone: string): Promise<AppUser | null> {
  const db = getMysqlDb();
  const rows = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  return rows[0] ? userFromRow(rows[0]) : null;
}

export async function findUserByWechatOpenid(openid: string): Promise<AppUser | null> {
  const db = getMysqlDb();
  const rows = await db.select().from(users).where(eq(users.wechatOpenid, openid)).limit(1);
  return rows[0] ? userFromRow(rows[0]) : null;
}

export async function findUserByInviteCode(code: string): Promise<AppUser | null> {
  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return null;
  const db = getMysqlDb();
  const rows = await db.select().from(users).where(eq(users.inviteCode, normalized)).limit(1);
  return rows[0] ? userFromRow(rows[0]) : null;
}

export async function insertUser(user: AppUser) {
  const db = getMysqlDb();
  await db.insert(users).values(userToRow(user));
  return user;
}

export async function listContentPages(): Promise<ContentPage[]> {
  const db = getMysqlDb();
  const rows = await db.select().from(contentPages);
  return rows.map(contentPageFromRow);
}

export async function getContentPageBySlug(slug: string): Promise<ContentPage | null> {
  const db = getMysqlDb();
  const rows = await db.select().from(contentPages).where(eq(contentPages.slug, slug)).limit(1);
  return rows[0] ? contentPageFromRow(rows[0]) : null;
}

export async function upsertContentPage(page: ContentPage): Promise<ContentPage> {
  const db = getMysqlDb();
  const existing = await getContentPageBySlug(page.slug);
  if (existing) {
    await db
      .update(contentPages)
      .set(contentPageToRow(page))
      .where(eq(contentPages.slug, page.slug));
  } else {
    await db.insert(contentPages).values(contentPageToRow(page));
  }
  return page;
}

export async function listProductReviews(productId: string): Promise<ProductReview[]> {
  const db = getMysqlDb();
  const rows = await db
    .select()
    .from(productReviews)
    .where(eq(productReviews.productId, productId));
  return rows
    .map(productReviewFromRow)
    .sort((a, b) => (b.reviewTime > a.reviewTime ? 1 : b.reviewTime < a.reviewTime ? -1 : 0));
}

export async function listChatConversations(): Promise<ChatConversation[]> {
  const db = getMysqlDb();
  const rows = await db.select().from(chatConversations);
  return rows
    .map(chatConversationFromRow)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export async function getChatConversation(id: string): Promise<ChatConversation | null> {
  const db = getMysqlDb();
  const rows = await db.select().from(chatConversations).where(eq(chatConversations.id, id)).limit(1);
  return rows[0] ? chatConversationFromRow(rows[0]) : null;
}

export async function listChatMessages(conversationId: string): Promise<ChatMessage[]> {
  const db = getMysqlDb();
  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.conversationId, conversationId));
  return rows.map(chatMessageFromRow);
}

export async function insertFeedback(feedback: Feedback) {
  const db = getMysqlDb();
  await db.insert(feedbacks).values(feedbackToRow(feedback));
  return feedback;
}

export async function listFeedbacks(): Promise<Feedback[]> {
  const db = getMysqlDb();
  const rows = await db.select().from(feedbacks);
  return rows
    .map(feedbackFromRow)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0));
}

export async function insertUserLedger(entry: UserLedgerEntry) {
  const db = getMysqlDb();
  await db.insert(userLedger).values(userLedgerToRow(entry));
  return entry;
}

export async function listUserLedgerByUser(userId: string): Promise<UserLedgerEntry[]> {
  const db = getMysqlDb();
  const rows = await db.select().from(userLedger).where(eq(userLedger.userId, userId));
  return rows
    .map(userLedgerFromRow)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0));
}

export async function insertUserCoupon(coupon: UserCoupon) {
  const db = getMysqlDb();
  await db.insert(userCoupons).values(userCouponToRow(coupon));
  return coupon;
}

export async function getUserCoupon(id: string): Promise<UserCoupon | null> {
  const db = getMysqlDb();
  const rows = await db.select().from(userCoupons).where(eq(userCoupons.id, id)).limit(1);
  return rows[0] ? userCouponFromRow(rows[0]) : null;
}

export async function updateUserCouponRow(id: string, patch: Partial<UserCoupon>) {
  const existing = await getUserCoupon(id);
  if (!existing) return null;
  const next = { ...existing, ...patch, id };
  const db = getMysqlDb();
  await db.update(userCoupons).set(userCouponToRow(next)).where(eq(userCoupons.id, id));
  return next;
}

export async function listUserCouponsByUser(userId: string): Promise<UserCoupon[]> {
  const db = getMysqlDb();
  const rows = await db.select().from(userCoupons).where(eq(userCoupons.userId, userId));
  return rows
    .map(userCouponFromRow)
    .sort((a, b) => (b.claimedAt > a.claimedAt ? 1 : b.claimedAt < a.claimedAt ? -1 : 0));
}

export async function isUserCouponsEmpty() {
  const db = getMysqlDb();
  const rows = await db.select({ total: count() }).from(userCoupons);
  return Number(rows[0]?.total ?? 0) === 0;
}

export async function seedUserCouponsMissing(items: UserCoupon[]) {
  const db = getMysqlDb();
  if (!items.length) return;
  await db.insert(userCoupons).values(items.map((item) => userCouponToRow(item)));
}

export async function insertChatConversation(conv: ChatConversation) {
  const db = getMysqlDb();
  await db.insert(chatConversations).values(chatConversationToRow(conv));
  return conv;
}

export async function updateChatConversationRow(id: string, patch: Partial<ChatConversation>) {
  const existing = await getChatConversation(id);
  if (!existing) return null;
  const next = { ...existing, ...patch, id };
  const db = getMysqlDb();
  await db.update(chatConversations).set(chatConversationToRow(next)).where(eq(chatConversations.id, id));
  return next;
}

export async function insertChatMessage(message: ChatMessage) {
  const db = getMysqlDb();
  await db.insert(chatMessages).values(chatMessageToRow(message));
  return message;
}

export async function replaceChatData(conversations: ChatConversation[], messages: ChatMessage[]) {
  const db = getMysqlDb();
  await db.delete(chatMessages);
  await db.delete(chatConversations);
  for (const conv of conversations) {
    await db.insert(chatConversations).values(chatConversationToRow(conv));
  }
  for (const message of messages) {
    await db.insert(chatMessages).values(chatMessageToRow(message));
  }
}

export async function getChatConversationByOrderId(orderId: string) {
  const db = getMysqlDb();
  const rows = await db
    .select()
    .from(chatConversations)
    .where(eq(chatConversations.linkedOrderId, orderId))
    .limit(1);
  return rows[0] ? chatConversationFromRow(rows[0]) : null;
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const db = getMysqlDb();
  const rows = await db.select().from(adminUsers);
  return rows.map(adminUserFromRow);
}

export async function getAdminUser(id: string) {
  const db = getMysqlDb();
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  return rows[0] ? adminUserFromRow(rows[0]) : null;
}

export async function getAdminUserByUsername(username: string) {
  const db = getMysqlDb();
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
  return rows[0] ? adminUserFromRow(rows[0]) : null;
}

export async function insertAdminUser(user: AdminUser) {
  const db = getMysqlDb();
  await db.insert(adminUsers).values(adminUserToRow(user));
  return user;
}

export async function updateAdminUserRow(id: string, patch: Partial<AdminUser>) {
  const existing = await getAdminUser(id);
  if (!existing) return null;
  const next = { ...existing, ...patch, id };
  const db = getMysqlDb();
  await db.update(adminUsers).set(adminUserToRow(next)).where(eq(adminUsers.id, id));
  return next;
}

export async function deleteAdminUser(id: string) {
  const db = getMysqlDb();
  const result = await db.delete(adminUsers).where(eq(adminUsers.id, id));
  return (result[0]?.affectedRows ?? 0) > 0;
}

export async function isAdminUsersEmpty() {
  const db = getMysqlDb();
  const [row] = await db.select({ value: count() }).from(adminUsers);
  return (row?.value ?? 0) === 0;
}

export async function seedAdminUsersMissing(users: AdminUser[]) {
  if (!(await isAdminUsersEmpty())) return;
  const db = getMysqlDb();
  for (const user of users) {
    await db.insert(adminUsers).values(adminUserToRow(user));
  }
}

async function countContentPages() {
  const db = getMysqlDb();
  const [row] = await db.select({ value: count() }).from(contentPages);
  return row?.value ?? 0;
}

/** 扩展内容表为空时需补种（评价、聊天、CMS 文案等） */
export async function isExtendedContentIncomplete() {
  const [contentCount, reviewCount] = await Promise.all([
    countContentPages(),
    (async () => {
      const db = getMysqlDb();
      const [row] = await db.select({ value: count() }).from(productReviews);
      return row?.value ?? 0;
    })(),
  ]);
  return contentCount === 0 || reviewCount === 0;
}

export async function seedExtendedContentMissing(
  data: Pick<Database, "contentPages" | "productReviews" | "chatConversations" | "chatMessages">,
) {
  const db = getMysqlDb();
  if ((await countContentPages()) === 0) {
    for (const page of data.contentPages) {
      await db.insert(contentPages).values(contentPageToRow(page));
    }
  }

  const [reviewRow] = await db.select({ value: count() }).from(productReviews);
  if ((reviewRow?.value ?? 0) === 0) {
    for (const review of data.productReviews) {
      await db.insert(productReviews).values(productReviewToRow(review));
    }
  }

  const [convRow] = await db.select({ value: count() }).from(chatConversations);
  if ((convRow?.value ?? 0) === 0) {
    for (const conv of data.chatConversations) {
      await db.insert(chatConversations).values(chatConversationToRow(conv));
    }
    for (const message of data.chatMessages) {
      await db.insert(chatMessages).values(chatMessageToRow(message));
    }
  }
}
