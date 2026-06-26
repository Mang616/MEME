import csAvatar from "@/assets/roles/cs.webp";
import handlerAvatar from "@/assets/roles/handler.webp";
import operatorAvatar from "@/assets/roles/operator.webp";
import superAdminAvatar from "@/assets/roles/super-admin.webp";
import type { AdminRole } from "@meme/admin-rbac";

/** 各后台角色默认头像 */
export const ROLE_AVATARS: Record<AdminRole, string> = {
  super_admin: superAdminAvatar,
  operator: operatorAvatar,
  cs: csAvatar,
  handler: handlerAvatar,
  companion: handlerAvatar,
};

/** 多角色账号取优先级最高的头像 */
const SESSION_AVATAR_PRIORITY: AdminRole[] = ["super_admin", "operator", "cs", "handler", "companion"];

export function resolveSessionAvatar(roles: readonly AdminRole[]) {
  for (const role of SESSION_AVATAR_PRIORITY) {
    if (roles.includes(role)) return ROLE_AVATARS[role];
  }
  return null;
}
