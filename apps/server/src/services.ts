import { ORDER_STATUS_TEXT } from "./constants.js";
import {
  createHandler,
  createOrder,
  createProduct,
  getCategories,
  getHandler,
  getOrder,
  getProduct,
  listHandlers,
  listOrders,
  listProducts,
  removeHandler,
  removeProduct,
  updateHandler,
  updateOrder,
  updateProduct,
} from "./db/index.js";
import { buildOrder, type CreateOrderInput } from "./lib/orders.js";
import { createEntity } from "./lib/create-entity.js";
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
    const subCategories = await getCategories();
    return { subCategories };
  },
};

export const productService = {
  async listPublished() {
    const products = await listProducts();
    return publishedProducts(products);
  },

  async getById(id: string) {
    return getProduct(id);
  },

  async create(input: Omit<Product, "id"> & { id?: string }) {
    return createEntity({
      idPrefix: "p",
      existsError: "PRODUCT_EXISTS",
      getById: getProduct,
      create: (entity) => createProduct({ ...entity, published: entity.published ?? true }),
      input: { ...input, published: input.published ?? true },
    });
  },

  async update(id: string, patch: Partial<Product>) {
    return updateProduct(id, patch);
  },

  async remove(id: string) {
    return removeProduct(id);
  },

  async listAdminRows() {
    const [products, categories] = await Promise.all([listProducts(), getCategories()]);
    return products.map((product) => toAdminProductRow(product, categories));
  },

  async toAdminRow(product: Product) {
    const categories = await getCategories();
    return toAdminProductRow(product, categories);
  },
};

export const orderService = {
  async list(userId?: string) {
    return listOrders(userId);
  },

  async getById(id: string) {
    return getOrder(id);
  },

  async create(input: CreateOrderInput) {
    const order = buildOrder(input);
    return createOrder(order);
  },

  async update(
    id: string,
    patch: Partial<Pick<Order, "status" | "servicePlayer" | "statusText">>,
  ) {
    const nextPatch = { ...patch };
    if (patch.status) {
      nextPatch.statusText = ORDER_STATUS_TEXT[patch.status];
    }
    return updateOrder(id, nextPatch);
  },

  listAdminRows(orders: Order[]) {
    return orders.map(toAdminOrderRow);
  },
};

export const handlerService = {
  async list() {
    return listHandlers();
  },

  async getById(id: string) {
    return getHandler(id);
  },

  async create(input: Omit<Handler, "id"> & { id?: string }) {
    return createEntity({
      idPrefix: "h",
      existsError: "HANDLER_EXISTS",
      getById: getHandler,
      create: createHandler,
      input,
    });
  },

  async update(id: string, patch: Partial<Handler>) {
    return updateHandler(id, patch);
  },

  async remove(id: string) {
    return removeHandler(id);
  },

  listAdminRows(handlers: Handler[]) {
    return handlers.map(toAdminHandlerRow);
  },
};
