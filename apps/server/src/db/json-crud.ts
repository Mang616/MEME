import type { Database } from "../types.js";
import * as jsonStore from "./json-store.js";

type Entity = { id: string };

type CollectionKey =
  | "products"
  | "handlers"
  | "clubs"
  | "orders"
  | "users"
  | "banners"
  | "announcements"
  | "contentPages"
  | "productReviews"
  | "chatConversations"
  | "chatMessages"
  | "feedbacks"
  | "userLedger"
  | "userCoupons"
  | "adminUsers";

type EntityOf<K extends CollectionKey> = Database[K][number];

export async function jsonList<K extends CollectionKey>(key: K): Promise<Database[K]> {
  const db = await jsonStore.readDb();
  return db[key];
}

export async function jsonFind<K extends CollectionKey>(
  key: K,
  id: string,
): Promise<EntityOf<K> | null> {
  const list = await jsonList(key);
  return ((list as Entity[]).find((item) => item.id === id) ?? null) as EntityOf<K> | null;
}

export async function jsonInsert<K extends CollectionKey>(
  key: K,
  item: EntityOf<K>,
  options: { prepend?: boolean; existsError?: string } = {},
) {
  await jsonStore.updateDb((db) => {
    const list = db[key] as Entity[];
    if (options.existsError && list.some((row) => row.id === item.id)) {
      throw new Error(options.existsError);
    }
    if (options.prepend) list.unshift(item as EntityOf<K>);
    else list.push(item as EntityOf<K>);
  });
  return item;
}

export async function jsonPatch<K extends CollectionKey>(
  key: K,
  id: string,
  patch: Partial<EntityOf<K>>,
): Promise<EntityOf<K> | null> {
  let updated: EntityOf<K> | null = null;
  await jsonStore.updateDb((db) => {
    const list = db[key] as Entity[];
    const index = list.findIndex((row) => row.id === id);
    if (index < 0) return;
    updated = { ...list[index], ...patch, id } as EntityOf<K>;
    (list as EntityOf<K>[])[index] = updated;
  });
  return updated;
}

export async function jsonRemove<K extends CollectionKey>(key: K, id: string) {
  let removed = false;
  await jsonStore.updateDb((db) => {
    const list = db[key] as Entity[];
    const before = list.length;
    db[key] = list.filter((row) => row.id !== id) as Database[K];
    removed = (db[key] as Entity[]).length < before;
  });
  return removed;
}

export async function jsonFindContentBySlug(slug: string) {
  const db = await jsonStore.readDb();
  return db.contentPages.find((page) => page.slug === slug) ?? null;
}

export async function jsonUpsertContentPage(page: import("../types.js").ContentPage) {
  await jsonStore.updateDb((db) => {
    const index = db.contentPages.findIndex(
      (row) => row.slug === page.slug || row.id === page.id,
    );
    if (index >= 0) db.contentPages[index] = page;
    else db.contentPages.push(page);
  });
  return page;
}

export async function jsonListReviewsByProduct(productId: string) {
  const list = await jsonList("productReviews");
  return list
    .filter((review) => review.productId === productId)
    .sort((a, b) => (b.reviewTime > a.reviewTime ? 1 : b.reviewTime < a.reviewTime ? -1 : 0));
}

export async function jsonListChatMessages(conversationId: string) {
  const list = await jsonList("chatMessages");
  return list.filter((message) => message.conversationId === conversationId);
}
