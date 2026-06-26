import { sortByOrder } from "../lib/sort.js";
import * as categoryCrud from "./category-crud.js";
import * as tagCrud from "./tag-crud.js";
import * as chatCrud from "./chat-crud.js";
import * as adminUserCrud from "./admin-user-crud.js";
import * as json from "./json-crud.js";
import * as jsonStore from "./json-store.js";
import * as mysqlStore from "./mysql-store.js";
import { pickStore, storageLabel } from "./store-bridge.js";

export { seedDatabaseIfEmpty, ensureCmsSeeded, ensureExtendedSeeded, ensureMissingContentPages, ensureProductTagsSeeded, ensureAdminUsersSeeded, ensureHandlerLegacyProfiles, ensureChatConversationsMigrated, ensureOrderServiceTypes, ensureRbacHandlerDefaults, ensureUsersVipSynced, ensureUserCouponsSeeded, ensureUserInviteCodesSeeded } from "./seed.js";
export { storageLabel };

export const getCategories = pickStore(
  async () => mysqlStore.getCategories(),
  async () => (await jsonStore.readDb()).categories,
);

export const insertCategory = pickStore(
  (serviceType: Parameters<typeof mysqlStore.insertCategory>[0], item: Parameters<typeof mysqlStore.insertCategory>[1]) =>
    mysqlStore.insertCategory(serviceType, item),
  (serviceType: Parameters<typeof categoryCrud.jsonInsertCategory>[0], item: Parameters<typeof categoryCrud.jsonInsertCategory>[1]) =>
    categoryCrud.jsonInsertCategory(serviceType, item),
);

export const updateCategory = pickStore(
  (
    serviceType: Parameters<typeof mysqlStore.updateCategoryRow>[0],
    id: string,
    patch: Parameters<typeof mysqlStore.updateCategoryRow>[2],
  ) => mysqlStore.updateCategoryRow(serviceType, id, patch),
  (
    serviceType: Parameters<typeof categoryCrud.jsonUpdateCategory>[0],
    id: string,
    patch: Parameters<typeof categoryCrud.jsonUpdateCategory>[2],
  ) => categoryCrud.jsonUpdateCategory(serviceType, id, patch),
);

export const removeCategory = pickStore(
  (serviceType: Parameters<typeof mysqlStore.deleteCategory>[0], id: string) =>
    mysqlStore.deleteCategory(serviceType, id),
  (serviceType: Parameters<typeof categoryCrud.jsonDeleteCategory>[0], id: string) =>
    categoryCrud.jsonDeleteCategory(serviceType, id),
);

export const countProductsByCategory = pickStore(
  (serviceType: Parameters<typeof mysqlStore.countProductsByCategory>[0], categoryId: string) =>
    mysqlStore.countProductsByCategory(serviceType, categoryId),
  (serviceType: Parameters<typeof categoryCrud.jsonCountProductsByCategory>[0], categoryId: string) =>
    categoryCrud.jsonCountProductsByCategory(serviceType, categoryId),
);

export const listProductTags = pickStore(
  () => mysqlStore.listProductTags(),
  () => tagCrud.jsonListProductTags(),
);

export const getProductTag = pickStore(
  (id: string) => mysqlStore.getProductTag(id),
  (id: string) => tagCrud.jsonGetProductTag(id),
);

export const insertProductTag = pickStore(
  (input: Parameters<typeof mysqlStore.insertProductTag>[0]) => mysqlStore.insertProductTag(input),
  (input: Parameters<typeof tagCrud.jsonInsertProductTag>[0]) => tagCrud.jsonInsertProductTag(input),
);

export const updateProductTag = pickStore(
  (id: string, patch: Parameters<typeof mysqlStore.updateProductTagRow>[1]) =>
    mysqlStore.updateProductTagRow(id, patch),
  (id: string, patch: Parameters<typeof tagCrud.jsonUpdateProductTag>[1]) =>
    tagCrud.jsonUpdateProductTag(id, patch),
);

export const removeProductTag = pickStore(
  (id: string) => mysqlStore.deleteProductTag(id),
  (id: string) => tagCrud.jsonDeleteProductTag(id),
);

export const countProductsByTag = pickStore(
  (tagName: string) => mysqlStore.countProductsByTag(tagName),
  (tagName: string) => tagCrud.jsonCountProductsByTag(tagName),
);

export const listProducts = pickStore(
  () => mysqlStore.listProducts(),
  () => json.jsonList("products"),
);

export const getProduct = pickStore(
  (id: string) => mysqlStore.getProduct(id),
  (id: string) => json.jsonFind("products", id),
);

export const createProduct = pickStore(
  (input: Parameters<typeof mysqlStore.insertProduct>[0]) => mysqlStore.insertProduct(input),
  (input: Parameters<typeof mysqlStore.insertProduct>[0]) =>
    json.jsonInsert("products", input, { prepend: true, existsError: "PRODUCT_EXISTS" }),
);

export const updateProduct = pickStore(
  (id: string, patch: Parameters<typeof mysqlStore.updateProductRow>[1]) =>
    mysqlStore.updateProductRow(id, patch),
  (id: string, patch: Parameters<typeof mysqlStore.updateProductRow>[1]) =>
    json.jsonPatch("products", id, patch),
);

export const removeProduct = pickStore(
  (id: string) => mysqlStore.deleteProduct(id),
  (id: string) => json.jsonRemove("products", id),
);

export const listOrders = pickStore(
  (ownerUserId?: string) => mysqlStore.listOrders(ownerUserId),
  async (ownerUserId?: string) => {
    const orders = await json.jsonList("orders");
    if (!ownerUserId) return orders;
    return orders.filter((order) => order.ownerUserId === ownerUserId);
  },
);

export const getOrder = pickStore(
  (id: string) => mysqlStore.getOrder(id),
  (id: string) => json.jsonFind("orders", id),
);

export const createOrder = pickStore(
  (order: Parameters<typeof mysqlStore.insertOrder>[0]) => mysqlStore.insertOrder(order),
  (order: Parameters<typeof mysqlStore.insertOrder>[0]) =>
    json.jsonInsert("orders", order, { prepend: true }),
);

export const updateOrder = pickStore(
  (id: string, patch: Parameters<typeof mysqlStore.updateOrderRow>[1]) =>
    mysqlStore.updateOrderRow(id, patch),
  (id: string, patch: Parameters<typeof mysqlStore.updateOrderRow>[1]) =>
    json.jsonPatch("orders", id, patch),
);

export const listHandlers = pickStore(
  () => mysqlStore.listHandlers(),
  () => json.jsonList("handlers"),
);

export const getHandler = pickStore(
  (id: string) => mysqlStore.getHandler(id),
  (id: string) => json.jsonFind("handlers", id),
);

export const createHandler = pickStore(
  (input: Parameters<typeof mysqlStore.insertHandler>[0]) => mysqlStore.insertHandler(input),
  (input: Parameters<typeof mysqlStore.insertHandler>[0]) =>
    json.jsonInsert("handlers", input, { prepend: true, existsError: "HANDLER_EXISTS" }),
);

export const updateHandler = pickStore(
  (id: string, patch: Parameters<typeof mysqlStore.updateHandlerRow>[1]) =>
    mysqlStore.updateHandlerRow(id, patch),
  (id: string, patch: Parameters<typeof mysqlStore.updateHandlerRow>[1]) =>
    json.jsonPatch("handlers", id, patch),
);

export const removeHandler = pickStore(
  (id: string) => mysqlStore.deleteHandler(id),
  (id: string) => json.jsonRemove("handlers", id),
);

export const listClubs = pickStore(
  () => mysqlStore.listClubs(),
  () => json.jsonList("clubs"),
);

export const getClub = pickStore(
  (id: string) => mysqlStore.getClub(id),
  (id: string) => json.jsonFind("clubs", id),
);

export const createClub = pickStore(
  (input: Parameters<typeof mysqlStore.insertClub>[0]) => mysqlStore.insertClub(input),
  (input: Parameters<typeof mysqlStore.insertClub>[0]) =>
    json.jsonInsert("clubs", input, { prepend: true, existsError: "CLUB_EXISTS" }),
);

export const updateClub = pickStore(
  (id: string, patch: Parameters<typeof mysqlStore.updateClubRow>[1]) =>
    mysqlStore.updateClubRow(id, patch),
  (id: string, patch: Parameters<typeof mysqlStore.updateClubRow>[1]) =>
    json.jsonPatch("clubs", id, patch),
);

export const removeClub = pickStore(
  (id: string) => mysqlStore.deleteClub(id),
  (id: string) => json.jsonRemove("clubs", id),
);

export const listUsers = pickStore(
  () => mysqlStore.listUsers(),
  async () => {
    const users = await json.jsonList("users");
    return [...users].sort((a, b) => a.registeredAt.localeCompare(b.registeredAt));
  },
);

export const getUser = pickStore(
  (id: string) => mysqlStore.getUser(id),
  (id: string) => json.jsonFind("users", id),
);

export const updateUser = pickStore(
  (id: string, patch: Parameters<typeof mysqlStore.updateUserRow>[1]) =>
    mysqlStore.updateUserRow(id, patch),
  (id: string, patch: Parameters<typeof mysqlStore.updateUserRow>[1]) =>
    json.jsonPatch("users", id, patch),
);

export const listBanners = pickStore(
  () => mysqlStore.listBanners(),
  async () => sortByOrder(await json.jsonList("banners")),
);

export const getBanner = pickStore(
  (id: string) => mysqlStore.getBanner(id),
  (id: string) => json.jsonFind("banners", id),
);

export const createBanner = pickStore(
  (input: Parameters<typeof mysqlStore.insertBanner>[0]) => mysqlStore.insertBanner(input),
  (input: Parameters<typeof mysqlStore.insertBanner>[0]) =>
    json.jsonInsert("banners", input, { existsError: "BANNER_EXISTS" }),
);

export const updateBanner = pickStore(
  (id: string, patch: Parameters<typeof mysqlStore.updateBannerRow>[1]) =>
    mysqlStore.updateBannerRow(id, patch),
  (id: string, patch: Parameters<typeof mysqlStore.updateBannerRow>[1]) =>
    json.jsonPatch("banners", id, patch),
);

export const removeBanner = pickStore(
  (id: string) => mysqlStore.deleteBanner(id),
  (id: string) => json.jsonRemove("banners", id),
);

export const listAnnouncements = pickStore(
  () => mysqlStore.listAnnouncements(),
  async () => sortByOrder(await json.jsonList("announcements")),
);

export const getAnnouncement = pickStore(
  (id: string) => mysqlStore.getAnnouncement(id),
  (id: string) => json.jsonFind("announcements", id),
);

export const createAnnouncement = pickStore(
  (input: Parameters<typeof mysqlStore.insertAnnouncement>[0]) =>
    mysqlStore.insertAnnouncement(input),
  (input: Parameters<typeof mysqlStore.insertAnnouncement>[0]) =>
    json.jsonInsert("announcements", input, { existsError: "ANNOUNCEMENT_EXISTS" }),
);

export const updateAnnouncement = pickStore(
  (id: string, patch: Parameters<typeof mysqlStore.updateAnnouncementRow>[1]) =>
    mysqlStore.updateAnnouncementRow(id, patch),
  (id: string, patch: Parameters<typeof mysqlStore.updateAnnouncementRow>[1]) =>
    json.jsonPatch("announcements", id, patch),
);

export const removeAnnouncement = pickStore(
  (id: string) => mysqlStore.deleteAnnouncement(id),
  (id: string) => json.jsonRemove("announcements", id),
);

export const findUserByPhone = pickStore(
  (phone: string) => mysqlStore.findUserByPhone(phone),
  async (phone: string) => {
    const users = await json.jsonList("users");
    return users.find((user) => user.phone === phone) ?? null;
  },
);

export const findUserByWechatOpenid = pickStore(
  (openid: string) => mysqlStore.findUserByWechatOpenid(openid),
  async (openid: string) => {
    const users = await json.jsonList("users");
    return users.find((user) => user.wechatOpenid === openid) ?? null;
  },
);

export const findUserByInviteCode = pickStore(
  (code: string) => mysqlStore.findUserByInviteCode(code),
  async (code: string) => {
    const normalized = String(code || "").trim().toUpperCase();
    if (!normalized) return null;
    const users = await json.jsonList("users");
    return users.find((user) => String(user.inviteCode || "").toUpperCase() === normalized) ?? null;
  },
);

export const insertUser = pickStore(
  (user: Parameters<typeof mysqlStore.insertUser>[0]) => mysqlStore.insertUser(user),
  (user: Parameters<typeof mysqlStore.insertUser>[0]) => json.jsonInsert("users", user),
);

export const listContentPages = pickStore(
  () => mysqlStore.listContentPages(),
  () => json.jsonList("contentPages"),
);

export const getContentPageBySlug = pickStore(
  (slug: string) => mysqlStore.getContentPageBySlug(slug),
  (slug: string) => json.jsonFindContentBySlug(slug),
);

export const upsertContentPage = pickStore(
  (page: Parameters<typeof mysqlStore.upsertContentPage>[0]) => mysqlStore.upsertContentPage(page),
  (page: Parameters<typeof json.jsonUpsertContentPage>[0]) => json.jsonUpsertContentPage(page),
);

export const listProductReviews = pickStore(
  (productId: string) => mysqlStore.listProductReviews(productId),
  (productId: string) => json.jsonListReviewsByProduct(productId),
);

export const listChatConversations = pickStore(
  () => mysqlStore.listChatConversations(),
  async () => {
    const list = await json.jsonList("chatConversations");
    return [...list].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  },
);

export const getChatConversation = pickStore(
  (id: string) => mysqlStore.getChatConversation(id),
  (id: string) => json.jsonFind("chatConversations", id),
);

export const listChatMessages = pickStore(
  (conversationId: string) => mysqlStore.listChatMessages(conversationId),
  (conversationId: string) => json.jsonListChatMessages(conversationId),
);

export const insertChatConversation = pickStore(
  (conv: Parameters<typeof mysqlStore.insertChatConversation>[0]) =>
    mysqlStore.insertChatConversation(conv),
  (conv: Parameters<typeof chatCrud.jsonInsertChatConversation>[0]) =>
    chatCrud.jsonInsertChatConversation(conv),
);

export const updateChatConversation = pickStore(
  (id: string, patch: Parameters<typeof mysqlStore.updateChatConversationRow>[1]) =>
    mysqlStore.updateChatConversationRow(id, patch),
  (id: string, patch: Parameters<typeof chatCrud.jsonUpdateChatConversation>[1]) =>
    chatCrud.jsonUpdateChatConversation(id, patch),
);

export const insertChatMessage = pickStore(
  (message: Parameters<typeof mysqlStore.insertChatMessage>[0]) =>
    mysqlStore.insertChatMessage(message),
  (message: Parameters<typeof chatCrud.jsonInsertChatMessage>[0]) =>
    chatCrud.jsonInsertChatMessage(message),
);

export const getChatConversationByOrderId = pickStore(
  (orderId: string) => mysqlStore.getChatConversationByOrderId(orderId),
  (orderId: string) => chatCrud.jsonGetChatConversationByOrder(orderId),
);

export const listAdminUsers = pickStore(
  () => mysqlStore.listAdminUsers(),
  () => adminUserCrud.jsonListAdminUsers(),
);

export const getAdminUser = pickStore(
  (id: string) => mysqlStore.getAdminUser(id),
  (id: string) => adminUserCrud.jsonGetAdminUser(id),
);

export const getAdminUserByUsername = pickStore(
  (username: string) => mysqlStore.getAdminUserByUsername(username),
  (username: string) => adminUserCrud.jsonGetAdminUserByUsername(username),
);

export const insertAdminUser = pickStore(
  (user: Parameters<typeof mysqlStore.insertAdminUser>[0]) => mysqlStore.insertAdminUser(user),
  (user: Parameters<typeof adminUserCrud.jsonInsertAdminUser>[0]) =>
    adminUserCrud.jsonInsertAdminUser(user),
);

export const updateAdminUser = pickStore(
  (id: string, patch: Parameters<typeof mysqlStore.updateAdminUserRow>[1]) =>
    mysqlStore.updateAdminUserRow(id, patch),
  (id: string, patch: Parameters<typeof adminUserCrud.jsonUpdateAdminUser>[1]) =>
    adminUserCrud.jsonUpdateAdminUser(id, patch),
);

export const removeAdminUser = pickStore(
  (id: string) => mysqlStore.deleteAdminUser(id),
  (id: string) => adminUserCrud.jsonDeleteAdminUser(id),
);

export const insertFeedback = pickStore(
  (feedback: Parameters<typeof mysqlStore.insertFeedback>[0]) => mysqlStore.insertFeedback(feedback),
  async (feedback: Parameters<typeof mysqlStore.insertFeedback>[0]) => {
    const jsonStore = await import("./json-store.js");
    await jsonStore.updateDb((db) => {
      db.feedbacks.unshift(feedback);
    });
    return feedback;
  },
);

export const listFeedbacks = pickStore(
  () => mysqlStore.listFeedbacks(),
  async () => {
    const items = await json.jsonList("feedbacks");
    return [...items].sort((a, b) => (b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0));
  },
);

export const insertUserLedger = pickStore(
  (entry: Parameters<typeof mysqlStore.insertUserLedger>[0]) => mysqlStore.insertUserLedger(entry),
  async (entry: Parameters<typeof mysqlStore.insertUserLedger>[0]) => {
    const jsonStore = await import("./json-store.js");
    await jsonStore.updateDb((db) => {
      if (!db.userLedger) db.userLedger = [];
      db.userLedger.unshift(entry);
    });
    return entry;
  },
);

export const listUserLedgerByUser = pickStore(
  (userId: string) => mysqlStore.listUserLedgerByUser(userId),
  async (userId: string) => {
    const items = await json.jsonList("userLedger");
    return items
      .filter((item) => item.userId === userId)
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : b.createdAt < a.createdAt ? -1 : 0));
  },
);

export const insertUserCoupon = pickStore(
  (coupon: Parameters<typeof mysqlStore.insertUserCoupon>[0]) => mysqlStore.insertUserCoupon(coupon),
  async (coupon: Parameters<typeof mysqlStore.insertUserCoupon>[0]) => json.jsonInsert("userCoupons", coupon),
);

export const getUserCoupon = pickStore(
  (id: string) => mysqlStore.getUserCoupon(id),
  (id: string) => json.jsonFind("userCoupons", id),
);

export const updateUserCoupon = pickStore(
  (id: string, patch: Partial<import("../types.js").UserCoupon>) => mysqlStore.updateUserCouponRow(id, patch),
  (id: string, patch: Partial<import("../types.js").UserCoupon>) => json.jsonPatch("userCoupons", id, patch),
);

export const listUserCouponsByUser = pickStore(
  (userId: string) => mysqlStore.listUserCouponsByUser(userId),
  async (userId: string) => {
    const items = await json.jsonList("userCoupons");
    return items
      .filter((item) => item.userId === userId)
      .sort((a, b) => (b.claimedAt > a.claimedAt ? 1 : b.claimedAt < a.claimedAt ? -1 : 0));
  },
);
