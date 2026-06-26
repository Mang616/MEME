import {
  createProduct,
  getCategories,
  getProduct,
  listProductTags,
  listProducts,
  removeProduct,
  updateProduct,
} from "./db/index.js";
import { assertCategoryForService } from "./services/categories.js";
import { assertProductTag } from "./services/product-tags.js";
import {
  deleteProductCover,
  syncProductCoverOnCreate,
  syncProductCoverOnUpdate,
} from "./services/cms.js";
import { cleanupReplacedMedia } from "./lib/media-lifecycle.js";
import { createEntity } from "./lib/create-entity.js";
import { toAdminProductRow } from "./lib/mappers.js";
import type { Product } from "./types.js";

export { orderService } from "./services/orders.js";
export { handlerService } from "./services/handlers.js";

function publishedProducts(products: Product[]) {
  return products.filter((product) => product.published !== false);
}

export const catalogService = {
  async getCatalog() {
    const [subCategories, tags] = await Promise.all([getCategories(), listProductTags()]);
    const productTags = tags
      .filter((tag) => tag.enabled)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return { subCategories, productTags };
  },
};

function nextCoverRev(cover: string, previousRev = 0) {
  return cover ? Date.now() : 0;
}

export const productService = {
  async listPublished() {
    const products = await listProducts();
    return publishedProducts(products);
  },

  async getById(id: string) {
    return getProduct(id);
  },

  async create(input: Omit<Product, "id"> & { id?: string }) {
    await assertCategoryForService(input.serviceType, input.categoryId);
    await assertProductTag(input.tag);

    const entity = await createEntity({
      idPrefix: "p",
      existsError: "PRODUCT_EXISTS",
      getById: getProduct,
      create: (entity) => createProduct({ ...entity, published: entity.published ?? true }),
      input: {
        ...input,
        published: input.published ?? true,
        couponAllowed: input.couponAllowed ?? true,
        coverRev: input.cover ? nextCoverRev(input.cover) : 0,
      },
    });

    if (!input.cover) return entity;

    const cover = await syncProductCoverOnCreate(entity.id, input.cover);
    if (cover === input.cover) return entity;

    const coverRev = nextCoverRev(cover);
    return (await updateProduct(entity.id, { cover, coverRev })) ?? { ...entity, cover, coverRev };
  },

  async update(id: string, patch: Partial<Product>) {
    const existing = await getProduct(id);
    if (!existing) return null;

    const serviceType = patch.serviceType ?? existing.serviceType;
    const categoryId = patch.categoryId ?? existing.categoryId;
    if (patch.serviceType !== undefined || patch.categoryId !== undefined) {
      await assertCategoryForService(serviceType, categoryId);
    }

    if (patch.tag !== undefined) {
      await assertProductTag(patch.tag);
    }

    if (patch.cover === undefined) {
      return updateProduct(id, patch);
    }

    const cover = patch.cover
      ? await syncProductCoverOnUpdate(id, existing.cover, patch.cover)
      : "";
    await cleanupReplacedMedia(existing.cover, cover || undefined);
    const coverChanged = cover !== existing.cover;
    const coverRev = coverChanged ? nextCoverRev(cover, existing.coverRev) : existing.coverRev ?? 0;
    return updateProduct(id, { ...patch, cover, coverRev });
  },

  async remove(id: string) {
    const existing = await getProduct(id);
    const ok = await removeProduct(id);
    if (ok) await deleteProductCover(existing?.cover);
    return ok;
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
