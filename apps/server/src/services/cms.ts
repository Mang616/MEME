import {
  createAnnouncement,
  createBanner,
  getAnnouncement,
  getBanner,
  getUser,
  listAnnouncements,
  listBanners,
  listUsers,
  removeAnnouncement,
  removeBanner,
  updateAnnouncement,
  updateBanner,
  updateUser,
} from "../db/index.js";
import { createEntity } from "../lib/create-entity.js";
import { formatDateTime } from "../lib/format-time.js";
import type { Announcement, AppUser, Banner } from "../types.js";

function isAnnouncementActive(item: Announcement, at = formatDateTime()) {
  if (!item.enabled) return false;
  if (item.startAt && item.startAt > at) return false;
  if (item.endAt && item.endAt < at) return false;
  return true;
}

export const userService = {
  async list() {
    return listUsers();
  },

  async getById(id: string) {
    return getUser(id);
  },

  async update(id: string, patch: Partial<Pick<AppUser, "nickname" | "phone" | "avatar" | "vipLevel" | "balance" | "status">>) {
    return updateUser(id, patch);
  },
};

export const bannerService = {
  async listPublished() {
    const items = await listBanners();
    return items.filter((banner) => banner.published);
  },

  async list() {
    return listBanners();
  },

  async getById(id: string) {
    return getBanner(id);
  },

  async create(input: Omit<Banner, "id"> & { id?: string }) {
    return createEntity({
      idPrefix: "b",
      existsError: "BANNER_EXISTS",
      getById: getBanner,
      create: createBanner,
      input,
    });
  },

  async update(id: string, patch: Partial<Banner>) {
    return updateBanner(id, patch);
  },

  async remove(id: string) {
    return removeBanner(id);
  },
};

export const announcementService = {
  async listActive(placement?: Announcement["placement"]) {
    const items = await listAnnouncements();
    return items.filter(
      (item) => isAnnouncementActive(item) && (!placement || item.placement === placement),
    );
  },

  async list() {
    return listAnnouncements();
  },

  async getById(id: string) {
    return getAnnouncement(id);
  },

  async create(input: Omit<Announcement, "id"> & { id?: string }) {
    return createEntity({
      idPrefix: "a",
      existsError: "ANNOUNCEMENT_EXISTS",
      getById: getAnnouncement,
      create: createAnnouncement,
      input,
    });
  },

  async update(id: string, patch: Partial<Announcement>) {
    return updateAnnouncement(id, patch);
  },

  async remove(id: string) {
    return removeAnnouncement(id);
  },
};
