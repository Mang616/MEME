import { DEFAULT_PRODUCT_TAGS } from "../constants/product-tags.js";
import {
  countProductsByTag,
  getProductTag,
  insertProductTag,
  listProductTags,
  listProducts,
  removeProductTag,
  updateProductTag,
} from "../db/index.js";
import type { ProductTag, ProductTagStyle } from "../types.js";

export type ProductTagAdminRow = ProductTag & { productCount: number };

const TAG_ID_PATTERN = /^[a-z][a-z0-9_-]{0,63}$/;
const TAG_STYLES: ProductTagStyle[] = ["recommend", "new"];

function assertTagId(id: string) {
  if (!TAG_ID_PATTERN.test(id)) {
    throw new Error("INVALID_TAG_ID");
  }
}

function assertTagStyle(style: string): asserts style is ProductTagStyle {
  if (!TAG_STYLES.includes(style as ProductTagStyle)) {
    throw new Error("INVALID_TAG_STYLE");
  }
}

export async function assertProductTag(tag: string) {
  if (!tag) return;
  const tags = await listProductTags();
  if (!tags.some((item) => item.enabled && item.name === tag)) {
    throw new Error("INVALID_TAG");
  }
}

export const productTagService = {
  async listPublic() {
    const tags = await listProductTags();
    return tags.filter((tag) => tag.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async listAdminRows(): Promise<ProductTagAdminRow[]> {
    const [tags, products] = await Promise.all([listProductTags(), listProducts()]);
    return tags.map((tag) => ({
      ...tag,
      productCount: products.filter((product) => product.tag === tag.name).length,
    }));
  },

  async create(input: {
    id: string;
    name: string;
    style: ProductTagStyle;
    sortOrder?: number;
    enabled?: boolean;
  }) {
    assertTagId(input.id);
    assertTagStyle(input.style);
    const tags = await listProductTags();
    if (tags.some((tag) => tag.id === input.id)) {
      throw new Error("TAG_EXISTS");
    }
    if (tags.some((tag) => tag.name === input.name)) {
      throw new Error("TAG_NAME_EXISTS");
    }
    const created: ProductTag = {
      id: input.id,
      name: input.name,
      style: input.style,
      sortOrder: input.sortOrder ?? 0,
      enabled: input.enabled ?? true,
    };
    await insertProductTag(created);
    return { ...created, productCount: 0 } satisfies ProductTagAdminRow;
  },

  async update(
    id: string,
    patch: Partial<Pick<ProductTag, "name" | "style" | "sortOrder" | "enabled">>,
  ) {
    if (patch.style !== undefined) {
      assertTagStyle(patch.style);
    }
    if (patch.name) {
      const tags = await listProductTags();
      if (tags.some((tag) => tag.id !== id && tag.name === patch.name)) {
        throw new Error("TAG_NAME_EXISTS");
      }
    }
    const updated = await updateProductTag(id, patch);
    if (!updated) return null;
    const productCount = await countProductsByTag(updated.name);
    return { ...updated, productCount } satisfies ProductTagAdminRow;
  },

  async remove(id: string) {
    const existing = await getProductTag(id);
    if (!existing) return false;
    const productCount = await countProductsByTag(existing.name);
    if (productCount > 0) {
      throw new Error("TAG_IN_USE");
    }
    return removeProductTag(id);
  },

  async getById(id: string) {
    return getProductTag(id);
  },
};

export async function ensureDefaultProductTags() {
  const tags = await listProductTags();
  if (tags.length > 0) return false;
  for (const tag of DEFAULT_PRODUCT_TAGS) {
    await insertProductTag({ ...tag });
  }
  return true;
}
