import type { ServiceType } from "@meme/types";
import {
  countProductsByCategory,
  getCategories,
  insertCategory,
  listProducts,
  removeCategory,
  updateCategory,
} from "../db/index.js";
import type { SubCategory } from "../types.js";

export type CategoryAdminRow = {
  serviceType: ServiceType;
  id: string;
  name: string;
  productCount: number;
};

const CATEGORY_ID_PATTERN = /^[a-z][a-z0-9_-]{0,63}$/;

function assertCategoryId(id: string) {
  if (!CATEGORY_ID_PATTERN.test(id)) {
    throw new Error("INVALID_CATEGORY_ID");
  }
}

export async function assertCategoryForService(serviceType: ServiceType, categoryId: string) {
  const categories = await getCategories();
  const list = categories[serviceType] ?? [];
  if (!list.some((item) => item.id === categoryId)) {
    throw new Error("INVALID_CATEGORY");
  }
}

export const categoryService = {
  async listAdminRows(): Promise<CategoryAdminRow[]> {
    const [categories, products] = await Promise.all([getCategories(), listProducts()]);
    const rows: CategoryAdminRow[] = [];

    for (const serviceType of ["escort", "companion"] as const) {
      for (const item of categories[serviceType] ?? []) {
        rows.push({
          serviceType,
          id: item.id,
          name: item.name,
          productCount: products.filter(
            (product) => product.serviceType === serviceType && product.categoryId === item.id,
          ).length,
        });
      }
    }

    return rows;
  },

  async create(input: { serviceType: ServiceType; id: string; name: string }) {
    assertCategoryId(input.id);
    const categories = await getCategories();
    if ((categories[input.serviceType] ?? []).some((item) => item.id === input.id)) {
      throw new Error("CATEGORY_EXISTS");
    }
    const created = await insertCategory(input.serviceType, {
      id: input.id,
      name: input.name,
    });
    return {
      ...created,
      productCount: 0,
    } satisfies CategoryAdminRow;
  },

  async update(serviceType: ServiceType, id: string, patch: { name: string }) {
    const updated = await updateCategory(serviceType, id, patch);
    if (!updated) return null;
    const productCount = await countProductsByCategory(serviceType, id);
    return { ...updated, productCount } satisfies CategoryAdminRow;
  },

  async remove(serviceType: ServiceType, id: string) {
    const productCount = await countProductsByCategory(serviceType, id);
    if (productCount > 0) {
      throw new Error("CATEGORY_IN_USE");
    }
    return removeCategory(serviceType, id);
  },

  async getByKey(serviceType: ServiceType, id: string): Promise<SubCategory | null> {
    const categories = await getCategories();
    return (categories[serviceType] ?? []).find((item) => item.id === id) ?? null;
  },
};
