import {
  ADMIN_PERMISSIONS,
  ADMIN_ROLE_DESCRIPTIONS,
  ADMIN_ROLE_LABELS,
  ADMIN_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_GROUPS,
  PERMISSION_LABELS,
  type AdminPermission,
  type AdminRole,
} from "@meme/admin-rbac";
import {
  getRolePermissionsMatrix,
  isValidAdminPermission,
  setRolePermissionOverrides,
  updateRolePermissions,
} from "../constants/admin-rbac.js";
import { getContentPageBySlug, upsertContentPage } from "../db/index.js";
import type { ContentPage } from "../types.js";

const RBAC_PAGE_ID = "sys_rbac";
const RBAC_SLUG = "_system_rbac";

type RbacPayload = {
  rolePermissions: Partial<Record<Exclude<AdminRole, "super_admin">, AdminPermission[]>>;
};

function assertEditableRole(role: AdminRole) {
  if (role === "super_admin") {
    throw new Error("SUPER_ADMIN_LOCKED");
  }
}

function rbacContentPage(payload: RbacPayload): ContentPage {
  return {
    id: RBAC_PAGE_ID,
    slug: RBAC_SLUG,
    title: "System RBAC",
    payload,
  };
}

export const rolePermissionService = {
  async load() {
    const page = await getContentPageBySlug(RBAC_SLUG);
    const payload = page?.payload as RbacPayload | undefined;
    if (payload?.rolePermissions) {
      setRolePermissionOverrides(payload.rolePermissions);
    }
  },

  async persist() {
    const matrix = getRolePermissionsMatrix();
    const rolePermissions: RbacPayload["rolePermissions"] = {
      operator: matrix.operator,
      cs: matrix.cs,
      handler: matrix.handler,
    };
    await upsertContentPage(rbacContentPage({ rolePermissions }));
  },

  listRoles() {
    const matrix = getRolePermissionsMatrix();
    return {
      items: ADMIN_ROLES.map((role) => ({
        id: role,
        label: ADMIN_ROLE_LABELS[role],
        description: ADMIN_ROLE_DESCRIPTIONS[role],
        locked: role === "super_admin",
        permissionCount: matrix[role].length,
      })),
      total: ADMIN_ROLES.length,
    };
  },

  getMatrix() {
    const matrix = getRolePermissionsMatrix();
    return {
      roles: ADMIN_ROLES.map((role) => ({
        id: role,
        label: ADMIN_ROLE_LABELS[role],
        locked: role === "super_admin",
      })),
      permissions: ADMIN_PERMISSIONS.map((id) => ({ id, label: PERMISSION_LABELS[id] })),
      groups: PERMISSION_GROUPS,
      matrix,
      defaults: {
        operator: [...DEFAULT_ROLE_PERMISSIONS.operator],
        cs: [...DEFAULT_ROLE_PERMISSIONS.cs],
        handler: [...DEFAULT_ROLE_PERMISSIONS.handler],
      },
    };
  },

  async updateRole(role: AdminRole, permissions: string[]) {
    assertEditableRole(role);
    updateRolePermissions(role, permissions.filter(isValidAdminPermission));
    await this.persist();
    return this.getMatrix();
  },

  async resetRole(role: AdminRole) {
    assertEditableRole(role);
    updateRolePermissions(role, [...DEFAULT_ROLE_PERMISSIONS[role]]);
    await this.persist();
    return this.getMatrix();
  },
};
