import { PLATFORM_CLUB_ID } from "../constants/clubs.js";
import {
  createHandler,
  getClub,
  getHandler,
  listAdminUsers,
  listClubs,
  listHandlers,
  removeAdminUser,
  removeHandler,
  updateHandler,
} from "../db/index.js";
import { createEntity } from "../lib/create-entity.js";
import { buildServiceProviderAccountPayload } from "../lib/service-provider-role.js";
import { toAdminHandlerRow } from "../lib/mappers.js";
import { adminUserService } from "./admin-users.js";
import type { Handler } from "../types.js";

export const handlerService = {
  async list() {
    return listHandlers();
  },

  async getById(id: string) {
    return getHandler(id);
  },

  async create(input: Omit<Handler, "id"> & { id?: string }) {
    const club = await getClub(input.clubId || PLATFORM_CLUB_ID);
    if (!club) throw new Error("CLUB_NOT_FOUND");
    return createEntity({
      idPrefix: "h",
      existsError: "HANDLER_EXISTS",
      getById: getHandler,
      create: createHandler,
      input: {
        ...input,
        clubId: input.clubId || PLATFORM_CLUB_ID,
      },
    });
  },

  async createWithAccount(input: {
    handler: Omit<Handler, "id"> & { id?: string };
    account: { username: string; password: string; displayName?: string };
  }) {
    const handler = await this.create(input.handler);
    try {
      await adminUserService.create(buildServiceProviderAccountPayload(handler, input.account));
    } catch (err) {
      await removeHandler(handler.id);
      if (err instanceof Error && err.message === "ADMIN_USER_EXISTS") {
        throw new Error("ADMIN_USER_EXISTS");
      }
      throw err;
    }
    return handler;
  },

  async getAdminAccount(handlerId: string) {
    const users = await listAdminUsers();
    const user = users.find((row) => row.handlerId === handlerId);
    if (!user) return null;
    return { id: user.id, username: user.username, displayName: user.displayName };
  },

  async update(id: string, patch: Partial<Handler>) {
    if (patch.clubId) {
      const club = await getClub(patch.clubId);
      if (!club) throw new Error("CLUB_NOT_FOUND");
    }
    return updateHandler(id, patch);
  },

  async remove(id: string) {
    const adminUsers = await listAdminUsers();
    for (const user of adminUsers.filter((row) => row.handlerId === id)) {
      await removeAdminUser(user.id);
    }
    return removeHandler(id);
  },

  async listAdminRows(handlers: Handler[]) {
    const [clubs, adminUsers] = await Promise.all([listClubs(), listAdminUsers()]);
    const clubMap = new Map(clubs.map((club) => [club.id, club]));
    const adminByHandler = new Map(
      adminUsers
        .filter((user) => user.handlerId)
        .map((user) => [user.handlerId!, user]),
    );
    return handlers.map((handler) =>
      toAdminHandlerRow(handler, clubMap.get(handler.clubId), adminByHandler.get(handler.id)),
    );
  },

  async listDispatchable() {
    const [handlers, clubs] = await Promise.all([listHandlers(), listClubs()]);
    const enabledClubIds = new Set(clubs.filter((club) => club.enabled).map((club) => club.id));
    return handlers.filter((handler) => enabledClubIds.has(handler.clubId));
  },

  async listDispatchableRows() {
    const { adminPresenceService } = await import("./admin-presence.js");
    await adminPresenceService.pruneStale();
    const handlers = await this.listDispatchable();
    const rows = await this.listAdminRows(handlers);
    return rows.sort(
      (a, b) =>
        Number(b.online) - Number(a.online) ||
        a.name.localeCompare(b.name, "zh-CN"),
    );
  },
};
