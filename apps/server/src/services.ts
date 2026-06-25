import { ORDER_STATUS_TEXT } from "./constants.js";
import { readDb, updateDb } from "./db.js";
import { buildOrder, type CreateOrderInput } from "./lib/orders.js";
import {
  toAdminHandlerRow,
  toAdminOrderRow,
  toAdminProductRow,
} from "./lib/mappers.js";
import type { Handler, Order, Product } from "./types.js";

function publishedProducts(products: Product[]) {
  return products.filter((product) => product.published !== false);
}

export const catalogService = {
  async getCatalog() {
    const db = await readDb();
    return { subCategories: db.categories };
  },
};

export const productService = {
  async listPublished() {
    const db = await readDb();
    return publishedProducts(db.products);
  },

  async getById(id: string) {
    const db = await readDb();
    return db.products.find((product) => product.id === id) ?? null;
  },

  async create(input: Omit<Product, "id"> & { id?: string }) {
    let created: Product | null = null;
    await updateDb((db) => {
      const id = input.id ?? `p${Date.now()}`;
      if (db.products.some((product) => product.id === id)) {
        throw new Error("PRODUCT_EXISTS");
      }
      created = { ...input, id, published: input.published ?? true };
      db.products.unshift(created);
    });
    return created!;
  },

  async update(id: string, patch: Partial<Product>) {
    let updated: Product | null = null;
    await updateDb((db) => {
      const index = db.products.findIndex((product) => product.id === id);
      if (index < 0) return;
      updated = { ...db.products[index], ...patch, id };
      db.products[index] = updated;
    });
    return updated;
  },

  async remove(id: string) {
    let removed = false;
    await updateDb((db) => {
      const before = db.products.length;
      db.products = db.products.filter((product) => product.id !== id);
      removed = db.products.length < before;
    });
    return removed;
  },

  async listAdminRows() {
    const db = await readDb();
    return db.products.map((product) => toAdminProductRow(product, db.categories));
  },

  async toAdminRow(product: Product) {
    const db = await readDb();
    return toAdminProductRow(product, db.categories);
  },
};

export const orderService = {
  async list(userId?: string) {
    const db = await readDb();
    if (!userId) return db.orders;
    return db.orders.filter((order) => order.userId === userId);
  },

  async getById(id: string) {
    const db = await readDb();
    return db.orders.find((order) => order.id === id) ?? null;
  },

  async create(input: CreateOrderInput) {
    const order = buildOrder(input);
    await updateDb((db) => {
      db.orders.unshift(order);
    });
    return order;
  },

  async update(
    id: string,
    patch: Partial<Pick<Order, "status" | "servicePlayer" | "statusText">>,
  ) {
    let updated: Order | null = null;
    await updateDb((db) => {
      const index = db.orders.findIndex((order) => order.id === id);
      if (index < 0) return;
      const next = { ...db.orders[index], ...patch };
      if (patch.status) {
        next.statusText = ORDER_STATUS_TEXT[patch.status];
      }
      db.orders[index] = next;
      updated = next;
    });
    return updated;
  },

  listAdminRows(orders: Order[]) {
    return orders.map(toAdminOrderRow);
  },
};

export const handlerService = {
  async list() {
    const db = await readDb();
    return db.handlers;
  },

  async getById(id: string) {
    const db = await readDb();
    return db.handlers.find((handler) => handler.id === id) ?? null;
  },

  async create(input: Omit<Handler, "id"> & { id?: string }) {
    let created: Handler | null = null;
    await updateDb((db) => {
      const id = input.id ?? `h${Date.now()}`;
      if (db.handlers.some((handler) => handler.id === id)) {
        throw new Error("HANDLER_EXISTS");
      }
      created = { ...input, id };
      db.handlers.unshift(created);
    });
    return created!;
  },

  async update(id: string, patch: Partial<Handler>) {
    let updated: Handler | null = null;
    await updateDb((db) => {
      const index = db.handlers.findIndex((handler) => handler.id === id);
      if (index < 0) return;
      updated = { ...db.handlers[index], ...patch, id };
      db.handlers[index] = updated;
    });
    return updated;
  },

  async remove(id: string) {
    let removed = false;
    await updateDb((db) => {
      const before = db.handlers.length;
      db.handlers = db.handlers.filter((handler) => handler.id !== id);
      removed = db.handlers.length < before;
    });
    return removed;
  },

  listAdminRows(handlers: Handler[]) {
    return handlers.map(toAdminHandlerRow);
  },
};
