import type { AdminRole } from "../constants/admin-rbac.js";
import {
  normalizeAdminRoles,
  permissionsForRoles,
  roleLabels,
  roleOptions,
} from "../constants/admin-rbac.js";
import { isServiceProviderRole } from "@meme/admin-rbac";
import { ADMIN_ACCOUNT } from "../config.js";
import {
  HANDLER_LEGACY_ADMIN_ACCOUNTS,
  HANDLER_LEGACY_PROFILES,
  HANDLER_LEGACY_SERVICE_TYPES,
  buildHandlerAdminUser,
} from "../constants/handler-legacy-profiles.js";
import {
  serviceTypeForProviderRole,
} from "../lib/service-provider-role.js";
import {
  getHandler,
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
import { adminPresenceService } from "./admin-presence.js";
import type { AdminUser } from "../types.js";

export type AdminSession = {
  adminId: string;
  username: string;
  displayName: string;
  roles: AdminRole[];
  permissions: ReturnType<typeof permissionsForRoles>;
  handlerId?: string;
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

async function assertHandlerLinkForRoles(roles: AdminRole[], handlerId?: string) {
  const providerRoles = roles.filter(isServiceProviderRole);
  if (!providerRoles.length) {
    if (handlerId?.trim()) throw new Error("HANDLER_LINK_NOT_ALLOWED");
    return;
  }
  if (providerRoles.length > 1) throw new Error("INVALID_ROLES");
  const trimmedHandlerId = handlerId?.trim();
  if (!trimmedHandlerId) throw new Error("HANDLER_ID_REQUIRED");

  const handler = await getHandler(trimmedHandlerId);
  if (!handler) throw new Error("HANDLER_NOT_FOUND");

  const expectedServiceType = serviceTypeForProviderRole(providerRoles[0]!);
  if (expectedServiceType && handler.serviceType !== expectedServiceType) {
    throw new Error("HANDLER_SERVICE_TYPE_MISMATCH");
  }
}

async function touchHandlerPresence(user: AdminUser) {
  const roles = normalizeAdminRoles(user.roles);
  if (!roles.some(isServiceProviderRole) || !user.handlerId) return;
  await adminPresenceService.touch(user.id, user.handlerId);
}

function sessionPayload(session: AdminSession) {
  return {
    username: session.username,
    displayName: session.displayName,
    adminId: session.adminId,
    roles: session.roles,
    permissions: session.permissions,
    handlerId: session.handlerId ?? "",
  };
}

export const adminUserService = {
  async login(username: string, password: string): Promise<{ token: string; session: AdminSession } | null> {
    const trimmed = username.trim();
    const dbUser = await getAdminUserByUsername(trimmed);

    if (dbUser) {
      if (!dbUser.enabled || !verifyPassword(password, dbUser.passwordHash)) return null;
      const session = this.toSession(dbUser);
      await touchHandlerPresence(dbUser);
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
      handlerId: user.handlerId || undefined,
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
    handlerId?: string;
  }) {
    const username = input.username.trim();
    if (!username) throw new Error("INVALID_USERNAME");
    const roles = assertRoles(input.roles);
    await assertHandlerLinkForRoles(roles, input.handlerId);
    const user: AdminUser = {
      id: `adm_${Date.now()}`,
      username,
      passwordHash: hashPassword(input.password),
      displayName: input.displayName.trim() || username,
      roles,
      enabled: input.enabled ?? true,
      createdAt: formatDateTime(),
      handlerId: input.handlerId?.trim() || undefined,
    };
    await insertAdminUser(user);
    return toAdminUserRow(user);
  },

  async update(
    id: string,
    patch: Partial<Pick<AdminUser, "displayName" | "roles" | "enabled" | "handlerId">> & {
      password?: string;
    },
  ) {
    const existing = await getAdminUser(id);
    if (!existing) return null;
    const nextRoles = patch.roles ? assertRoles(patch.roles) : normalizeAdminRoles(existing.roles);
    const nextHandlerId =
      patch.handlerId !== undefined ? patch.handlerId.trim() || undefined : existing.handlerId;
    await assertHandlerLinkForRoles(nextRoles, nextHandlerId);

    const nextPatch: Partial<AdminUser> = {
      displayName: patch.displayName?.trim() || existing.displayName,
      enabled: patch.enabled ?? existing.enabled,
    };
    if (patch.roles) {
      nextPatch.roles = nextRoles;
    }
    if (patch.password) {
      nextPatch.passwordHash = hashPassword(patch.password);
    }
    if (patch.handlerId !== undefined) {
      nextPatch.handlerId = nextHandlerId;
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

export { sessionPayload as adminSessionPayload };

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
    ...Object.keys(HANDLER_LEGACY_ADMIN_ACCOUNTS).map((handlerId) =>
      buildHandlerAdminUser(
        {
          id: handlerId,
          name: HANDLER_LEGACY_ADMIN_ACCOUNTS[handlerId].displayName,
          realName: HANDLER_LEGACY_PROFILES[handlerId]?.realName ?? "",
          serviceType: HANDLER_LEGACY_SERVICE_TYPES[handlerId] ?? "escort",
        },
        now,
        hashPassword,
      ),
    ),
  ];
}
