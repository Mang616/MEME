import {
  createClub as dbCreateClub,
  getClub,
  listClubs,
  listHandlers,
  removeClub as dbRemoveClub,
  updateClub as dbUpdateClub,
} from "../db/index.js";
import {
  CLUB_KIND_LABELS,
  PLATFORM_CLUB_ID,
  defaultClubJoinedAt,
} from "../constants/clubs.js";
import { createEntity } from "../lib/create-entity.js";
import type { Club } from "../types.js";

export function toAdminClubRow(club: Club, handlerCount = 0) {
  return {
    id: club.id,
    name: club.name,
    kind: club.kind,
    kindLabel: CLUB_KIND_LABELS[club.kind],
    isPlatform: club.kind === "platform",
    contactName: club.contactName,
    contactPhone: club.contactPhone,
    description: club.description,
    enabled: club.enabled,
    joinedAt: club.joinedAt,
    handlerCount,
  };
}

export const clubService = {
  async list() {
    return listClubs();
  },

  async getById(id: string) {
    return getClub(id);
  },

  async create(input: Omit<Club, "id" | "joinedAt"> & { id?: string; joinedAt?: string }) {
    if (input.kind === "platform" && input.id !== PLATFORM_CLUB_ID) {
      throw new Error("INVALID_PLATFORM_CLUB");
    }
    return createEntity({
      idPrefix: "club",
      existsError: "CLUB_EXISTS",
      getById: getClub,
      create: dbCreateClub,
      input: {
        ...input,
        kind: input.kind ?? "partner",
        joinedAt: input.joinedAt ?? defaultClubJoinedAt(),
      },
    });
  },

  async update(id: string, patch: Partial<Omit<Club, "id">>) {
    if (id === PLATFORM_CLUB_ID && patch.kind && patch.kind !== "platform") {
      throw new Error("PLATFORM_CLUB_LOCKED");
    }
    return dbUpdateClub(id, patch);
  },

  async remove(id: string) {
    if (id === PLATFORM_CLUB_ID) {
      throw new Error("PLATFORM_CLUB_LOCKED");
    }
    const handlers = await listHandlers();
    if (handlers.some((handler) => handler.clubId === id)) {
      throw new Error("CLUB_HAS_HANDLERS");
    }
    return dbRemoveClub(id);
  },

  async listAdminRows() {
    const [clubs, handlers] = await Promise.all([listClubs(), listHandlers()]);
    return clubs.map((club) =>
      toAdminClubRow(club, handlers.filter((handler) => handler.clubId === club.id).length),
    );
  },

  async getAdminRowById(id: string) {
    const club = await getClub(id);
    if (!club) return null;
    const handlers = await listHandlers();
    return toAdminClubRow(club, handlers.filter((handler) => handler.clubId === id).length);
  },
};
