import { isServiceProviderRole } from "@meme/admin-rbac";
import type { AdminRole } from "./session";

export type ServiceType = "escort" | "companion";

export function isLinkedServiceProvider(user: {
  handlerId?: string;
  roles: AdminRole[];
}) {
  return Boolean(user.handlerId && user.roles.some(isServiceProviderRole));
}

/** 后台角色 → 打手/陪玩档案类型（非服务者角色返回 null） */
export function serviceTypeForRoles(roles: AdminRole[]): ServiceType | null {
  if (roles.includes("companion")) return "companion";
  if (roles.includes("handler")) return "escort";
  return null;
}
