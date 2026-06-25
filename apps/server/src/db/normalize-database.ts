import { withCmsDefaults } from "./cms-defaults.js";
import type { Database } from "../types.js";

/** 将磁盘/种子中的 partial 数据规范为完整 Database 结构 */
export function normalizeDatabase(data: Partial<Database>): Database {
  const cms = withCmsDefaults(data);
  return {
    orders: (data.orders ?? []).map((order) => ({ ...order, product: { ...order.product } })),
    products: (data.products ?? []).map((product) => ({
      ...product,
      published: product.published ?? true,
    })),
    handlers: (data.handlers ?? []).map((handler) => ({ ...handler })),
    categories: data.categories ?? { escort: [], companion: [] },
    ...cms,
  };
}
