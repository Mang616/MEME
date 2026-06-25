import type { AdminPermission } from "../constants/admin-rbac.js";
import { requireAnyPermission, requirePermission } from "./auth.js";

/** 后台资源 API 权限策略：读/写分离 */
export const adminApiPolicy = {
  operations: { read: ["operations.read"] as const },
  analytics: { read: ["analytics.read"] as const },
  orders: { read: ["orders.read"] as const, write: ["orders.write"] as const },
  products: { read: ["products.read"] as const, write: ["products.write"] as const },
  categories: { read: ["categories.read"] as const, write: ["categories.write"] as const },
  productTags: { read: ["product_tags.read"] as const, write: ["product_tags.write"] as const },
  handlers: { read: ["handlers.read"] as const, write: ["handlers.write"] as const },
  clubs: { read: ["clubs.read"] as const, write: ["clubs.write"] as const },
  users: { read: ["users.read"] as const, write: ["users.write"] as const },
  content: { read: ["content.read"] as const, write: ["content.write"] as const },
  feedbacks: { read: ["feedbacks.read"] as const },
  afterSales: { read: ["after_sales.read"] as const, write: ["after_sales.write"] as const },
} as const;

export function requireRead(...permissions: readonly AdminPermission[]) {
  return requireAnyPermission(...permissions);
}

export function requireWrite(...permissions: readonly AdminPermission[]) {
  return requirePermission(...permissions);
}
