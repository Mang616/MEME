import type { AdminRole } from "../constants/admin-rbac.js";
import {
  normalizeAdminRoles,
  permissionsForRoles,
  roleLabels,
  roleOptions,
} from "../constants/admin-rbac.js";
import { ADMIN_ACCOUNT } from "../config.js";
import {
  removeAdminUser,
  getAdminUser,
  getAdminUserByUsername,
  insertAdminUser,
  listAdminUsers,
  updateAdminUser,
} from "../db/index.js";
import { formatDateTime } from "../lib/format-time.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signAdminToken } from "../middleware/auth.js";
import type { AdminUser } from "../types.js";

export type AdminSession = {
  adminId: string;
  username: string;
  displayName: string;
  roles: AdminRole[];
  permissions: ReturnType<typeof permissionsForRoles>;
};

export type AdminUserRow = Omit<AdminUser, "passwordHash"> & {
  roleLabels: string[];
};

function toAdminUserRow(user: AdminUser): AdminUserRow {
  const { passwordHash: _passwordHash, ...rest } = user;
  return {
    ...rest,
    roleLabels: roleLabels(normalizeAdminRoles(user.roles)),
  };
}

function assertRoles(roles: string[]): AdminRole[] {
  const normalized = normalizeAdminRoles(roles);
  if (!normalized.length) throw new Error("INVALID_ROLES");
  return normalized;
}

export const adminUserService = {
  async login(username: string, password: string): Promise<{ token: string; session: AdminSession } | null> {
    const trimmed = username.trim();
    const dbUser = await getAdminUserByUsername(trimmed);

    if (dbUser) {
      if (!dbUser.enabled || !verifyPassword(password, dbUser.passwordHash)) return null;
      const session = this.toSession(dbUser);
      return { token: signAdminToken(session), session };
    }

    if (trimmed !== ADMIN_ACCOUNT.username || password !== ADMIN_ACCOUNT.password) {
      return null;
    }

    const session: AdminSession = {
      adminId: "env_admin",
      username: trimmed,
      displayName: "超级管理员",
      roles: ["super_admin"],
      permissions: permissionsForRoles(["super_admin"]),
    };
    return { token: signAdminToken(session), session };
  },

  toSession(user: AdminUser): AdminSession {
    const roles = normalizeAdminRoles(user.roles);
    return {
      adminId: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      roles,
      permissions: permissionsForRoles(roles),
    };
  },

  async listRows(): Promise<AdminUserRow[]> {
    const users = await listAdminUsers();
    return users.map(toAdminUserRow);
  },

  async create(input: {
    username: string;
    password: string;
    displayName: string;
    roles: AdminRole[];
    enabled?: boolean;
  }) {
    const username = input.username.trim();
    if (!username) throw new Error("INVALID_USERNAME");
    const roles = assertRoles(input.roles);
    const user: AdminUser = {
      id: `adm_${Date.now()}`,
      username,
      passwordHash: hashPassword(input.password),
      displayName: input.displayName.trim() || username,
      roles,
      enabled: input.enabled ?? true,
      createdAt: formatDateTime(),
    };
    await insertAdminUser(user);
    return toAdminUserRow(user);
  },

  async update(
    id: string,
    patch: Partial<Pick<AdminUser, "displayName" | "roles" | "enabled">> & {
      password?: string;
    },
  ) {
    const existing = await getAdminUser(id);
    if (!existing) return null;
    const nextPatch: Partial<AdminUser> = {
      displayName: patch.displayName?.trim() || existing.displayName,
      enabled: patch.enabled ?? existing.enabled,
    };
    if (patch.roles) {
      nextPatch.roles = assertRoles(patch.roles);
    }
    if (patch.password) {
      nextPatch.passwordHash = hashPassword(patch.password);
    }
    const updated = await updateAdminUser(id, nextPatch);
    return updated ? toAdminUserRow(updated) : null;
  },

  async remove(id: string) {
    return removeAdminUser(id);
  },

  async updateSelfProfile(
    session: AdminSession,
    input: {
      displayName?: string;
      currentPassword?: string;
      password?: string;
    },
  ): Promise<{ session: AdminSession; token: string } | { error: string; status: number }> {
    const isEnvAdmin = session.adminId === "env_admin";

    if (input.password) {
      if (isEnvAdmin) {
        return { error: "环境变量账号请在部署配置中修改密码", status: 400 };
      }
      if (!input.currentPassword) {
        return { error: "修改密码需填写当前密码", status: 400 };
      }
      const existing = await getAdminUser(session.adminId);
      if (!existing || !verifyPassword(input.currentPassword, existing.passwordHash)) {
        return { error: "当前密码不正确", status: 400 };
      }
    }

    if (isEnvAdmin) {
      const nextSession: AdminSession = {
        ...session,
        displayName: input.displayName?.trim() || session.displayName,
      };
      return { session: nextSession, token: signAdminToken(nextSession) };
    }

    const existing = await getAdminUser(session.adminId);
    if (!existing) {
      return { error: "账号不存在", status: 404 };
    }

    const updated = await this.update(session.adminId, {
      displayName: input.displayName,
      password: input.password,
    });
    if (!updated) {
      return { error: "更新失败", status: 500 };
    }

    const nextSession = this.toSession({
      ...existing,
      displayName: updated.displayName,
      roles: updated.roles,
    });
    return { session: nextSession, token: signAdminToken(nextSession) };
  },

  roleOptions() {
    return roleOptions();
  },

  /** 校验当前登录管理员的密码（含环境变量超管） */
  async verifyAdminPassword(session: AdminSession, password: string) {
    if (!password) return false;
    if (session.adminId === "env_admin") {
      return password === ADMIN_ACCOUNT.password;
    }
    const user = await getAdminUser(session.adminId);
    return Boolean(user?.enabled && verifyPassword(password, user.passwordHash));
  },
};

export async function buildDefaultAdminUsers(): Promise<AdminUser[]> {
  const now = formatDateTime();
  return [
    {
      id: "admin_super",
      username: ADMIN_ACCOUNT.username,
      passwordHash: hashPassword(ADMIN_ACCOUNT.password),
      displayName: "超级管理员",
      roles: ["super_admin"],
      enabled: true,
      createdAt: now,
    },
    {
      id: "admin_cs",
      username: "kefu",
      passwordHash: hashPassword("kefu123"),
      displayName: "客服专员",
      roles: ["cs"],
      enabled: true,
      createdAt: now,
    },
    {
      id: "admin_ops",
      username: "yunying",
      passwordHash: hashPassword("yunying123"),
      displayName: "运营专员",
      roles: ["operator"],
      enabled: true,
      createdAt: now,
    },
    {
      id: "admin_handler",
      username: "dashou",
      passwordHash: hashPassword("dashou123"),
      displayName: "打手专员",
      roles: ["handler"],
      enabled: true,
      createdAt: now,
    },
  ];
}
