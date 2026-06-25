import type { ServiceType } from "@meme/types";
import * as jsonStore from "./json-store.js";
import type { Database } from "../types.js";

type CategoryInput = { id: string; name: string };

export async function jsonInsertCategory(serviceType: ServiceType, item: CategoryInput) {
  await jsonStore.updateDb((db) => {
    const list = db.categories[serviceType];
    if (list.some((row) => row.id === item.id)) {
      throw new Error("CATEGORY_EXISTS");
    }
    list.push(item);
  });
  return { serviceType, ...item };
}

export async function jsonUpdateCategory(
  serviceType: ServiceType,
  id: string,
  patch: { name: string },
) {
  let updated: { serviceType: ServiceType; id: string; name: string } | null = null;
  await jsonStore.updateDb((db) => {
    const list = db.categories[serviceType];
    const index = list.findIndex((row) => row.id === id);
    if (index < 0) return;
    list[index] = { ...list[index], name: patch.name };
    updated = { serviceType, id, name: patch.name };
  });
  return updated;
}

export async function jsonDeleteCategory(serviceType: ServiceType, id: string) {
  let removed = false;
  await jsonStore.updateDb((db) => {
    const before = db.categories[serviceType].length;
    db.categories[serviceType] = db.categories[serviceType].filter((row) => row.id !== id);
    removed = db.categories[serviceType].length < before;
  });
  return removed;
}

export async function jsonCountProductsByCategory(serviceType: ServiceType, categoryId: string) {
  const db = await jsonStore.readDb();
  return db.products.filter(
    (product) => product.serviceType === serviceType && product.categoryId === categoryId,
  ).length;
}
