import * as jsonStore from "./json-store.js";
import type { ProductTag } from "../types.js";

export async function jsonListProductTags() {
  const db = await jsonStore.readDb();
  return [...db.productTags].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function jsonGetProductTag(id: string) {
  const db = await jsonStore.readDb();
  return db.productTags.find((tag) => tag.id === id) ?? null;
}

export async function jsonInsertProductTag(item: ProductTag) {
  await jsonStore.updateDb((db) => {
    if (db.productTags.some((tag) => tag.id === item.id)) {
      throw new Error("TAG_EXISTS");
    }
    db.productTags.push(item);
  });
  return item;
}

export async function jsonUpdateProductTag(id: string, patch: Partial<ProductTag>) {
  let updated: ProductTag | null = null;
  await jsonStore.updateDb((db) => {
    const index = db.productTags.findIndex((tag) => tag.id === id);
    if (index < 0) return;
    const existing = db.productTags[index];
    const next = { ...existing, ...patch, id };
    db.productTags[index] = next;
    if (patch.name && patch.name !== existing.name) {
      for (const product of db.products) {
        if (product.tag === existing.name) {
          product.tag = patch.name;
        }
      }
    }
    updated = next;
  });
  return updated;
}

export async function jsonDeleteProductTag(id: string) {
  let removed = false;
  await jsonStore.updateDb((db) => {
    const before = db.productTags.length;
    db.productTags = db.productTags.filter((tag) => tag.id !== id);
    removed = db.productTags.length < before;
  });
  return removed;
}

export async function jsonCountProductsByTag(tagName: string) {
  const db = await jsonStore.readDb();
  return db.products.filter((product) => product.tag === tagName).length;
}
