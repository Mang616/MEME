import {
  ADMIN_PERMISSIONS,
  ADMIN_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  isValidAdminPermission,
  normalizeAdminRoles,
  type AdminPermission,
  type AdminRole,
} from "@meme/admin-rbac";

export type { AdminPermission, AdminRole };
export {
  ADMIN_PERMISSIONS,
  ADMIN_ROLES,
  ADMIN_ROLE_DESCRIPTIONS,
  ADMIN_ROLE_LABELS,
  DEFAULT_ROLE_PERMISSIONS,
  EDITABLE_ROLES,
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  isValidAdminPermission,
  isValidAdminRole,
  normalizeAdminRole,
  normalizeAdminRoles,
  permissionLabel,
  roleLabels,
  roleOptions,
} from "@meme/admin-rbac";

/** 运行时角色权限覆盖（由 rolePermissionService 从 DB 加载） */
let rolePermissionOverrides: Partial<Record<AdminRole, AdminPermission[]>> = {};

export function setRolePermissionOverrides(
  overrides: Partial<Record<string, AdminPermission[]>>,
) {
  rolePermissionOverrides = {};
  for (const role of ADMIN_ROLES) {
    if (role === "super_admin") continue;
    const legacyKey = role === "handler" ? "analyst" : role;
    const list = overrides[role] ?? overrides[legacyKey];
    if (!list?.length) continue;
    rolePermissionOverrides[role] = list.filter(isValidAdminPermission);
  }
}

function resolveRolePermissions(role: AdminRole): AdminPermission[] {
  if (role === "super_admin") return [...ADMIN_PERMISSIONS];
  const override = rolePermissionOverrides[role];
  if (override) return [...override];
  return [...DEFAULT_ROLE_PERMISSIONS[role]];
}

export function getRolePermissionsMatrix(): Record<AdminRole, AdminPermission[]> {
  return Object.fromEntries(
    ADMIN_ROLES.map((role) => [role, resolveRolePermissions(role)]),
  ) as Record<AdminRole, AdminPermission[]>;
}

export function updateRolePermissions(role: AdminRole, permissions: AdminPermission[]) {
  if (role === "super_admin") {
    throw new Error("SUPER_ADMIN_LOCKED");
  }
  rolePermissionOverrides[role] = [...new Set(permissions.filter(isValidAdminPermission))];
}

export function permissionsForRoles(roles: AdminRole[]): AdminPermission[] {
  const normalized = normalizeAdminRoles(roles);
  if (normalized.includes("super_admin")) return [...ADMIN_PERMISSIONS];
  const set = new Set<AdminPermission>();
  for (const role of normalized) {
    for (const perm of resolveRolePermissions(role)) {
      set.add(perm);
    }
  }
  return [...set];
}

export function hasPermission(roles: AdminRole[], permission: AdminPermission) {
  const normalized = normalizeAdminRoles(roles);
  if (normalized.includes("super_admin")) return true;
  return permissionsForRoles(normalized).includes(permission);
}

export function canAccessChatType(roles: AdminRole[], type: string) {
  const normalized = normalizeAdminRoles(roles);
  if (normalized.includes("super_admin")) return true;
  if (type === "service") return hasPermission(normalized, "chats.service");
  if (type === "player") return hasPermission(normalized, "chats.player");
  return false;
}
