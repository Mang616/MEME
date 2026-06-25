import { count, eq } from "drizzle-orm";
import type { ServiceType } from "@meme/types";
import { sortByOrder } from "../lib/sort.js";
import { getMysqlDb } from "./client.js";
import {
  announcementFromRow,
  announcementToRow,
  bannerFromRow,
  bannerToRow,
  handlerFromRow,
  handlerToRow,
  orderFromRow,
  orderToRow,
  productFromRow,
  productToRow,
  rowsToCategories,
  userFromRow,
  userToRow,
} from "./row-mappers.js";
import { announcements, banners, categories, handlers, orders, products, users } from "./schema.js";
import type { Announcement, AppUser, Banner, Database, Handler, Order, Product } from "../types.js";

export function storageLabel() {
  return "mysql";
}

export async function getCategories(): Promise<Database["categories"]> {
  const db = getMysqlDb();
  const rows = await db.select().from(categories);
  return rowsToCategories(rows);
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

export async function listOrders(userId?: string): Promise<Order[]> {
  const db = getMysqlDb();
  const rows = await db.select().from(orders);
  const mapped = rows.map(orderFromRow);
  if (!userId) return mapped;
  return mapped.filter((order) => order.userId === userId);
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
  patch: Partial<Pick<Order, "status" | "servicePlayer" | "statusText">>,
) {
  const existing = await getOrder(id);
  if (!existing) return null;
  const next = { ...existing, ...patch, id };
  const db = getMysqlDb();
  await db.update(orders).set(orderToRow(next)).where(eq(orders.id, id));
  return next;
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

  await db.delete(orders);
  await db.delete(handlers);
  await db.delete(products);
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

  for (const product of data.products) {
    await db.insert(products).values(productToRow({ ...product, published: product.published ?? true }));
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
