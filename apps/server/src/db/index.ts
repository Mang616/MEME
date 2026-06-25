import { sortByOrder } from "../lib/sort.js";
import * as json from "./json-crud.js";
import * as jsonStore from "./json-store.js";
import * as mysqlStore from "./mysql-store.js";
import { pickStore, storageLabel } from "./store-bridge.js";

export { seedDatabaseIfEmpty, ensureCmsSeeded } from "./seed.js";
export { storageLabel };

export const getCategories = pickStore(
  async () => mysqlStore.getCategories(),
  async () => (await jsonStore.readDb()).categories,
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
  (userId?: string) => mysqlStore.listOrders(userId),
  async (userId?: string) => {
    const orders = await json.jsonList("orders");
    if (!userId) return orders;
    return orders.filter((order) => order.userId === userId);
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
