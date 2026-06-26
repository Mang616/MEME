import { USE_MYSQL } from "../config.js";
import {
  HANDLER_LEGACY_PROFILES,
  buildHandlerAdminUser,
  legacyAdminPresetForHandler,
  legacyHandlerIdForAdminUser,
} from "../constants/handler-legacy-profiles.js";
import {
  rolesForHandlerProfile,
  serviceProviderRolesMatch,
} from "../lib/service-provider-role.js";
import type { AdminUser, Handler } from "../types.js";

function buildServiceProviderAdminUserPatch(handler: Handler, user: AdminUser): Partial<AdminUser> {
  const patch: Partial<AdminUser> = {};
  const expectedRoles = rolesForHandlerProfile(handler.serviceType);

  if (user.handlerId !== handler.id) patch.handlerId = handler.id;
  if (!serviceProviderRolesMatch(user.roles, handler.serviceType)) {
    patch.roles = expectedRoles;
  }

  const preferredDisplay = handler.name.trim();
  if (preferredDisplay && user.displayName.trim() !== preferredDisplay) {
    patch.displayName = preferredDisplay;
  }

  return patch;
}

async function backfillEmptyHandlerProfiles(
  updateHandler: (id: string, patch: Partial<Handler>) => Promise<unknown>,
) {
  let changed = false;

  if (USE_MYSQL) {
    const { listHandlers } = await import("./index.js");
    for (const handler of await listHandlers()) {
      const legacy = HANDLER_LEGACY_PROFILES[handler.id];
      if (!legacy || handler.realName?.trim()) continue;
      await updateHandler(handler.id, legacy);
      changed = true;
    }
    return changed;
  }

  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const dbFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../data/db.json");

  try {
    const raw = JSON.parse(await readFile(dbFile, "utf8")) as {
      handlers?: Array<{ id: string; realName?: string }>;
    };
    for (const handler of raw.handlers ?? []) {
      const legacy = HANDLER_LEGACY_PROFILES[handler.id];
      if (!legacy || handler.realName?.trim()) continue;
      await updateHandler(handler.id, legacy);
      changed = true;
    }
  } catch {
    // 尚无 db.json，首次启动会走 seed
  }

  return changed;
}

async function ensureAdminAccountForHandler(
  handler: Handler,
  adminUsers: AdminUser[],
  deps: {
    now: string;
    hashPassword: (plain: string) => string;
    getAdminUser: (id: string) => Promise<AdminUser | null>;
    updateAdminUser: (id: string, patch: Partial<AdminUser>) => Promise<AdminUser | null>;
    insertAdminUser: (user: AdminUser) => Promise<AdminUser>;
  },
) {
  const expectedRoles = rolesForHandlerProfile(handler.serviceType);
  const linked = adminUsers.find((user) => user.handlerId === handler.id);

  if (linked) {
    const patch = buildServiceProviderAdminUserPatch(handler, linked);
    if (Object.keys(patch).length) {
      await deps.updateAdminUser(linked.id, patch);
      return true;
    }
    return false;
  }

  const preset = buildHandlerAdminUser(handler, deps.now, deps.hashPassword);
  const existingById = await deps.getAdminUser(preset.id);
  const existingByUsername = adminUsers.find((user) => user.username === preset.username);

  if (existingById) {
    if (
      existingById.handlerId !== handler.id ||
      !serviceProviderRolesMatch(existingById.roles, handler.serviceType)
    ) {
      await deps.updateAdminUser(existingById.id, {
        handlerId: handler.id,
        roles: expectedRoles,
      });
      return true;
    }
    return false;
  }

  if (existingByUsername) {
    await deps.updateAdminUser(existingByUsername.id, {
      handlerId: handler.id,
      roles: expectedRoles,
    });
    return true;
  }

  await deps.insertAdminUser(preset);
  adminUsers.push(preset);
  return true;
}

/** 修复种子预设账号（如 dashou）与打手档案的绑定及展示名 */
async function repairPresetServiceProviderAccounts(
  handlers: Handler[],
  adminUsers: AdminUser[],
  updateAdminUser: (id: string, patch: Partial<AdminUser>) => Promise<AdminUser | null>,
) {
  let changed = false;
  const handlerById = new Map(handlers.map((handler) => [handler.id, handler]));

  for (const user of adminUsers) {
    const handlerId = legacyHandlerIdForAdminUser(user);
    if (!handlerId) continue;

    const handler = handlerById.get(handlerId);
    const preset = legacyAdminPresetForHandler(handlerId);
    if (!handler || !preset) continue;

    const patch = buildServiceProviderAdminUserPatch(handler, user);
    if (user.handlerId !== handlerId) patch.handlerId = handlerId;

    if (Object.keys(patch).length) {
      await updateAdminUser(user.id, patch);
      changed = true;
    }
  }

  return changed;
}

/** 回填种子打手档案，并确保每个打手/陪玩档案有对应后台账号 */
export async function migrateHandlerLegacyProfiles() {
  const { hashPassword } = await import("../lib/password.js");
  const { formatDateTime } = await import("../lib/format-time.js");
  const {
    listHandlers,
    listAdminUsers,
    updateHandler,
    getAdminUser,
    updateAdminUser,
    insertAdminUser,
  } = await import("./index.js");

  let changed = await backfillEmptyHandlerProfiles(updateHandler);

  const handlers = await listHandlers();
  const adminUsers = await listAdminUsers();
  const now = formatDateTime();
  const deps = { now, hashPassword, getAdminUser, updateAdminUser, insertAdminUser };

  for (const handler of handlers) {
    if (await ensureAdminAccountForHandler(handler, adminUsers, deps)) {
      changed = true;
    }
  }

  if (await repairPresetServiceProviderAccounts(handlers, adminUsers, updateAdminUser)) {
    changed = true;
  }

  if (changed) {
    console.log("[meme-server] Handler profiles / backoffice accounts migrated");
  }
  return changed;
}
