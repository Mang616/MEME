import type { AdminPermission, AdminRole } from "@meme/admin-rbac";

export type { AdminPermission, AdminRole };

export type AdminSession = {
  username: string;
  displayName: string;
  adminId: string;
  roles: AdminRole[];
  permissions: AdminPermission[];
};

const SESSION_KEY = "meme_admin_session";

export function toAdminSession(me: Partial<AdminSession> & Pick<AdminSession, "username">): AdminSession {
  return {
    username: me.username,
    displayName: me.displayName ?? me.username,
    adminId: me.adminId ?? "",
    roles: Array.isArray(me.roles) ? me.roles : [],
    permissions: Array.isArray(me.permissions) ? me.permissions : [],
  };
}

export function setAdminSession(session: AdminSession) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(toAdminSession(session)));
}

export function getAdminSession(): AdminSession | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<AdminSession>;
    if (!parsed.username) return null;
    return toAdminSession(parsed as Partial<AdminSession> & Pick<AdminSession, "username">);
  } catch {
    return null;
  }
}

export function clearAdminSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

/** 客户端权限判断：基于 session 快照；super_admin 拥有全部权限 */
export function hasPermission(permission: AdminPermission, session = getAdminSession()) {
  if (!session) return false;
  const roles = session.roles ?? [];
  const permissions = session.permissions ?? [];
  if (roles.includes("super_admin")) return true;
  return permissions.includes(permission);
}

export function hasAnyPermission(permissions: AdminPermission[], session = getAdminSession()) {
  if (!permissions?.length) return false;
  return permissions.some((perm) => hasPermission(perm, session));
}
