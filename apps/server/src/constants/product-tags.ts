import type { ProductTag } from "../types.js";

/** 空库 / 补种时的默认商品标签 */
export const DEFAULT_PRODUCT_TAGS: ProductTag[] = [
  { id: "recommend", name: "推荐", style: "recommend", sortOrder: 0, enabled: true },
  { id: "new", name: "新品", style: "new", sortOrder: 1, enabled: true },
  { id: "limited", name: "限购", style: "recommend", sortOrder: 2, enabled: true },
];
