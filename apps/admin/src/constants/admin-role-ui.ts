import type { AdminRole } from "@meme/admin-rbac";

/** Arco Tag 颜色：各后台角色区分 */
export const ADMIN_ROLE_TAG_COLORS: Record<AdminRole, string> = {
  super_admin: "magenta",
  operator: "arcoblue",
  cs: "cyan",
  handler: "orange",
  companion: "pinkpurple",
};

export function adminRoleTagColor(role: AdminRole) {
  return ADMIN_ROLE_TAG_COLORS[role] ?? "gray";
}
